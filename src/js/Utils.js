const getCanvasBlob = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

const hexToCssRgba = function (hex, alpha = 1.0) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const asyncSetTimeout = delay => new Promise(resolve => setTimeout(resolve, delay))

export { getCanvasBlob, asyncSetTimeout, hexToCssRgba }
