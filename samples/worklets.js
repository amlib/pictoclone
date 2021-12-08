
class WhiteNoiseProcessor extends AudioWorkletProcessor {
  process (inputs, outputs, parameters) {
    const output = outputs[0]

    for (let i = 0; i < output[0].length; i++) {
      output[0][i] = Math.random() * 2 - 1
    }

    for (let o = 1; o < output.length; ++o) {
      const buffer = output[o]
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = output[0][i]
      }
    }

    return true
  }
}

registerProcessor('white-noise', WhiteNoiseProcessor)
