#!/bin/sh

cd /faketools

npm install bower -g
npm install --ignore-scripts

cd node_modules/bootstrap-treeview
bower install --allow-root