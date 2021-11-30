# Pictoclone

A fully featured Pictochat clone made in Vue.js 3 and Vite.

Try the live version at https://amlib.github.io/pictoclone

Draw your messages just like you did back in 2004! Stylus not included!

Almost every aspect of the interface has been reproduced. From the sound the pencil makes when striking the canvas to the qwerty+ keyboard with it's unique symbol dragging ability, this has it all. The settings screen were heavily inspired by the one included in the Nintendo DS system rom (technically not part of Pictochat, but you still needed it to fiddle with it's settings). Some extra features were added like the interactive flood fill and an extra brush size (wow)! Meanwhile, this is all backed by a fully modern and responsive web layout! Try it in landscape mode! Also, the rainbow pen makes a comeback, but this time you have to guess the secret word...

This project so far has been tested on Firefox, Chrome, Epiphany (Webkit), Mobile Firefox and Mobile Chrome. Works well across all of then, with epiphany being the buggiest (audio won't play properly, scrolling issues) and somewhat laggy. I have no idea how this runs on Safari.

Chatting is implemented by a very simple websocket client/server protocol. There is no p2p support. All messages in the protocol are exchanged in binary and defined in the specs.js file, shared across both projects (pictoclone and pictoclone-server).

There are also two companion repositories:
https://github.com/amlib/pictoclone-server
https://github.com/amlib/pictoclone-assets
Both needed to get all the assets and the chat server working
The assets used may contain copyrighted material (Nintendo and the NDS12 font by Caveras) which are being used on a non-commercial basis.

This project also aims to keep dev dependencies and runtime footprint low. So, if you want to try it for yourself, it only pulls about 53 node packages (as of now) rather than the thousands it did initially when it depended on webpack.

As a side-effect of migrating from the fully featured webpack provided by vue cli to vite, the linter got removed. Re-installing it would result in hundreds of packages being added, so I decided against it. But hey, my IDE is running faster now!

![pictoclone](https://user-images.githubusercontent.com/3516260/144120885-bb829418-7e1d-4cd5-ad11-decf1fbe4a97.png)

## Project setup
First fetch the submodule where all the assets have been stashed
```
git fetch
```

Then install all packages
```
yarn
```

### Compiles and hot-reloads for development
```
yarn dev
```
add --host if you want to access it on your local network

### Compiles and minifies for production
```
yarn build
```
Warning: you may need to remove dist/.git directory before building

### Serves production build
```
yarn serve
```
add --host if you want to access it on your local network
