#!/bin/bash

echo
echo Does not work yet!
echo

BRIDGE=../bin/bridge
#BRIDGE=~/go/bin/gow run github.com/openshift/console/cmd/bridge 

# Custom base address
export BRIDGE_LISTEN="http://localhost:9092"

# Use test-env k8s api
export BRIDGE_USER_AUTH="disabled"
export BRIDGE_K8S_MODE="off-cluster"
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT="https://127.0.0.1:41523/"
export BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true

export BRIDGE_K8S_AUTH="bearer-token"

CLIENT_CERT_FILE="/tmp/cert.cert"
CLIENT_KEY_FILE="/tmp/key.key"
CA_FILE="/tmp/ca.cert"
export BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc --server "$BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT" --client-certificate "$CLIENT_CERT_FILE" --client-key "$CLIENT_KEY_FILE" --certificate-authority "$CA_FILE" whoami --show-token)

#export BRIDGE_CA_FILE="$CA_FILE"

# Enable test-env and import yaml files and start watchers
BRIDGE_TEST_ENV=""
BRIDGE_TEST_ENV="$BRIDGE_TEST_ENV,test-env/openshift/project.yaml"
BRIDGE_TEST_ENV="$BRIDGE_TEST_ENV,test-env/openshift/deploymentconfig.ts"
export BRIDGE_TEST_ENV

echo $BRIDGE_TEST_ENV

# Test env kubebuilder assets
export KUBEBUILDER_ASSETS=`~/go/bin/setup-envtest use 1.21 -p path`

cd ..
$BRIDGE
