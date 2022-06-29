package testenv

import (
	"os"
	"strings"

	"k8s.io/klog"
)

func Setup(files []string) {
	klog.Infoln("Test environment enabled. Will automatically load this files:")
	for _, filename := range files {
		lowercaseFilename := strings.ToLower(filename)
		if strings.HasSuffix(lowercaseFilename, ".yaml") || strings.HasSuffix(lowercaseFilename, ".yml") {
			klog.Infof(" - %s\n", filename)
		} else if strings.HasSuffix(lowercaseFilename, ".js") || strings.HasSuffix(lowercaseFilename, ".ts") {
			klog.Infof(" - %s\n", filename)
		} else {
			klog.Fatalf("Unsupported test environment configuration: %s", filename)
			os.Exit(1)
		}
	}

	StartTestEnvironment()
	// Set bridge configuration flags so that the bridge automatically use the test-env
}
