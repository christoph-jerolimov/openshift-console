package testenv

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"k8s.io/klog"
)

func isDirectory(path string) bool {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return false
	}

	return fileInfo.IsDir()
}

func organizeFiles(files []string, files1 []string, files2 []string) (crdFiles []string, resourceWatcherFiles []string) {
	for _, filename := range files {
		if filename == "" {
			continue
		}
		lowercaseFilename := strings.ToLower(filename)
		if strings.HasSuffix(lowercaseFilename, ".yaml") || strings.HasSuffix(lowercaseFilename, ".yml") {
			klog.Infof(" - %s\n", filename)
			files1 = append(files1, filename)
		} else if strings.HasSuffix(lowercaseFilename, ".js") || strings.HasSuffix(lowercaseFilename, ".ts") {
			klog.Infof(" - %s\n", filename)
			files2 = append(files2, filename)
		} else if isDirectory(filename) {
			files, err := ioutil.ReadDir(filename)
			if err != nil {
				klog.Fatal(err)
			}
			temp := []string{}
			for _, f := range files {
				temp = append(temp, f.Name())
			}
			return organizeFiles(temp, files1, files2)
		} else {
			klog.Fatalf("Unsupported test environment configuration: %s", filename)
			os.Exit(1)
		}
	}
	return files1, files2
}

func Setup(files []string, flags *flag.FlagSet) {
	klog.Infoln("Test environment enabled. Will automatically load this files: ")
	crdFiles := []string{}
	resourceWatcherFiles := []string{}
	crdFiles, resourceWatcherFiles = organizeFiles(files, crdFiles, resourceWatcherFiles)
	StartTestEnvironment(crdFiles, flags)
	// Set bridge configuration flags so that the bridge automatically use the test-env

	fmt.Printf("Resource watcher files: %v\n", resourceWatcherFiles)

}
