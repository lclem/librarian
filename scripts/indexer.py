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
 
argparser = argparse.ArgumentParser(description="indexer", formatter_class=argparse.ArgumentDefaultsHelpFormatter)
argparser.add_argument("--build-covers", action="store_true", help="build book JPEG covers")
args = argparser.parse_args()
config = vars(args)
print(config)

@contextlib.contextmanager
def pushd(new_dir):
    previous_dir = os.getcwd()
    os.chdir(new_dir)
    try:
        yield
    finally:
        os.chdir(previous_dir)

substitutions = {
    r"\\relax\s*": "",
    r"\\`\s*a": "à",
    r"\\'\s*a": "á",
    r"\\'\s*A": "Á",
    r"\\=\s*a": "ā",
    r"(\\~|\\\\textasciitilde)\s*a": "ã",
    r"\\u\s*a": "ă",
    r'\\"\s*a': "ä",
    r'\\"\s*A': "Ä",
    r"\\\^\s*a": "â",
    r"\\u\s*a": "ă",
    r'\\k\s*a': "ą",
    r'\\c\s*a': "ą",
    r'\\aa': "å",
    r'\\ae': "æ",
    r'\\AE': "Æ",
    r"\\ss": "ß",
    r"\\v\s*c": "č",
    r"\\v\s*C": "Č",
    r"\\'\s*c": "ć",
    r"\\'\s*C": "Ć",
    r"\\c\s*c": "ç",
    r"\\c\s*C": "Ç",
    r"\\dj": "đ",
    r"\\DJ": "Đ",
    r"\\'\s*e": "é",
    r"\\'\s*E": "É",
    r"\\`\s*e": "è",
    r"\\\^\s*e": "",
    r"\\k\s*e": "ę",
    r"\\c\s*e": "ȩ",
    r'\\"\s*e': "ë",
    r"\\v\s*e": "ě",
    r"\\u\s*g": "ğ",
    r"\\'\s*(\\)?i": "í",
    r"\\\^\s*(\\)?i": "î",
    r'\\"\s*(\\)?i': "ï",
    r"\\'\s*I": "Í",
    r"\\l": "ł",
    r"\\L": "Ł",
    r'\\"\s*o': "ö",
    r'\\"\s*O': "Ö",
    r"\\'\s*o": "ó",
    r"\\'\s*O": "Ó",
    r"\\\^\s*o": "ô",
    r"\\H\s*o": "ő",
    r"(\\~|\\\\textasciitilde)\s*o": "õ",
    r"(\\~|\\\\textasciitilde)\s*O": "Õ",
    r"\\o": "ø",
    r'\\oe': "œ",
    r'\\OE': "Œ",
    r"(\\~|\\\\textasciitilde)\s*n": "ñ",
    r"\\'\s*n": "ń",
    r"\\v\s*n": "ň",
    r"\\v\s*r": "ř",
    r"\\v\s*R": "Ř",
    r"\\'\s*s": "ś",
    r"\\'\s*S": "Ś",
    r"\\v\s*s": "š",
    r"\\v\s*S": "Š",
    r"\\c\s*s": "ş",
    r"\\c\s*S": "Ş",
    r"\\c\s*t": "ţ",
    r"\\c\s*T": "Ţ",
    r'\\"\s*u': "ü",
    r'\\"\s*U': "Ü",
    r"\\`\s*u": "ù",
    r"\\'\s*u": "ú",
    r"(\\~|\\\\textasciitilde)\s*u": "ũ",
    r"\\r\s*u": "ů",
    r"\\\^\s*u": "û",
    r"\\'\s*y": "ý",
    r"\\.\s*z": "ż",
    r"\\v\s*z": "ž",
    r"\\v\s*Z": "Ž"
}

valid_characters = string.ascii_letters + string.digits + string.whitespace + '&+-<>*=^~`-,;:\'"./\\()[]ễ' + "".join(substitutions.values())

def sanitise(str):
    result = "".join(c for c in str if c in valid_characters)
    return result.encode('utf-8').decode("utf-8", "ignore")

