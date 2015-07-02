#!/usr/bin/env bash

cd /faketools
./bin/fake-cas | sed 's/\(.*\)/[CAS] \1/'
