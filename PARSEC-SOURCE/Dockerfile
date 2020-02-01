FROM ubuntu

RUN apt-get update -y && apt-get install -y git wget make g++ gettext libtbb-dev m4 xorg-dev
RUN git clone "https://github.com/cirosantilli/parsec-benchmark.git" parsec-3.0

RUN wget -nv https://parsec.cs.princeton.edu/download/3.0/parsec-3.0-input-native.tar.gz
RUN tar -xvf parsec-3.0-input-native.tar.gz && rm parsec-3.0-input-native.tar.gz
RUN ls
RUN ./parsec-3.0/bin/parsecmgmt -a build -p parsec

