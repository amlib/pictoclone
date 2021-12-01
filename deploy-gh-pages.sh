#!/usr/bin/env sh

# abort on errors
set -e

# fixes submodule .git directory ending up inside dist and breaking further builds
rm -rf dist

# fetch submodules
#git fetch

# install packages
#yarn

# build
yarn build

# navigate into the build output directory
cd dist && rm -rf .git

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# make sure to also set base directory to <REPO> in vite.config.js
git push -f git@github.com:amlib/pictoclone.git master:gh-pages

cd -

