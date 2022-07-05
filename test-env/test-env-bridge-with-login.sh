#!/bin/bash

echo
echo Does not work yet!
echo

BRIDGE=./bin/bridge
#BRIDGE=~/go/bin/gow run github.com/openshift/console/cmd/bridge 

# Custom base address
export BRIDGE_LISTEN="http://localhost:9093"

# Use test-env k8s api
export BRIDGE_K8S_AUTH="openshift"
export BRIDGE_USER_AUTH="openshift"
export BRIDGE_K8S_MODE="off-cluster"
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT="https://127.0.0.1:37277/"

# OAuth (from multicluster-environment.sh)
OAUTH_CLIENT_ID=${OAUTH_CLIENT_ID:=local-console-oauth-client}
OAUTH_CLIENT_SECRET=${OAUTH_CLIENT_SECRET:=open-sesame}
CA_FILE_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'bridge-ca-files')

export BRIDGE_USER_AUTH_OIDC_CLIENT_ID="$OAUTH_CLIENT_ID"
export BRIDGE_USER_AUTH_OIDC_CLIENT_SECRET="$OAUTH_CLIENT_SECRET"
export BRIDGE_USER_AUTH_OIDC_CA_FILE="$CA_FILE_DIR/oauth-ca.crt"

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
