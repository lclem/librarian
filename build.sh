#!/bin/bash

SECONDS=0

echo "starting indexer"
python3 ./scripts/indexer.py > /dev/null

echo "starting pelican"
pelican

echo "compute library size"
du -hs ./library | cut -d'.' -f1 > ./docs/size.txt

duration=$SECONDS
echo "$(($duration / 60))m$(($duration % 60))s" > ./docs/elapsed.txt
