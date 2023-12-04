#!/bin/bash

find . -mindepth 2 -type f -name cover.jpg -size +1M | wc -l
