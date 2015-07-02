#!/usr/bin/env bash

cd /faketools
./bin/fake-ldap | sed 's/\(.*\)/[LDAP] \1/'
