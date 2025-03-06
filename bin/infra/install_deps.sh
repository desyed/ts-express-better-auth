#!/usr/bin/env bash

pushd bin/infra/ || exit 1
pip install -r requirements.txt

popd || exit 1
