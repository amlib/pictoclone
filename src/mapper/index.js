import { tileMap } from '@/mapper/tilemap'

let imageSlices

const mapper = {
  generate: function (options) {
    return new Promise((resolve, reject) => {
      const newImageSlices = {}
      const canvas = document.createElement('canvas')

      if (canvas.getContext) {
        const context = canvas.getContext('2d')
        const image = new Image()
        image.src = options.imageSource
        image.onload = async () => {
          for (let g = 0; g < tileMap.length; ++g) {
            const group = tileMap[g]
            for (let i = 0; i < group.map.length; ++i) {
              const tile = group.map[i]
              const slice = {}

              canvas.width = tile.w * options.superSample
              canvas.height = tile.h * options.superSample

              slice.x = tile.x + group.x
              slice.y = tile.y + group.y
              slice.w = tile.w
              slice.h = tile.h
              slice.backgroundRepeat = tile.backgroundRepeat
              slice.backgroundPosition = tile.backgroundPosition
              slice.alias = group.groupName + '-' + tile.alias
              slice.top = tile.top * options.superSample + 'px'
              slice.bottom = tile.bottom * options.superSample + 'px'
              slice.left = tile.left * options.superSample + 'px'
              slice.right = tile.right * options.superSample + 'px'

              context.imageSmoothingEnabled = false
              context.drawImage(image, slice.x, slice.y, slice.w, slice.h, 0, 0, slice.w * options.superSample, slice.h * options.superSample)
              // const url = canvas.toDataURL()
              const blob = await getCanvasBlob(canvas)
              const url = URL.createObjectURL(blob)
              newImageSlices[slice.alias] = slice
              slice.url = url
            }
          }

          if (imageSlices) {
            for (var key in imageSlices) {
              URL.revokeObjectURL(imageSlices[key].url)
            }
          }

          imageSlices = newImageSlices
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
    app.config.unwrapInjectedRef = true // needed elsewhere...
    app.config.globalProperties.$superSample = options.superSample
    app.config.globalProperties.$mapperRegenerate = async (newOptions) => {
      return mapper.generate({ ...options, ...newOptions })
    }
    app.config.globalProperties.$tileMap = (alias) => {
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
