from datetime import datetime
import pytz
# import os

TIMEZONE = 'Europe/Paris'
BUILD_TIME = datetime.now(pytz.timezone(TIMEZONE))
# LIBRARY_SIZE = 

AUTHOR = 'LC'
SITENAME = "librarian"
SITESUBTITLE = 'a book library'
SITEURL = 'https://lclem.github.io/librarian'
TIMEZONE = "Europe/Paris"

THEME = 'themes/bootstrap2'
OUTPUT_PATH = 'docs'
PATH = 'library'

# can be useful in development, but set to False when you're ready to publish
# RELATIVE_URLS = True
RELATIVE_URLS = False

STORK_INPUT_OPTIONS = {
    "html_selector": "nobr",
    # "url_prefix" : ""
    "url_prefix": "/librarian"
}

PORT = 8800
# BIND = "192.168.0.15"

LOAD_CONTENT_CACHE = False

GITHUB_URL = 'https://github.com/lclem/librarian'
GITHUB_VIEW_URL = GITHUB_URL + '/tree/main'
GITHUB_BLOB_URL = GITHUB_URL + '/blob/main'
GITHUB_EDIT_URL = GITHUB_URL + '/edit/main'
REVERSE_CATEGORY_ORDER = True
LOCALE = 'en_US.UTF-8'
DEFAULT_PAGINATION = 12
DEFAULT_DATE = (2012, 3, 2, 14, 1, 1)

FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

FEED_ALL_RSS = 'feeds/all.rss.xml'
# CATEGORY_FEED_RSS = 'feeds/{slug}.rss.xml'

# STORK_INPUT_OPTIONS = {
#     base_directory: 'output'
# }

MENUITEMS = [
        ('no pdf', STORK_INPUT_OPTIONS["url_prefix"] + '/nopdf.html'),
        ('bad author', STORK_INPUT_OPTIONS["url_prefix"] +'/authors_bad.html'),
        ('no cover', STORK_INPUT_OPTIONS["url_prefix"] + '/nocover.html')]

SLUGIFY_SOURCE = "basename"
DISPLAY_CATEGORIES_ON_MENU = False
DISPLAY_PAGES_ON_MENU = True

NEWEST_FIRST_ARCHIVES = True

# static paths will be copied without parsing their contents
STATIC_PATHS = [
    # 'images',
    # 'extra/robots.txt',
    ]

# there is no other HTML content
READERS = {'html': None}

# code blocks with line numbers
PYGMENTS_RST_OPTIONS = {'linenos': 'table'}

# ARTICLE_URL = 'posts/{date:%Y}/{date:%m}/{slug}/'
# ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%m}/{slug}/index.html'

ARTICLE_URL = 'articles/{slug}/'
ARTICLE_SAVE_AS = 'articles/{slug}/index.html'

PAGE_URL = 'pages/{slug}/'
PAGE_SAVE_AS = 'pages/{slug}/index.html'

#List of templates that are used directly to render content. Typically direct templates are used to generate index pages for collections of content (e.g., category and tag index pages). If the author, category and tag collections are not needed, set DIRECT_TEMPLATES = ['index', 'archives']
DIRECT_TEMPLATES = ['author', 'archives', 'authors_bad', 'nopdf', 'home', 'nocover'] # 'index', 
PAGINATED_TEMPLATES = {'home': 12, 'nopdf': None} # 'index' : 20, 
#A mapping containing template pages that will be rendered with the blog entries.
#If you want to generate custom pages besides your blog entries, you can point any Jinja2 template file with a path pointing to the file and the destination path for the generated file.
#For instance, if you have a blog with three static pages — a list of books, your resume, and a contact page — you could have:
TEMPLATE_PAGES = {'index.html': 'home.html', 'nopdf.html': 'nopdf.html', 'nocover.html': 'nocover.html', "authors.html": "authors.html", "authors_bad.html": "authors_bad.html"}