FROM alpine:3.7

ARG HTTP_PROXY=
ARG HTTPS_PROXY=
ARG http_proxy=
ARG https_proxy=
ARG FAKE_MODULE=cas

RUN apk add --no-cache nodejs build-base python

COPY . /fake-$FAKE_MODULE
WORKDIR /fake-$FAKE_MODULE

RUN npm install

FROM alpine:3.7

ARG FAKE_MODULE=cas

RUN apk add --no-cache nodejs

RUN mkdir /fake-$FAKE_MODULE

WORKDIR /fake-$FAKE_MODULE

COPY --from=0 /fake-$FAKE_MODULE/index.js /fake-$FAKE_MODULE/index.js
COPY --from=0 /fake-$FAKE_MODULE/bin/fake-$FAKE_MODULE /fake-$FAKE_MODULE/bin/fake-$FAKE_MODULE
COPY --from=0 /fake-$FAKE_MODULE/lib /fake-$FAKE_MODULE/lib
COPY --from=0 /fake-$FAKE_MODULE/node_modules /fake-$FAKE_MODULE/node_modules

COPY ./containers/fake-$FAKE_MODULE/faketoolsrc.json /fake-$FAKE_MODULE/.faketoolsrc
COPY ./data/cas/fakecas-cert.pem /fake-$FAKE_MODULE/certs/fakecas-cert.pem
COPY ./data/cas/fakecas-key.pem /fake-$FAKE_MODULE/certs/fakecas-key.pem

RUN mkdir -p /fake-$FAKE_MODULE/data/$FAKE_MODULE

VOLUME /fake-$FAKE_MODULE/data/$FAKE_MODULE

ENV FAKE_MODULE=$FAKE_MODULE
CMD bin/fake-$FAKE_MODULE

