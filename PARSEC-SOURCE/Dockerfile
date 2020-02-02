# Base image of Ubuntu
FROM ubuntu
# Downloading the dependencies
RUN apt-get update -y && apt-get install -y git wget make g++ gettext libtbb-dev m4 xorg-dev

# Cloning the PARSEC-3.0 after the issue fixing - Copy of original fixes with minor patches
RUN git clone "https://github.com/cirosantilli/parsec-benchmark.git" parsec-3.0

# Downloading the native input binaries
RUN wget -v https://parsec.cs.princeton.edu/download/3.0/parsec-3.0-input-native.tar.gz

# Extracting the downloaded images
RUN tar -xvf parsec-3.0-input-native.tar.gz && rm parsec-3.0-input-native.tar.gz
RUN ./parsec-3.0/bin/parsecmgmt -a build -p dedup -c gcc
RUN ./parsec-3.0/bin/parsecmgmt -a build -p dedup -c gcc-pthreads
RUN ./parsec-3.0/bin/parsecmgmt -a build -p ferret
RUN ./parsec-3.0/bin/parsecmgmt -a build -p ferret -c gcc-pthreads
RUN ./parsec-3.0/bin/parsecmgmt -a build -p ferret -c gcc-serial
#RUN ./parsec-3.0/bin/parsecmgmt -a build -p ferret -c gcc-tbb

RUN ./parsec-3.0/bin/parsecmgmt -a status

CMD parsecmgmt -a status

