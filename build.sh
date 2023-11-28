#!/bin/bash

echo "starting builder"

ls -la

echo "starting indexer"
python3 ./scripts/indexer.py

echo "starting pelican"
pelican