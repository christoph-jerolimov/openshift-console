#!/bin/bash

TEST_ENV_FRAMEWORK_HOME=test-env-framework

TS_NODE="$TEST_ENV_FRAMEWORK_HOME/node_modules/.bin/ts-node"
CLI="$TEST_ENV_FRAMEWORK_HOME/cli"

"$TS_NODE" "$CLI" openshift/deploymentconfig.ts
