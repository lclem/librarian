FROM wbond/pi-github-runner-base

SHELL ["/bin/bash", "-c"]

RUN sudo apt-get update

RUN sudo apt-get install -y apt-utils

RUN sudo apt-get install -y \
    python3-dev \
    python3-pip \
    python3-coverage \
    python \
    python-dev \
    python-coverage

RUN sudo apt install cargo -y
RUN sudo apt install pkg-config -y
RUN sudo apt-get install libssl-dev -y

# ARG RUSTUP_IO_THREADS=1
# RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
# RUN echo HOME: "$HOME"
# RUN source "$HOME/.cargo/env"

RUN cargo install stork-search --locked
RUN pip3 install bibtexparser==2.0.0b3 "pelican[markdown]" pelican-search markdown requests BeautifulSoup4 typogrify
RUN sudo apt-get install -y python3-setuptools libtiff5-dev libjpeg8-dev libopenjp2-7-dev zlib1g-dev \
    libfreetype6-dev liblcms2-dev libwebp-dev tcl8.6-dev tk8.6-dev python3-tk \
    libharfbuzz-dev libfribidi-dev libxcb1-dev meson
RUN python3 -m pip install --upgrade defusedxml olefile
RUN pip3 install Pillow

RUN sudo apt-get install -y ghostscript imagemagick
RUN sudo sed -i '/disable ghostscript format types/,+6d' /etc/ImageMagick-6/policy.xml
RUN sudo sed -i '/1GiB/c\<policy domain="resource" name="disk" value="8GiB"\/>' /etc/ImageMagick-6/policy.xml
ENV PATH="${PATH}:/home/ubuntu/.local/bin:/home/ubuntu/.cargo/bin"

# RUN sudo rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

# RUN curl -s -L -O https://bootstrap.pypa.io/pip/2.7/get-pip.py \
#   && sudo python2 get-pip.py \
#   && rm get-pip.py
