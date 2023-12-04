#!/usr/bin/python3

import sys, subprocess
import distutils.spawn

from epub_thumbnailer import generate_cover

# import argparse
 
# argparser = argparse.ArgumentParser(description="indexer", formatter_class=argparse.ArgumentDefaultsHelpFormatter)
# argparser.add_argument("--build-covers", action="store_true", help="build book JPEG covers")
# args = argparser.parse_args()
# config = vars(args)
# print(config)

file = sys.argv[1]

if file.endswith('.epub'):
    epubFile = file
    print(f"GEN EPUB COVER: {epubFile}")
    try:
        if generate_cover(epubFile, "cover.jpg", 800):
            print(f"OK")
        else:
            print(f"FAIL")
    except Exception as e:
        print(f"EXCEPT: {e}")
elif file.endswith('.pdf'):

    if distutils.spawn.find_executable("convert"):
        pdfFile = file
        # convert first page of PDF to cover
        print(f"GEN EPUB COVER: {pdfFile}")
        try:
            params = ['convert', '-density', '300', '-quality', 'JPEG', '-resize', '600x800', f'{pdfFile}[0]', 'cover.jpg']
            subprocess.check_call(params)
        except Exception as e:
            print(f"EXCEPT: {e}")
    else:
        print(f"NOT FOUND convert")
else:
    print(f"NOT FOUND {file}")