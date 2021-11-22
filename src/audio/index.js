import { programs, samples } from '/src/audio/samples'
import { unzip } from 'fflate';
import samplesZip from '/samples.zip'

export class AudioFX {
  audioContext
  bufferMap = {}
  vibrationStrength
  volume
  loaded = false
  noiseBuffer
  zipSampleBundle = true

  constructor (vibrationStrength = 120, volume = 1.0) {
    this.vibrationStrength = 120
    this.volume = 1.0
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  resume () {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  loadSamples () {
    return new Promise(async (resolve, reject) => {
      if (this.zipSampleBundle) {
        const response = await fetch(samplesZip)
        const zipBuffer = await response.arrayBuffer()
        unzip(new Uint8Array(zipBuffer), async (err, unzipped) => {
          for (let i = 0; i < samples.length; ++i) {
            const sample = samples[i]
            try {
              const sampleUint8Array = unzipped[sample.replace('samples/', '')]
              this.bufferMap[sample] = await this.audioContext.decodeAudioData(sampleUint8Array.buffer)
            } catch (e) {
              console.warn('AudioFX.loadSamples: could not load sample:', sample, 'reason:', e)
              reject()
            }
          }

          this.generateNoise()
          this.loaded = true
          resolve()
        });
      } else {
        for (let i = 0; i < samples.length; ++i) {
          const sample = samples[i]
          try {
            const response = await fetch(sample)
            const arrayBuffer = await response.arrayBuffer()
            this.bufferMap[sample] = await this.audioContext.decodeAudioData(arrayBuffer)
          } catch (e) {
            console.warn('AudioFX.loadSamples: could not load sample:', sample, 'reason:', e)
            reject()
          }
        }

        this.generateNoise()
        this.loaded = true
        resolve()
      }

      // abandoned noise worklet that did not work out so well...
      // try {
      //   if (window.isSecureContext) {
      //     await this.audioContext.audioWorklet.addModule('samples/worklets.js')
      //   } else {
      //     this.generateNoise()
      //   }
      // } catch (e) {
      //   console.warn('AudioFX.loadSamples: could not load worklets:', e)
      //   throw e
      // }
    })
  }

  generateNoise () {
    const buffers = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate)

    for (let c = 0; c < buffers.numberOfChannels; c++) {
      const buffer = buffers.getChannelData(c)
      for (let i = 0; i < buffers.length; i++) {
        buffer[i] = Math.random() * 2 - 1
      }
    }

    this.noiseBuffer = buffers
  }

  setVolume (volume) {
    this.volume = Math.max(volume, 0.0)
    if (this.volume <= 0) {
      this.audioContext.suspend()
    } else {
      this.resume()
    }
  }

  setVibrationStrength (strength) {
    this.vibrationStrength = strength
  }

  playProgram (programName, options = {}) {
    if (!this.loaded) {
      return
    }

    const program = programs[programName]
    if (!program) {
      console.warn('AudioFX.playProgram: could not find program', programName)
      return
    }
    const sample = this.bufferMap[program.sample]
    if (!sample) {
      console.warn('AudioFX.playProgram: could not find sample', sample)
      return
    }

    if (program.complex) {
      console.warn('AudioFX.playProgram: could not play', programName, 'because its a complex program')
      return
    }

    const vibrate = options.vibrate ? options.vibrate : program.vibrate
    if (vibrate != null && this.vibrationStrength > 0) {
      window.navigator.vibrate(vibrate * this.vibrationStrength)
    }

    if (this.volume <= 0) {
      return
    }

    const bufferSource = this.audioContext.createBufferSource()
    // bufferSource.playbackRate = basePlaybackRate
    bufferSource.buffer = sample

    const rate = options.rate ? options.rate : program.rate
    if (rate != null) {
      bufferSource.playbackRate.setValueAtTime(rate, this.audioContext.currentTime)
    }

    let dspRackTop = bufferSource

    const volume = options.volume ? options.volume : program.volume
    if (volume != null) {
      const gainNode = this.audioContext.createGain()
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      dspRackTop.connect(gainNode)
      dspRackTop = gainNode
    }

    dspRackTop.connect(this.audioContext.destination)
    bufferSource.start(options.delay ? options.delay : 0)
    return bufferSource
  }

  startComplexProgram (programName) {
    if (!this.loaded) {
      return
    }

    const program = programs[programName]
    if (!program) {
      console.warn('AudioFX.startComplexProgram: could not find program', programName)
      return
    }

    if (!program.complex) {
      console.warn('AudioFX.startComplexProgram: could not play', programName, 'because its not a complex program')
      return
    }

    return program.complex.call(this)
  }
}
