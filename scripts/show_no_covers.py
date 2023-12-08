#!/usr/bin/python3

import os
import contextlib
import bibtexparser as parser
import string
import subprocess
import re
import distutils.spawn

from epub_thumbnailer import generate_cover

import argparse
 
# argparser = argparse.ArgumentParser(description="indexer", formatter_class=argparse.ArgumentDefaultsHelpFormatter)
# argparser.add_argument("--build-covers", action="store_true", help="build book JPEG covers")
# args = argparser.parse_args()
# config = vars(args)
# print(config)

@contextlib.contextmanager
def pushd(new_dir):
    previous_dir = os.getcwd()
    os.chdir(new_dir)
    try:
        yield
    finally:
        os.chdir(previous_dir)

i = 0

for root, dirs, files in os.walk("./library/entries"):
    for dir in dirs:
        cwd = os.path.join(root, dir)
        with pushd(cwd):
            # print(f"CWD {dir} - {os.getcwd()}")
            for _, _, files in os.walk("./"):
                for bibFile in files:
                    if bibFile.endswith(".bib") and not bibFile.startswith("._"):
                        # print(f"FILE {bibFile}")

                        if not "cover.jpg" in os.listdir("./"):
                            print(f"NO COVER {root}/{dir}")

                        i = i + 1

print(f"PROCESSED {i}")