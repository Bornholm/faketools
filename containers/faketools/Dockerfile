FROM phusion/baseimage:0.9.16

CMD ["/sbin/my_init"]

ENV HTTP_PROXY http://192.168.10.254:3128
ENV DEBIAN_FRONTEND noninteractive
ENV NODE_VERSION 0.12.5
ENV NPM_VERSION 2.11.3

RUN apt-get update &&\
    apt-get install --yes curl git build-essential python2.7

RUN gpg --keyserver pool.sks-keyservers.net --recv-keys 7937DFD2AB06298B2293C3187D33FF9D0246406D 114F43EE0176B71C7BC219DD50A3051F888C628D

RUN curl -x $HTTP_PROXY -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  	&& curl -x $HTTP_PROXY -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  	&& gpg --verify SHASUMS256.txt.asc \
  	&& grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  	&& tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  	&& rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc \
  	&& npm install -g npm@"$NPM_VERSION"

RUN mkdir -p /opt
RUN git config --global http.proxy $HTTP_PROXY
RUN git config --global https.proxy $HTTP_PROXY
RUN cd /opt && git clone http://github.com/Bornholm/faketools.git faketools
WORKDIR /opt/faketools
RUN npm install --production

RUN mkdir -p /etc/service/fake-smtp
ADD ./service/fake-smtp.sh /etc/service/fake-smtp/run
RUN chmod +x /etc/service/fake-smtp/run

RUN mkdir -p /etc/service/fake-ldap
ADD ./service/fake-ldap.sh /etc/service/fake-ldap/run
RUN chmod +x /etc/service/fake-ldap/run

RUN mkdir -p /etc/service/fake-cas
ADD ./service/fake-cas.sh /etc/service/fake-cas/run
RUN chmod +x /etc/service/fake-cas/run

RUN apt-get --yes purge build-essential python2.7 && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV DEBIAN_FRONTEND newt
