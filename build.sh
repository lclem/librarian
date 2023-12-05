#!/bin/bash

SECONDS=0

echo "starting indexer"
python3 ./scripts/indexer.py > /dev/null

echo "compute library size"
du -hs ./library | cut -d'.' -f1 | xargs | tr -d '\n' > ./themes/bootstrap2/templates/size.txt

echo "starting pelican"
pelican

duration=$SECONDS
echo "$(($duration / 60))m$(($duration % 60))s" > ./docs/elapsed.txt