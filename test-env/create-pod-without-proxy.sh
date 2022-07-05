#!/bin/bash

kubectl \
    --server "http://127.0.0.1:8090" \
    create -f "pod-example.yaml"
