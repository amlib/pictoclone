# Pictoclone

A fully featured Pictochat clone made in Vue.js 3 and Vite.

No actual chatting yet, but the UI is 100% complete and functional. You can draw, use every function, "fake send" it, play with the message queue, navigate trough the sleek setting screens (which were inspired by the Nintendo DS system settings menus!) and experience every little feature I've added so far, like the interactive flood fill... also, say the secret message and you shall be handsomely rewarded!

This project so far has been tested on Desktop Firefox, Chrome and Epiphany (Webkit) and Mobile Firefox and Chrome. Works well across all of then, with epiphany being the buggiest (audio won't play properly... go figure). If someone has one of those fancy i devices I would gladly accept a report on how this runs on Safari.

This project also aims to keep dev dependencies and runtime footprint low. So, if you want to try it for yourself, it only pulls about 53 node packages (as of now) rather than the thousands it did initially when it depended on webpack.

As a side-effect of migrating from the fully featured webpack provided by vue cli to vite, the linter got removed. Re-installing it would result in hundreds of packages being added, so I said "screw it not reinstalling it". But hey, my IDE is running faster now!

All assets for this project have been commited to a separete repo called pictoclone-assets. Even tough this is a non comercial project i've decided to keep all copyrighted stuff off of it.

## Project setup
First fetch the submodule where all the assets have been stashed
```
git fetch
```

Then install all packages
```
yarn
```

### Compile and hot-reload for development
```
yarn dev
```
add --host if you want to access it on your local network

### Compiles and minifies for production
```
yarn build
```

### Serves production build
```
yarn serve
```
add --host if you want to access it on your local network
