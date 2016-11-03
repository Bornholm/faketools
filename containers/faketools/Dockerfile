FROM alpine:3.4

ARG HTTP_PROXY=
ARG HTTPS_PROXY=
ARG http_proxy=
ARG https_proxy=

RUN apk --no-cache add supervisor nodejs build-base

ADD containers/faketools/supervisor.ini /etc/supervisor.d/supervisor.ini

ADD data/cas/fakecas-cert.pem /faketools/certs/fakecas-cert.pem
ADD data/cas/fakecas-key.pem /faketools/certs/fakecas-key.pem
ADD containers/faketools/faketoolsrc.json /faketools/.faketoolsrc

ADD . /faketools

WORKDIR /faketools

RUN npm install bower -g && npm install

VOLUME ["/faketools/data"]

CMD /usr/bin/supervisord
