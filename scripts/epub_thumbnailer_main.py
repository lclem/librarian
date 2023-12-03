#!/usr/bin/env python3

import sys
from epub_thumbnailer import generate_cover

# Which file are we working with?
input_file = sys.argv[1]
# Where do does the file have to be saved?
output_file = sys.argv[2]
# Required size?
size = int(sys.argv[3])

if generate_cover(input_file, output_file, size):
    exit(0)
else:
    exit(1)