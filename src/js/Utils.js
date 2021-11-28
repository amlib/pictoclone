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

const getPngDimensions = function (uint8png) {
  const view = new DataView(uint8png.buffer, uint8png.byteOffset)
  const magicA = view.getUint32(0)
  const magicB = view.getUint32(4)
  if (magicA  !== 0x89504E47 || magicB !== 0x0D0A1A0A) {
    return null
  }

  const chunkLength = view.getUint32(8, false)
  const chunkType = view.getUint32(12, false)
  if (chunkType !== 0x49484452 || chunkLength !== 0x0000000D) {
    return null
  }

  const width = view.getUint32(16, false)
  const height = view.getUint32(20, false)
  if (width <= 0 || height <= 0) {
    return null
  }

  return {
    width,
    height
  }
}

const asyncSetTimeout = delay => new Promise(resolve => setTimeout(resolve, delay))

const decimalToHex = function (d, padding) {
  var hex = Number(d).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex;
}

export { getCanvasBlob, asyncSetTimeout, hexToRgb, getPngDimensions, decimalToHex }