def normalise_names_order(author):
    names = author.split(", ")
    names = names[1:] + [names[0]]
    names = " ".join(names)

    return names

def normalise(str):

    # orig = str
    str = re.sub(r"\s+", " ", str)
    str = sanitise(str)

    for key, value in substitutions.items():
        # str = str.replace(key, value)
        str = re.sub(key, value, str)

    # print(f"normalise {orig} => {str}\n")
    return str

def getValue(dict, key, default):
    if key in dict:
        return dict[key].value.strip()
    else:
        return default

def writeBib(entry, bibFile):
    library = parser.Library([entry])
    parser.write_file(bibFile, library)
    print(f"GITADD {bibFile}")
    subprocess.run(["git", "add", bibFile])

def parsebib(bibFile):
    library = parser.parse_file(bibFile)

    result = []
    for entry in library.entries:
        fields = entry.fields_dict

        key = entry.key
        key = key.encode('utf-8').decode("ascii", "ignore")
        
        fields =  {k.lower(): v for k, v in fields.items()}

        title = getValue(fields, "title", "N/A")
        title = normalise(title)

        year = getValue(fields, "year", "0")

        author = getValue(fields, "author", "N/A")
        author = normalise(author)
        authors = author.split(" and ")

        for i in range(0, len(authors)):
            authors[i] = normalise_names_order(authors[i])

        date_added = getValue(fields, 'date-added', "")
        date_modified = getValue(fields, 'date-modified', "")

        volume = getValue(fields, 'volume', "")

        url = getValue(fields, 'url', "")
        doi = getValue(fields, 'doi', "")

        if doi != "" and not doi.startswith("http"):
            doi = mkDoiUrl(doi)

        result.append((entry, key, authors, title, year, volume, date_added, date_modified, doi, url))

    return result

def mkDoiUrl(doi):
    return f"https://dx.doi.org/{doi}"

def remove_prefix(input_string, prefix):
    if prefix and input_string.startswith(prefix):
        return input_string[len(prefix):]
    return input_string

errors = 0
i = 0

