FROM alpine:3.4

ARG HTTP_PROXY=
ARG HTTPS_PROXY=
ARG http_proxy=
ARG https_proxy=

RUN apk --no-cache add supervisor nodejs build-base openssh

ADD containers/faketools/supervisor.ini /etc/supervisor.d/supervisor.ini

ADD containers/faketools/faketoolsrc.json /faketools/.faketoolsrc

ADD . /faketools

WORKDIR /faketools

RUN npm install bower -g && npm install

COPY ./data/cas/fakecas-cert.pem /faketools/certs/fakecas-cert.pem
COPY ./data/cas/fakecas-key.pem /faketools/certs/fakecas-key.pem

RUN sed -i 's/^#PermitRootLogin.*$/PermitRootLogin yes/' /etc/ssh/sshd_config \
  && sed -i 's/^#PasswordAuthentication.*$/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/^#PermitRootLogin.*$/PermitRootLogin yes/' /etc/ssh/sshd_config \
  && sed -i "s/^#HostKey.*$/HostKey \/etc\/ssh\/ssh_host_rsa_key/" /etc/ssh/sshd_config

RUN ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -t rsa

RUN echo "root:root" | chpasswd

VOLUME ["/faketools/data"]

CMD /usr/bin/supervisord
