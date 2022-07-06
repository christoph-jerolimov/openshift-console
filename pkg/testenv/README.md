# test-env

To start the backend with a test environment instead of a real cluster,
you need to download the kubernetes apiserver.

Just once to download the binaries:

```
go install sigs.k8s.io/controller-runtime/tools/setup-envtest@latest
```

When you open a new terminal (setup-envtest use will automatically download a kube-apiserver, etcd and kubectl binary):

```
export KUBEBUILDER_ASSETS=`~/go/bin/setup-envtest use 1.21 -p path`
```

After that you can run:

```
./bin/bridge --test-env 'test-env/openshift/project.yaml'
```

More on https://book.kubebuilder.io/reference/envtest.html
