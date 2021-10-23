import { cloneDeep } from 'lodash'

const superSample = 2
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
    top: 0, left: 4, bottom: 0, right: 4
  },
  {
    x: 36, y: 0, w: 4, h: 4, alias: 'straight-r',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'right',
    top: 4, left: 0, bottom: 4, right: 0
  },
  {
    x: 40, y: 0, w: 4, h: 4, alias: 'straight-b',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom',
    top: 0, left: 4, bottom: 0, right: 4
  },
  {
    x: 44, y: 0, w: 4, h: 4, alias: 'straight-l',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'left',
    top: 4, left: 0, bottom: 4, right: 0
  },
  {
    x: 48, y: 0, w: 4, h: 4, alias: 'center',
    backgroundRepeat: 'repeat', backgroundPosition: null,
    top: 0, left: 4, bottom: 0, right: 4
  }
]

const smallButtonMap = [
  {
    x: 0, y: 0, w: 2, h: 2, alias: 'corner1-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 2, y: 0, w: 2, h: 2, alias: 'corner1-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 4, y: 0, w: 2, h: 2, alias: 'corner1-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 6, y: 0, w: 2, h: 2, alias: 'corner1-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-t',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'top',
    top: 0, left: 2, bottom: 0, right: 2
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-r',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'right',
    top: 2, left: 0, bottom: 2, right: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-b',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom',
    top: 0, left: 2, bottom: 0, right: 2
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-l',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'left',
    top: 2, left: 0, bottom: 2, right: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'center',
    backgroundRepeat: 'repeat', backgroundPosition: null,
    top: 0, left: 2, bottom: 0, right: 2
  }
]

const iconMap = [
  {
    x: 0, y: 0, w: 25, h: 17, alias: 'copy',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 25, y: 0, w: 27, h: 26, alias: 'send',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 52, y: 0, w: 25, h: 18, alias: 'clear',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 0, y: 26, w: 12, h: 12, alias: 'symbols2',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 12, y: 26, w: 12, h: 12, alias: 'symbols1',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 24, y: 26, w: 12, h: 12, alias: 'kana',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 36, y: 26, w: 12, h: 12, alias: 'accents',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 48, y: 26, w: 12, h: 12, alias: 'romaji',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 60, y: 26, w: 12, h: 12, alias: 'brush-small',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 72, y: 26, w: 12, h: 12, alias: 'brush-big',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 0, y: 38, w: 12, h: 11, alias: 'brush',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 12, y: 38, w: 12, h: 11, alias: 'eraser',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 24, y: 38, w: 14, h: 14, alias: 'arrow-down',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 38, y: 38, w: 14, h: 14, alias: 'arrow-up',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  }
]
const imageMap = [
  {
    groupName: 'main-button', x: 0, y: 0,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-highlight', x: 0, y: 4,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-inverted', x: 0, y: 8,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-color-fill', x: 0, y: 12,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-background', x: 0, y: 16,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-foreground', x: 0, y: 20,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-drawing-area', x: 0, y: 24,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-color-background', x: 0, y: 28,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'small-button', x: 0, y: 32,
    map: cloneDeep(smallButtonMap)
  },
  {
    groupName: 'small-button-highlight', x: 10, y: 32,
    map: cloneDeep(smallButtonMap)
  },
  {
    groupName: 'icon-normal', x: 0, y: 34,
    map: cloneDeep(iconMap)
  },
  {
    groupName: 'icon-color-fill', x: 0, y: 86,
    map: cloneDeep(iconMap)
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
              canvas.width = im.w * superSample
              canvas.height = im.h * superSample
              // WARNING changing values in imageMap:
              im.x = im.x + group.x
              im.y = im.y + group.y
              im.alias = group.groupName + '-' + im.alias
              im.top = im.top * superSample + 'px'
              im.bottom = im.bottom * superSample + 'px'
              im.left = im.left * superSample + 'px'
              im.right = im.right * superSample + 'px'

              context.imageSmoothingEnabled = false
              context.drawImage(image, im.x, im.y, im.w, im.h, 0, 0, im.w * superSample, im.h * superSample)
              // const url = canvas.toDataURL()
              const blob = await getCanvasBlob(canvas)
              const url = URL.createObjectURL(blob)
              imageSlices[im.alias] = im
              im.url = url
            }
          }

          // console.log('all done:', imageSlices)
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
