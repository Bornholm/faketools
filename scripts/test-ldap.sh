#!/bin/bash

host=localhost
port=1389
baseDN="o=test"
user="cn=admin"
password="foobar"

ldapadd -p 3389 -h 127.0.0.1 -D cn=admin,o=test <<EOF
dn: cn=Robert Smith,o=test
objectclass: inetOrgPerson
cn: Robert Smith
cn: Robert J Smith
cn: bob  smith
sn: smith
uid: rjsmith
userpassword: rJsmitH
carlicense: HISCAR 123
homephone: 555-111-2222
mail: r.smith@example.com
mail: rsmith@example.com
mail: bob.smith@example.com
description: swell guy
ou: Human Resources
EOF
