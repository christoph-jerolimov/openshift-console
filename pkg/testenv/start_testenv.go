package testenv

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"flag"
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"

	"k8s.io/client-go/rest"
	"k8s.io/klog"
	"sigs.k8s.io/controller-runtime/pkg/envtest"
)

type ManglerConfig struct {
	TLS rest.TLSClientConfig
}

type Mangler struct {
	URL    *url.URL
	Config *rest.Config
}

func NewMangler(cfg *rest.Config) *Mangler {
	m := &Mangler{
		Config: cfg,
	}
	return m
}

func (m *Mangler) modifier(request *http.Request) {
	klog.Infof("Proxy request: %v\n", request.URL.Path)

	// fmt.Printf("\n\n%v\n\n", request)
	murl, _ := url.Parse(m.Config.Host)
	request.URL.Host = murl.Host
	request.URL.Scheme = murl.Scheme

	request.Host = murl.Host
	// fmt.Printf("\n\n%v\n\n", request)
}

func StartTestEnvironment(crdFiles []string, flags *flag.FlagSet) {
	testEnvironment := &envtest.Environment{
		ErrorIfCRDPathMissing: true,
		CRDDirectoryPaths:     crdFiles,
	}
	// TODO find a way to configure the testEnvironment kube-apiserver listener port

	klog.Infof("Start kubernetes test environment")
	klog.Infof("  ErrorIfCRDPathMissing: %v", testEnvironment.ErrorIfCRDPathMissing)
	klog.Infof("  CRDDirectoryPaths: %v", testEnvironment.CRDDirectoryPaths)

	cfg, err := testEnvironment.Start()

	if err != nil {
		klog.Error(err)
		os.Exit(127)
	}

	os.WriteFile("/tmp/cert.cert", cfg.TLSClientConfig.CertData, 0664)
	os.WriteFile("/tmp/ca.cert", cfg.TLSClientConfig.CAData, 0664)
	os.WriteFile("/tmp/key.key", cfg.TLSClientConfig.KeyData, 0664)

	mangler := NewMangler(
		cfg,
	)

	cert, err := tls.X509KeyPair(cfg.TLSClientConfig.CertData, cfg.TLSClientConfig.KeyData)
	if err != nil {
		klog.Error("KEYPAIR ERROR", err)
		os.Exit(127)
	}

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(cfg.TLSClientConfig.CAData)

	proxy := httputil.ReverseProxy{
		Director: mangler.modifier,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				RootCAs:      caCertPool,
				Certificates: []tls.Certificate{cert},
			},
		},
	}
	proxyServer := http.Server{Handler: &proxy}
	proxyListenAddr := "127.0.0.1:"
	if !isCI() {
		proxyListenAddr = "127.0.0.1:8092"
	}
	proxyListener, err := net.Listen("tcp", proxyListenAddr)
	if err != nil {
		klog.Error("PROXY ERROR", err)
		os.Exit(127)
	}
	go func() {
		proxyServer.Serve(proxyListener)
	}()

	apiServerUrl := testEnvironment.Config.Host
	proxyServerUrl := fmt.Sprintf("http://%s/", proxyListener.Addr().String())
	frontendListenUrl := "http://127.0.0.1:9091"
	if !isCI() {
		frontendListenUrl = "http://0.0.0.0:9091"
	}

	klog.Infof("  API server (requires auth)      : %v", apiServerUrl)
	klog.Infof("  Proxy server (no auth is needed): %v", proxyServerUrl)
	klog.Infof("  Console UI will run on          : %v", frontendListenUrl)
	// klog.Infof("Bearer token.. %v", testEnvironment.Config.BearerToken)
	// klog.Infof("Config..       %v", testEnvironment.Config)

	// Configure bridge
	klog.Warning("Automatically reconfigure bridge in test-env mode: Disable auth and use proxied k8s endpoint!")
	flags.Set("listen", frontendListenUrl)
	flags.Set("user-auth", "disabled")
	flags.Set("k8s-mode", "off-cluster")
	flags.Set("k8s-mode-off-cluster-endpoint", proxyServerUrl)
	flags.Set("k8s-auth", "bearer-token")
	flags.Set("k8s-auth-bearer-token", "ignored-by-proxy")

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)

	go func() {
		for sig := range c {
			klog.Infof("%v", sig)
			klog.Infof("Shutdown proxy server...")
			proxyServer.Shutdown(context.Background())
			klog.Infof("Shutdown test-env...")
			testEnvironment.Stop()
			os.Exit(0)
		}
	}()
}
