package testenv

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"

	"k8s.io/klog"
)

func organizeFiles(files []string, crds []string, otherResources []string) (crdFiles []string, otherResourceFiles []string) {
	for _, filename := range files {
		if filename == "" {
			continue
		}
		lowercaseFilename := strings.ToLower(filename)
		if strings.HasSuffix(lowercaseFilename, "-crd.json") ||
			strings.HasSuffix(lowercaseFilename, "-crd.yaml") ||
			strings.HasSuffix(lowercaseFilename, "-crd.yml") ||
			strings.HasSuffix(lowercaseFilename, "-crds.json") ||
			strings.HasSuffix(lowercaseFilename, "-crds.yaml") ||
			strings.HasSuffix(lowercaseFilename, "-crds.yml") {
			klog.Infof(" - %s", filename)
			crds = append(crds, filename)
		} else if strings.HasSuffix(lowercaseFilename, ".json") ||
			strings.HasSuffix(lowercaseFilename, ".yaml") ||
			strings.HasSuffix(lowercaseFilename, ".yml") ||
			strings.HasSuffix(lowercaseFilename, ".js") ||
			strings.HasSuffix(lowercaseFilename, ".ts") {
			klog.Infof(" - %s", filename)
			otherResources = append(otherResources, filename)
		} else if isDirectory(filename) {
			files, err := ioutil.ReadDir(filename)
			if err != nil {
				klog.Fatal(err)
			}
			temp := []string{}
			for _, f := range files {
				temp = append(temp, fmt.Sprintf("%s/%s", filename, f.Name()))
			}
			return organizeFiles(temp, crds, otherResources)
		} else {
			klog.Fatalf("Unsupported test environment configuration: %s", filename)
			os.Exit(1)
		}
	}
	return crds, otherResources
}

func Setup(testEnvFiles []string, flags *flag.FlagSet) {
	klog.Infoln("Test environment enabled. Will automatically load this files: ")
	crdFiles, otherResourceFiles := organizeFiles(testEnvFiles, []string{}, []string{})
	StartTestEnvironment(crdFiles, flags)
	StartTsNode(otherResourceFiles)
}

func StartTsNode(resourceWatcherFiles []string) {
	if len(resourceWatcherFiles) == 0 {
		return
	}

	testEnvFramework := getenv("TEST_ENV_FRAMEWORK_HOME", "test-env/test-env-framework")
	tsNode := testEnvFramework + "/node_modules/.bin/ts-node"
	tsNodeArgs := []string{
		testEnvFramework + "/cli",
		"--api-server",
		"http://127.0.0.1:8092",
		"--resources",
		strings.Join(resourceWatcherFiles, ","),
	}

	if !fileExists(tsNode) {
		klog.Errorf("%s not found", tsNode)
		klog.Infof("Please run:\n\ncd %s\nyarn install", testEnvFramework)
		os.Exit(1)
	}

	klog.Infof("Starting %s %s...", tsNode, strings.Join(tsNodeArgs, " "))
	cmd := exec.Command(tsNode, tsNodeArgs...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	go func() {
		tsNodeError := cmd.Run()

		klog.Infof("Done!")

		if tsNodeError != nil {
			klog.Infof("ts-node failed: %v", tsNodeError)
		}
	}()
}
