#!/bin/bash

for i in {1..10}; do
  mailx -S smtp=smtp://127.0.0.1:2525 \
    -S smtp-auth-user=whatever \
    -S smtp-auth-password=whatever \
    -s "Test ${i}" \
    foo_${i}@bar_${i}.com \
    <<EOF
Content-Type: text/html

<html>
  <body>
    <h1>Hello World !</h1>
  </body>
</html>
EOF
done
