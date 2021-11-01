const getCanvasBlob = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

const asyncSetTimeout = delay => new Promise(resolve => setTimeout(resolve, delay))

export { getCanvasBlob, asyncSetTimeout }