for root, dirs, files in os.walk("./library/entries"):
    for dir in dirs:
        cwd = os.path.join(root, dir)
        with pushd(cwd):
            print(f"CWD {dir} - {os.getcwd()}")
            for _, _, files in os.walk("./"):
                for file in files:
                    if file.endswith(".bib") and not file.startswith("._"):
                        bibFile = file # os.path.join(root, file)
                        print(f"FILE {bibFile}")

                        text_file = open(bibFile, "r", encoding='utf-8')
                        bibcontent = text_file.read().strip()
                        text_file.close()

                        biblines = bibcontent.split("\n")
                        for j in range(0, len(biblines)):
                            biblines[j] = "    " + biblines[j]

                        bibcontent = "\n".join(biblines)
                        parseResults = parsebib(bibFile)

                        if parseResults == []:
                            errors = errors + 1

                        for bibEntry in parseResults:

                            entry, key, authors, title, year, volume, date_added, date_modified, doi, url = bibEntry
                            print(f"BIB {authors} - {title}")

                            doiNoURL = doi

                            if doiNoURL != "":
                                doiNoURL = remove_prefix(doiNoURL, "https://dx.doi.org/")
                                doiNoURL = remove_prefix(doiNoURL, "https://doi.org/")
                                doiNoURL = remove_prefix(doiNoURL, "http://dx.doi.org/")
                                doiNoURL = remove_prefix(doiNoURL, "http://doi.org/")

                            pdfFiles = []
                            pdfFilesBase = []
                            epubFiles = []
                            epubFilesBase = []
                            djvuFiles = []

                            for attachment in os.listdir("./"):
                                if not attachment.startswith("._"):
                                    if attachment.endswith(".pdf"):
                                        print(f"PDF {attachment}")
                                        pdfFiles.append(os.path.join(cwd, attachment))
                                        pdfFilesBase.append(attachment)
                                    elif attachment.endswith(".epub"):
                                        print(f"EPUB {attachment}")
                                        epubFiles.append(os.path.join(cwd, attachment))
                                        epubFilesBase.append(attachment)
                                    elif attachment.endswith(".djvu"):
                                        print(f"DJVU {attachment}")
                                        djvuFiles.append(os.path.join(cwd, attachment))
                                    
                            if len(pdfFiles) == 1:
                                    pdfFiles_str = f'Pdffile: {pdfFiles[0]}\n'
                            elif len(pdfFiles) > 1:
                                pdfFiles_str = ""
                                for pdfFile in pdfFiles:
                                    pdfFiles_str += f'Pdffiles: {pdfFile}\n'

                            if len(epubFiles) == 1:
                                    epubFiles_str = f'Epubfile: {epubFiles[0]}\n'
                            elif len(epubFiles) > 1:
                                epubFiles_str = ""
                                for epubFile in epubFiles:
                                    epubFiles_str += f'Epubfiles: {epubFile}\n'

                            if len(djvuFiles) == 1:
                                    djvuFiles_str = f'Djvufile: {djvuFiles[0]}\n'
                            elif len(djvuFiles) > 1:
                                djvuFiles_str = ""
                                for djvuFile in djvuFiles:
                                    djvuFiles_str += f'Djvufiles: {djvuFile}\n'

                            if not "cover.jpg" in os.listdir("./") and args.build_covers:
                                if len(epubFilesBase) > 0:
                                    epubFile = epubFilesBase[0]
                                    print(f"GEN EPUB COVER: {epubFile}")
                                    try:
                                        generate_cover(epubFile, "cover.jpg", 800)
                                    except Exception as e:
                                        print(f"EXCEPT: {e}")
                                elif len(pdfFilesBase) > 0 and distutils.spawn.find_executable("convert"):
                                    pdfFile = pdfFilesBase[0]
                                    # convert first page of PDF to cover
                                    print(f"GEN EPUB COVER: {pdfFile}")
                                    try:
                                        params = ['convert', '-density', '300', '-quality', 'JPEG', '-resize', '600x800', f'{pdfFile}[0]', 'cover.jpg']
                                        subprocess.check_call(params)
                                    except Exception as e:
                                        print(f"EXCEPT: {e}")

                            mdfile = os.path.join("", f"entry-{i}.md")

                            NEWLINE = "\n"
                            markdown = f"\
Title: {title}\n\
Year: {year}\n\
Authors: {'; '.join(authors)}\n\
Rootfolder: {cwd}\n\
Bibfile: {os.path.join(cwd, bibFile)}\n\
Mdfile: {os.path.join(cwd, mdfile)}\n\
{'Volume: ' + volume + NEWLINE if volume != '' else ''}\
{'Date: ' + date_added + NEWLINE if date_added != '' else ''}\
{'Modified: ' + date_modified + NEWLINE if date_modified != '' else ''}\
{'thedoiurl: ' + doi + NEWLINE if doi != '' else ''}\
{'doi: ' + doiNoURL + NEWLINE if doiNoURL != '' else ''}\
{'theurl: ' + url + NEWLINE if url != '' else ''}\
{'cover: ' + os.path.join(dir, 'cover.jpg') + NEWLINE if 'cover.jpg' in os.listdir('./') else ''}\
Key: {key}\n\
Slug: {doiNoURL if doiNoURL != '' else key}\n\
engine: knitr\n"

                            if not len(pdfFiles) == 0:
                                markdown += pdfFiles_str

                            if not len(epubFiles) == 0:
                                markdown += epubFiles_str

                            if not len(djvuFiles) == 0:
                                markdown += djvuFiles_str

                            if "cover.jpg" in os.listdir("./"):
                                markdown += "\n![cover]({attach}cover.jpg)\n"

                            markdown += "\n"
                            markdown += f"\
    :::bibtex\n\
{bibcontent}\n\
\n\
<bib id=\"bib\">\
{bibcontent}\
</bib>\n"
                            
                            text_file = open(mdfile, "w")
                            text_file.write(markdown)
                            text_file.close()

                            i = i + 1

print(f"PROCESSED {i}")
print(f"ERRORS {errors}")
