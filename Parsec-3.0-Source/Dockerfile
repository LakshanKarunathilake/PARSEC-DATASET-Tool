FROM ubuntu

COPY . .

RUN apt-get update && apt-get install -y g++ gettext libtbb-dev make

WORKDIR ./parsec-benchmark

RUN bin/parsecmgmt -a status

