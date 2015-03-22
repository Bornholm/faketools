#!/bin/bash

for i in {1..10}; do
  mailx -S smtp=smtp://127.0.0.1:2525 \
    -S smtp-auth-user=whatever \
    -S smtp-auth-password=whatever \
    -s "Test ${i}" \
    foo_${i}@bar_${i}.com \
    <<EOF
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eget metus ornare, placerat mi nec, ornare magna. Vivamus volutpat nisi et aliquet mollis. Phasellus eu malesuada erat, vel molestie ipsum. Etiam tincidunt ligula eget scelerisque blandit. Vivamus nec quam vitae felis rutrum cursus a eget elit. Integer vestibulum ultrices iaculis. Integer varius sapien ac ante accumsan euismod. Quisque fermentum dui nec porttitor pellentesque. Vivamus lobortis mauris eget metus sagittis tempor.

Donec eget urna mi. Suspendisse euismod viverra orci, a dictum nunc aliquet id. Nullam egestas metus nec quam convallis, ut faucibus massa placerat. Donec tincidunt ante scelerisque odio egestas, eget consectetur tortor cursus. Pellentesque id maximus elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada nibh congue, ultricies erat consequat, varius metus. Duis venenatis purus in magna condimentum rhoncus. Curabitur consectetur ut nunc at molestie. Cras convallis ante rhoncus turpis dictum placerat. Maecenas condimentum mollis nisl eu blandit. Duis facilisis felis mollis diam blandit eleifend.

Nam ultrices diam purus, sit amet blandit mi suscipit vel. Fusce lacus dui, ultricies et velit et, ornare vestibulum tellus. Proin varius leo ac nulla posuere, ut aliquam purus gravida. Nam quis sollicitudin nisi. Phasellus ut nunc odio. Vestibulum at nisl urna. Pellentesque sed fringilla lorem, aliquam laoreet quam. Pellentesque aliquam varius neque eu maximus. Proin dictum purus sed nisl tincidunt, in gravida tortor posuere. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed consequat urna sed turpis egestas, et malesuada elit porttitor. Ut ac quam mi. Nunc facilisis libero a sapien fringilla efficitur. Vestibulum placerat dictum faucibus. Curabitur at efficitur mauris.

Aliquam tortor felis, efficitur sed imperdiet imperdiet, fermentum mattis metus. Cras interdum, turpis ut tincidunt volutpat, massa purus aliquet turpis, non tempus purus arcu ac nunc. Vivamus venenatis turpis ut commodo ultrices. Proin elementum ultrices orci eu imperdiet. Nunc ac quam tortor. Nam et magna elit. Praesent commodo mollis quam, vel rutrum urna dapibus nec. Nulla ipsum nibh, rhoncus nec volutpat eu, sodales eu purus. Sed elit justo, rutrum ut quam at, commodo ultricies ex. Donec facilisis massa vitae lacus aliquet, eget rhoncus nisl congue.

In hac habitasse platea dictumst. Morbi sagittis, arcu eu interdum dignissim, lectus enim mattis purus, feugiat porta felis ipsum a purus. Nunc consectetur sed urna sit amet varius. In viverra ante nunc, in faucibus ante posuere sit amet. Duis rutrum pulvinar odio a sagittis. Ut in tincidunt massa. Proin elit augue, porta non lacus at, dignissim efficitur sem. Etiam placerat, orci vitae auctor vulputate, leo erat rhoncus leo, a ullamcorper quam sapien at lectus. Suspendisse potenti. Donec tincidunt sed arcu at ornare. Donec ac neque urna. Cras vel ante id leo posuere rhoncus et vitae risus. Vivamus enim augue, euismod non viverra quis, vulputate in massa. Morbi vestibulum ac neque eget aliquet. Sed ultrices ante ac lorem pharetra, pretium ornare leo imperdiet. Sed eleifend pulvinar erat vitae scelerisque.
EOF
done
