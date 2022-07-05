#!/bin/bash

if [ "$port" = "" ]; then
    echo "Usage:"
    echo "port=12345 $0"
    exit 1
fi

kubectl \
    --server "https://127.0.0.1:$port" \
    --client-certificate "/tmp/cert.cert" \
    --client-key "/tmp/key.key" \
    --certificate-authority "/tmp/ca.cert" \
    create -f "pod-example.yaml"
