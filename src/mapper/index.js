import { baseColorIndex, tileMap } from '/src/mapper/tilemap'
import { getCanvasBlob, hexToRgb } from '/src/js/Utils'

// abandoned code
// const rgbToHsl = function (r, g, b) {
//   r /= 255
//   g /= 255
//   b /= 255
//
//   let max = (r > g) ? (r > b) ? r : b : (g > b) ? g : b,
//     min = (r < g) ? (r < b) ? r : b : (g < b) ? g : b,
//     chroma = max - min,
//     h = 0,
//     s = 0,
//     // Lightness
//     l = (min + max) / 2
//
//   if (chroma !== 0) {
//     // Hue
//     if (r === max) {
//       h = (g - b) / chroma + ((g < b) ? 6 : 0)
//     }
//     else if (g === max) {
//       h = (b - r) / chroma + 2
//     }
//     else {
//       h = (r - g) / chroma + 4
//     }
//     h /= 6
//
//     // Saturation
//     s = (l > 0.5) ? chroma / (2 - max - min) : chroma / (max + min)
//   }
//
//   return [h, s, l];
// }
//
// const hslToRgb = function (h, s, l) {
//   let m1, m2, hue,
//     r, g, b,
//     rgb = []
//
//   if (s === 0) {
//     r = g = b = l * 255 + 0.5 | 0
//     rgb = [r, g, b]
//   }
//   else {
//     if (l <= 0.5) {
//       m2 = l * (s + 1)
//     }
//     else {
//       m2 = l + s - l * s
//     }
//
//     m1 = l * 2 - m2
//     hue = h + 1 / 3
//
//     let tmp
//     for (let i = 0; i < 3; i += 1) {
//       if (hue < 0) {
//         hue += 1
//       }
//       else if (hue > 1) {
//         hue -= 1
//       }
//
//       if (6 * hue < 1) {
//         tmp = m1 + (m2 - m1) * hue * 6
//       }
//       else if (2 * hue < 1) {
//         tmp = m2
//       }
//       else if (3 * hue < 2) {
//         tmp = m1 + (m2 - m1) * (2 / 3 - hue) * 6
//       }
//       else {
//         tmp = m1
//       }
//
//       rgb[i] = tmp * 255 + 0.5 | 0
//
//       hue -= 1 / 3
//     }
//   }
//
//   return rgb;
// }
//
// const hslAdjustment = function (canvas, context, hueDelta, satDelta, lightness) {
//   const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
//   let pixels = imageData.data
//
//   hueDelta /= 360
//   satDelta /= 100
//   lightness /= 100
//
//   let h, s, l, hsl, rgb, i
//
//   for (i = 0; i < pixels.length; i += 4) {
//     // convert to HSL
//     hsl = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2])
//
//     // hue
//     h = hsl[0] + hueDelta
//     while (h < 0) {
//       h += 1
//     }
//     while (h > 1) {
//       h -= 1
//     }
//
//     // saturation
//     s = hsl[1] + hsl[1] * satDelta
//     if (s < 0) {
//       s = 0
//     }
//     else if (s > 1) {
//       s = 1
//     }
//
//     // lightness
//     l = hsl[2]
//     if (lightness > 0) {
//       l += (1 - l) * lightness
//     }
//     else if (lightness < 0) {
//       l += l * lightness
//     }
//
//     // convert back to rgb
//     rgb = hslToRgb(h, s, l)
//
//     pixels[i]     = rgb[0]
//     pixels[i + 1] = rgb[1]
//     pixels[i + 2] = rgb[2]
//     // pixels[i + 3] = pixels[i + 3]
//   }
//
//   return imageData;
// }

import { colorsHexL1, colorsHexL2, colorsHexL3, colorsHexL4 } from '../js/Colors'
const colorMapCache = {}

const remapColors = function (canvas, context, srcColorIndex, targetColorIndex) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  let pixels = imageData.data
  const colorMapIdentifier = srcColorIndex + '-' + targetColorIndex

  let colorMap = {}

  if (colorMapCache[colorMapIdentifier]) {
    colorMap = colorMapCache[colorMapIdentifier]
  } else {
    const srcColorsHex = [
      colorsHexL1[srcColorIndex],
      colorsHexL2[srcColorIndex],
      colorsHexL3[srcColorIndex],
      colorsHexL4[srcColorIndex]
    ]

    const dstColorsHex = [
      colorsHexL1[targetColorIndex],
      colorsHexL2[targetColorIndex],
      colorsHexL3[targetColorIndex],
      colorsHexL4[targetColorIndex]
    ]

    for (let i = 0; i < srcColorsHex.length; ++i) {
      const srcColorHex = srcColorsHex[i]
      const dstColorHex = dstColorsHex[i]
      const srcColor = hexToRgb(srcColorHex)
      const dstColor = hexToRgb(dstColorHex)

      if (!colorMap[srcColor.r]) {
        colorMap[srcColor.r] = {}
      }

      if (!colorMap[srcColor.r][srcColor.g]) {
        colorMap[srcColor.r][srcColor.g] = {}
      }

      colorMap[srcColor.r][srcColor.g][srcColor.b] = dstColor
    }

    colorMapCache[colorMapIdentifier] = colorMap
  }

  for (let i = 0; i < pixels.length; i += 4) {
    const result = colorMap?.[pixels[i]]?.[pixels[i + 1]]?.[pixels[i + 2]]

    if (result) {
      pixels[i]     = result.r
      pixels[i + 1] = result.g
      pixels[i + 2] = result.b
    }
  }

  return imageData
}

