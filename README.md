# Pictoclone

A fully featured Pictochat clone made in Vue.js 3 and Vite.

Try the live version at https://amlib.github.io/pictoclone

No actual chatting yet, but the UI is 100% complete and functional. You can draw, use every function, "fake send" it, play with the message queue, navigate trough the sleek setting screens (which were inspired by the Nintendo DS system settings menus!) and experience every little feature I've added so far, like the interactive flood fill, keyboard excatly like the original one (for good or for worse), drag and dropping symbols off the keyboard all in a fully modern and responsive web layout! Also, say the secret message and you shall be handsomely rewarded!

This project so far has been tested on Desktop Firefox, Chrome and Epiphany (Webkit) and Mobile Firefox and Chrome. Works well across all of then, with epiphany being the buggiest (audio won't play properly... go figure). If someone has one of those fancy i devices I would gladly accept a report on how this runs on Safari.

This project also aims to keep dev dependencies and runtime footprint low. So, if you want to try it for yourself, it only pulls about 53 node packages (as of now) rather than the thousands it did initially when it depended on webpack.

As a side-effect of migrating from the fully featured webpack provided by vue cli to vite, the linter got removed. Re-installing it would result in hundreds of packages being added, so I said "screw it not reinstalling it". But hey, my IDE is running faster now!

All assets for this project have been commited to a separete repo called pictoclone-assets. Even tough this is a non comercial project i've decided to keep all copyrighted stuff off of it.

![image](https://user-images.githubusercontent.com/3516260/143182578-5932e54d-bbb1-4781-97c3-92df8b39e525.png)

![image](https://user-images.githubusercontent.com/3516260/143182828-22432f60-4a96-4cf8-9502-d0d5571eb5da.png)

![image](https://user-images.githubusercontent.com/3516260/143182950-85483628-06ff-4e97-842a-61bce0b0c73c.png)

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

### Serves production build
```
yarn serve
```
add --host if you want to access it on your local network
