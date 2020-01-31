FROM ubuntu

RUN apt-get update -y && apt-get install -y git curl make g++ gettext libtbb-dev m4 xorg-dev
RUN git clone "https://github.com/LakshanKarunathilake/parsec-suite.git" parsec-3.0

RUN curl -0 "http://parsec.cs.princeton.edu/download/3.0/parsec-3.0-input-native.tar.gz" && tar -xvf parsec-3.0-input-native.tar.gz && rm parsec-3.0-input-native.tar.gz
RUN ls
RUN ./parsec-3.0/bin/parsecmgmt -a build -p all