let imageSlices

const mapper = {
  generate: function (options) {
    return new Promise((resolve, reject) => {
      const newImageSlices = {}
      const canvas = document.createElement('canvas')

      const integerSuperSample = Math.floor(options.superSample)
      const fractionalSuperSample = options.superSample / integerSuperSample

      if (canvas.getContext) {
        const context = canvas.getContext('2d')
        const image = new Image()
        image.src = options.imageSource
        image.onload = async () => {
          for (let g = 0; g < tileMap.length; ++g) {
            const group = tileMap[g]
            for (let i = 0; i < group.map.length; ++i) {
              let colors
              if (group.colorVariations) {
                colors = [...Array(colorsHexL2.length).keys()]
              } else {
                colors = [baseColorIndex]
              }

              for (let c = 0; c < colors.length; ++c) {
                const tile = group.map[i]
                const slice = {}
                const colorIndex = colors[c]

                const superSample = tile.noSuperSample ? 1 : options.superSample

                canvas.width = Math.floor(tile.w * superSample)
                canvas.height = Math.floor(tile.h * superSample)

                const sourceX = tile.x + group.x
                const sourceY = tile.y + group.y
                const sourceW = tile.w
                const sourceH = tile.h

                slice.backgroundRepeat = tile.backgroundRepeat
                slice.backgroundPosition = tile.backgroundPosition
                const baseAlias = group.groupName + '-' + tile.alias
                slice.alias = baseAlias + (group.colorVariations ? '-cv' + colorIndex : '')
                slice.top = Math.floor(tile.top * superSample) + 'px'
                slice.bottom = Math.floor(tile.bottom * superSample) + 'px'
                slice.left = Math.floor(tile.left * superSample) + 'px'
                slice.right = Math.floor(tile.right * superSample) + 'px'
                slice.offsetX = Math.floor(tile.offsetX * superSample)
                slice.offsetY = Math.floor(tile.offsetY * superSample)
                slice.w = Math.floor(sourceW * superSample)
                slice.h = Math.floor(sourceH * superSample)
                slice.cv = group.colorVariations

                context.globalCompositeOperation = 'copy'
                context.imageSmoothingEnabled = false
                const integerSuperSampleTile = tile.noSuperSample ? 1 : integerSuperSample
                context.drawImage(image, sourceX, sourceY, sourceW, sourceH,
                  0, 0, sourceW * integerSuperSampleTile, sourceH * integerSuperSampleTile)

                if (group.colorVariations) {
                  // abandoned idea 1...
                  // does not preserve luminance (great) but stuff wind up looking off anyway
                  // context.putImageData(hslAdjustment(canvas, context, colorDeg, 0, 0), 0, 0)

                  // abandoned idea 2...
                  // const compBK = context.globalCompositeOperation
                  // context.globalCompositeOperation = 'hue' // same problem as shifint hue with css, preserves luminance
                  // context.fillStyle = '#FF0'
                  // context.fillRect(0, 0, canvas.width, canvas.height)
                  // context.globalCompositeOperation = compBK

                  // pallet swap to the correct color works well
                  // but is memory inefficient since there is no indexable color pallet and we have to generate full tile variations for each color
                  if (colorIndex !== baseColorIndex) {
                    context.putImageData(remapColors(canvas, context, baseColorIndex, colorIndex), 0, 0)
                  }
                }

                if (!tile.noSuperSample && fractionalSuperSample > 1.01) {
                  context.imageSmoothingEnabled = true
                  // context.globalCompositeOperation = 'copy'
                  context.drawImage(canvas, 0, 0, sourceW * integerSuperSampleTile, sourceH * integerSuperSampleTile,
                    0, 0, Math.floor(sourceW * superSample), Math.floor(sourceH * superSample))
                }
                // const url = canvas.toDataURL()
                const blob = await getCanvasBlob(canvas)
                const url = URL.createObjectURL(blob)
                slice.url = url
                newImageSlices[slice.alias] = slice
                if (group.colorVariations && colorIndex === baseColorIndex) {
                  newImageSlices[baseAlias] = slice
                }
              }
            }
          }

          if (imageSlices) {
            for (var key in imageSlices) {
              URL.revokeObjectURL(imageSlices[key].url)
            }
          }

          canvas.remove()
          image.remove()
          imageSlices = newImageSlices
          // console.log('all done:', imageSlices)
          resolve()
        }
        image.onerror = function (error) {
          console.warn('Could not load image', error)
          canvas.remove()
          image.remove()
          reject(error)
        }
      } else {
        console.warn('could not get canvas for mapper!')
        canvas.remove()
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
    app.config.globalProperties.$tileMap = (alias, colorVariations = null) => {
      if (colorVariations == null || !imageSlices[alias].cv) {
        return imageSlices[alias]
      } else {
        return imageSlices[alias + '-cv' + colorVariations]
      }
    }
  }
}

export default mapper
