const samples = [
  'samples/pc-keydown.wav',
  'samples/pc-keyup.wav',
  'samples/pc-enter.opus',
  'samples/pc-brushbig.wav',
  'samples/pc-brushsmall.wav',
  'samples/pc-eraser.wav',
  'samples/pc-pen.wav',
  'samples/pc-scroll.wav',
  'samples/pc-deny.opus',
  'samples/pc-click.wav',
  'samples/pc-chirp.wav',
  'samples/pc-symboldrop.wav',
  'samples/pc-send.opus',
  'samples/pc-copy.opus',
  'samples/pc-clear.opus',
  'samples/pc-pen-start.wav',
  'samples/pc-eraser-start.wav',
  'samples/pc-bells.mp3',
  'samples/pc-receive.mp3'
]

const programs = {
  'pc-keydown': {
    sample: 'samples/pc-keydown.wav',
    vibrate: 0.15,
    volume: 0.12
  },
  'pc-keyup': {
    sample: 'samples/pc-keyup.wav',
    vibrate: 0.4,
    volume: 0.16
  },
  'pc-enter': {
    sample: 'samples/pc-enter.opus',
    volume: 0.5
  },
  'pc-brushbigger': {
    sample: 'samples/pc-brushbig.wav',
    vibrate: 1.0,
    volume: 1.5,
    rate: 0.5
  },
  'pc-brushbig': {
    sample: 'samples/pc-brushbig.wav',
    vibrate: 0.5,
    volume: 1.5
  },
  'pc-brushsmall': {
    sample: 'samples/pc-brushsmall.wav',
    vibrate: 0.15,
    volume: 1.5
  },
  'pc-eraser': {
    sample: 'samples/pc-eraser.wav',
    vibrate: 0.2,
    volume: 1.5
  },
  'pc-flood': {
    sample: 'samples/pc-pen.wav',
    vibrate: 0.2,
    volume: 1.5,
    rate: 0.5
  },
  'pc-pen': {
    sample: 'samples/pc-pen.wav',
    vibrate: 0.2,
    volume: 1.5
  },
  'pc-click': {
    sample: 'samples/pc-click.wav',
    vibrate: 0.2,
    volume: 2.0
  },
  'pc-scroll': {
    sample: 'samples/pc-scroll.wav',
    vibrate: 0.1,
    volume: 2.0
  },
  'pc-deny': {
    sample: 'samples/pc-deny.opus',
    volume: 1.2,
    vibrate: 0.5
  },
  'pc-chirp-tick': {
    sample: 'samples/pc-chirp.wav',
    volume: 0.5,
    rate: 2.0
  },
  'pc-symboldrop': {
    sample: 'samples/pc-symboldrop.wav',
    volume: 1.2,
    vibrate: 0.1
  },
  'pc-send': {
    sample: 'samples/pc-send.opus',
    vibrate: 0.3
  },
  'pc-copy': {
    sample: 'samples/pc-copy.opus',
    vibrate: 0.3
  },
  'pc-clear': {
    sample: 'samples/pc-clear.opus',
    vibrate: 0.3
  },
  'pc-pen-start': {
    sample: 'samples/pc-pen-start.wav',
    volume: 1.5
  },
  'pc-eraser-start': {
    sample: 'samples/pc-eraser-start.wav',
    volume: 1.5
  },
  'pc-bells': {
    sample: 'samples/pc-bells.mp3'
  },
  'pc-receive': {
    sample: 'samples/pc-receive.mp3'
  },
  'pc-pen-cp': {
    complex: function () {
      this.playProgram('pc-pen-start')

      let whiteNoiseNode
      if (this.noiseBuffer) {
        whiteNoiseNode = this.audioContext.createBufferSource()
        whiteNoiseNode.buffer = this.noiseBuffer
        whiteNoiseNode.loop = true
        whiteNoiseNode.playbackRate.setValueAtTime(0.7, this.audioContext.currentTime)
        whiteNoiseNode.start(0)
      } else {
        whiteNoiseNode = new AudioWorkletNode(this.audioContext, 'white-noise')
      }

      let gainNode = this.audioContext.createGain()
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)

      let timeout = setTimeout(() => {
        whiteNoiseNode.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        timeout = undefined
      }, 68)

      return {
        modify: (speed, factor) => {
          let peak = Math.min(Math.max(Math.abs(speed) * factor * 0.5, 0), 1.5)
          if (peak <= 0.25) {
            peak = 0.0
          }
          gainNode.gain.cancelScheduledValues(this.audioContext.currentTime)
          gainNode.gain.setValueAtTime(peak / 100, this.audioContext.currentTime)
          gainNode.gain.setValueAtTime(peak / 100, this.audioContext.currentTime + 0.1)
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.15)

          if (this.vibrationStrength > 0) {
            window.navigator.vibrate(peak * peak * this.vibrationStrength * 0.05)
          }
        },
        stop: () => {
          if (timeout) {
            clearTimeout(timeout)
          }
          whiteNoiseNode.disconnect()
          whiteNoiseNode = undefined
          gainNode.disconnect()
          gainNode = undefined
        }
      }
    }
  },
  'pc-eraser-cp': {
    complex: function () {
      this.playProgram('pc-eraser-start')

      let whiteNoiseNode
      if (this.noiseBuffer) {
        whiteNoiseNode = this.audioContext.createBufferSource()
        whiteNoiseNode.buffer = this.noiseBuffer
        whiteNoiseNode.loop = true
        whiteNoiseNode.playbackRate.setValueAtTime(0.7, this.audioContext.currentTime)
        whiteNoiseNode.start(0)
      } else {
        whiteNoiseNode = new AudioWorkletNode(this.audioContext, 'white-noise')
      }

      let gainNode = this.audioContext.createGain()
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)

      let timeout = setTimeout(() => {
        whiteNoiseNode.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        timeout = undefined
      }, 68)

      let strokeTimeUnlock
      const attackTime = 0.025
      const holdTime = 0.030
      const downTime = 0.005
      const silenceTime = 0.020

      return {
        modify: (speed, factor) => {
          if (strokeTimeUnlock && this.audioContext.currentTime < strokeTimeUnlock) {
            return
          }

          let peak = Math.min(Math.max(Math.abs(speed) * factor, 0), 1.8)
          if (peak <= 0.25) {
            peak = 0.0
          }

          const rand = 0.9 + Math.random() * 0.2
          const mod = 0.65 + (peak * 0.5)
          const invMod = 1.65 - (peak * 0.5)
          const attackTimeMod = attackTime * rand * mod
          const holdTimeMod = holdTime * rand * invMod
          const downTimeMod = downTime * rand * mod
          const silenceTimeMod = silenceTime * rand * invMod

          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(peak / 80, this.audioContext.currentTime + attackTimeMod)
          gainNode.gain.setValueAtTime(peak / 80, this.audioContext.currentTime + attackTimeMod + holdTimeMod)
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + attackTimeMod + holdTimeMod + downTimeMod)
          whiteNoiseNode.playbackRate.setValueAtTime(0, this.audioContext.currentTime)
          whiteNoiseNode.playbackRate.setValueAtTime(0.2, this.audioContext.currentTime + attackTimeMod)
          whiteNoiseNode.playbackRate.linearRampToValueAtTime(peak, this.audioContext.currentTime + attackTimeMod + holdTimeMod + downTimeMod)

          strokeTimeUnlock = this.audioContext.currentTime + attackTimeMod + holdTimeMod + downTimeMod + silenceTimeMod

          if (this.vibrationStrength > 0) {
            window.navigator.vibrate(peak * peak * this.vibrationStrength * 0.1)
          }
        },
        stop: () => {
          if (timeout) {
            clearTimeout(timeout)
          }
          whiteNoiseNode.disconnect()
          whiteNoiseNode = undefined
          gainNode.disconnect()
          gainNode = undefined
        }
      }
    }
  },
  'pc-flood-cp': {
    complex: function () {
      this.playProgram('pc-pen-start')

      let oscillator = this.audioContext.createOscillator()
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime)
      oscillator.start(0)

      let gainNode = this.audioContext.createGain()
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)

      let timeout = setTimeout(() => {
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        timeout = undefined
      }, 68)

      return {
        modify: (pixelsFilled, width) => {
          let speed = pixelsFilled / width
          speed = 0.15 + speed / 1.33
          gainNode.gain.cancelScheduledValues(this.audioContext.currentTime)
          gainNode.gain.setValueAtTime(speed / 20, this.audioContext.currentTime)
          oscillator.frequency.linearRampToValueAtTime((210) - (speed * speed * 200), this.audioContext.currentTime + 0.025)
        },
        stop: () => {
          if (timeout) {
            clearTimeout(timeout)
          }
          oscillator.disconnect()
          oscillator = undefined
          gainNode.disconnect()
          gainNode = undefined
        }
      }
    }
  },
  'pc-flood2-cp': {
    complex: function () {
      this.playProgram('pc-pen-start')

      let whiteNoiseNode
      if (this.noiseBuffer) {
        whiteNoiseNode = this.audioContext.createBufferSource()
        whiteNoiseNode.buffer = this.noiseBuffer
        whiteNoiseNode.loop = true
        whiteNoiseNode.playbackRate.setValueAtTime(0.7, this.audioContext.currentTime)
        whiteNoiseNode.start(0)
      } else {
        whiteNoiseNode = new AudioWorkletNode(this.audioContext, 'white-noise')
      }

      let gainNode = this.audioContext.createGain()
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)

      let timeout = setTimeout(() => {
        whiteNoiseNode.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        timeout = undefined
      }, 68)

      return {
        modify: (pixelsFilled, width) => {
          let speed = pixelsFilled / width
          speed = 0.15 + speed / 1.33
          const rand = Math.random()
          gainNode.gain.cancelScheduledValues(this.audioContext.currentTime)
          gainNode.gain.setValueAtTime(speed / 300, this.audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(speed / 100, this.audioContext.currentTime + 0.1)
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.25)
          whiteNoiseNode.playbackRate.linearRampToValueAtTime(speed * speed + (rand/4), this.audioContext.currentTime + 0.025)

          if (this.vibrationStrength > 0) {
            window.navigator.vibrate(speed * this.vibrationStrength * 0.15)
          }
        },
        stop: () => {
          if (timeout) {
            clearTimeout(timeout)
          }
          whiteNoiseNode.disconnect()
          whiteNoiseNode = undefined
          gainNode.disconnect()
          gainNode = undefined
        }
      }
    }
  }
}

export { samples, programs }
