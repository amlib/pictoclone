const getCanvasBlob = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

const hexToRgb = function (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return { r, g, b }
}

const asyncSetTimeout = delay => new Promise(resolve => setTimeout(resolve, delay))

export { getCanvasBlob, asyncSetTimeout, hexToRgb }
