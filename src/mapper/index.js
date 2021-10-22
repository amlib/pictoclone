import { cloneDeep } from 'lodash'

const imageSource = 'tilemap.png'
const mainMap = [
  {
    x: 0, y: 0, w: 4, h: 4, alias: 'corner1-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 4, y: 0, w: 4, h: 4, alias: 'corner1-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 8, y: 0, w: 4, h: 4, alias: 'corner1-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 12, y: 0, w: 4, h: 4, alias: 'corner1-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 16, y: 0, w: 4, h: 4, alias: 'corner2-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 20, y: 0, w: 4, h: 4, alias: 'corner2-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 24, y: 0, w: 4, h: 4, alias: 'corner2-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 28, y: 0, w: 4, h: 4, alias: 'corner2-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 32, y: 0, w: 4, h: 4, alias: 'straight-t',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'top',
    top: 0, left: '4px', bottom: 0, right: '4px'
  },
  {
    x: 36, y: 0, w: 4, h: 4, alias: 'straight-r',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'right',
    top: '4px', left: 0, bottom: '4px', right: 0
  },
  {
    x: 40, y: 0, w: 4, h: 4, alias: 'straight-b',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom',
    top: 0, left: '4px', bottom: 0, right: '4px'
  },
  {
    x: 44, y: 0, w: 4, h: 4, alias: 'straight-l',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'left',
    top: '4px', left: 0, bottom: '4px', right: 0
  },
  {
    x: 48, y: 0, w: 4, h: 4, alias: 'center',
    backgroundRepeat: 'repeat', backgroundPosition: null,
    top: 0, left: '4px', bottom: 0, right: '4px'
  }
]
const imageMap = [
  {
    groupName: 'main-normal', x: 0, y: 0,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-highlight', x: 0, y: 4,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-inverted', x: 0, y: 8,
    map: cloneDeep(mainMap)
  }
]
const imageSlices = {}

const mapper = {
  init: function () {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')

      if (canvas.getContext) {
        const context = canvas.getContext('2d')
        const image = new Image()
        image.src = imageSource
        image.onload = async () => {
          for (let g = 0; g < imageMap.length; ++g) {
            const group = imageMap[g]
            for (let i = 0; i < group.map.length; ++i) {
              const im = group.map[i]
              canvas.width = im.w
              canvas.height = im.h
              // WARNING changing values in imageMap:
              im.x = im.x + group.x
              im.y = im.y + group.y
              im.alias = group.groupName + '-' + im.alias
              context.drawImage(image, im.x, im.y, im.w, im.h, 0, 0, im.w, im.h)
              // const url = canvas.toDataURL()
              const blob = await getCanvasBlob(canvas)
              const url = URL.createObjectURL(blob)
              imageSlices[im.alias] = im
              im.url = url
            }
          }

          console.log('all done:', imageSlices)
          resolve()
        }
        image.onerror = function (error) {
          console.warn('Could not load image', error)
          reject(error)
        }
      } else {
        console.warn('could not get canvas for mapper!')
        reject(new Error('could not get canvas context'))
      }
    })
  },
  install: (app, options) => {
    app.config.globalProperties.$imageMap = (alias) => {
      return imageSlices[alias]
    }
  }
}

const getCanvasBlob = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

export default mapper
