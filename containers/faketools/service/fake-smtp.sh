#!/usr/bin/env bash

cd /faketools
./bin/fake-smtp | sed 's/\(.*\)/[SMTP] \1/'
