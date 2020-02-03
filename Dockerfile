FROM node:alpine
# Install Curl
RUN apk add curl python

# Setting up the kubectl
RUN curl -L https://dl.k8s.io/v1.10.6/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl

# Prepare the image
ENV DEBIAN_FRONTEND noninteractive

RUN apk update && rm -rf /usr/portage/distfiles/*

# Install the Google Cloud SDK.
# Downloading gcloud package
RUN curl https://dl.google.com/dl/cloudsdk/release/google-cloud-sdk.tar.gz > /tmp/google-cloud-sdk.tar.gz

# Installing the package
RUN mkdir -p /usr/local/gcloud
RUN  tar -C /usr/local/gcloud -xvf /tmp/google-cloud-sdk.tar.gz 
RUN /usr/local/gcloud/google-cloud-sdk/install.sh

# Adding the package path to local
ENV PATH $PATH:/usr/local/gcloud/google-cloud-sdk/bin


RUN gcloud components install kubectl

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .
EXPOSE 8080 8888 80

# Authenticate with service account
RUN gcloud auth activate-service-account \
  test-350@pipeline-concurrency.iam.gserviceaccount.com \
          --key-file=./pipeline-concurrency.json --project=pipeline-concurrency

#CMD ["./start.sh"]
CMD ["node","app.js"]


gcloud auth activate-service-account test-350@pipeline-concurrency.iam.gserviceaccount.com --key-file=./pipeline-concurrency.json --project=pipeline-concurrency
