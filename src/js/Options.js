const vibration = [
  {
    description: 'Off',
    value: 0
  },
  {
    description: 'Weak',
    value: 70
  },
  {
    description: 'Strong',
    value: 120
  }
]

const orientation = [
  {
    description: 'Auto',
    value: 0,
    recommended: true
  },
  {
    description: 'Landscape',
    value: 1
  },
  {
    description: 'Portrait',
    value: 2
  }
]

const superSampling = [
  {
    description: '1x',
    value: 1
  },
  {
    description: '2x',
    value: 2
  },
  {
    description: '3x',
    value: 3
  },
  {
    description: '4x',
    value: 4
  }
]

const upscaleStyle = [
  {
    description: 'Sharp',
    value: 'rendering-pixel'
  },
  {
    description: 'Smooth',
    value: 'rendering-quality',
    recommended: true
  }
]

const sound = [
  {
    description: 'ON',
    value: false,
    recommended: true
  },
  {
    description: 'OFF',
    value: true
  }
]

const mobileAssists = [
  {
    description: 'ON',
    value: true
  },
  {
    description: 'OFF',
    value: false
  }
]

const generic = [
  {
    description: 'ON',
    value: true,
    recommended: true
  },
  {
    description: 'OFF',
    value: false
  }
]

export { superSampling, vibration, generic, mobileAssists, orientation, sound, upscaleStyle }
