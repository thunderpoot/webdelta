#!/usr/bin/env bash

esbuild ./webdelta.js --outfile=../dist/webdelta.js
esbuild ./webdelta.js --outfile=../dist/webdelta.min.js --minify
