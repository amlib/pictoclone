import { cloneDeep } from 'lodash'

const tileSpec = [
  {
    name: 'corner',
    variants: ['tl', 'tr', 'bl', 'br'],
    notchable: true,
    positionX: {
      tl: 'top',
      tr: 'top',
      bl: 'bottom',
      br: 'bottom'
    },
    positionY: {
      tl: 'left',
      tr: 'right',
      bl: 'left',
      br: 'right'
    },
    sizeX: {
      tl: false,
      tr: false,
      bl: false,
      br: false
    },
    sizeY: {
      tl: false,
      tr: false,
      bl: false,
      br: false
    }
  },
  {
    name: 'straight',
    variants: ['t', 'r', 'b', 'l'],
    notchable: false,
    positionX: {
      t: 'top',
      r: 'top',
      b: 'bottom',
      l: 'top'
    },
    positionY: {
      t: 'left',
      r: 'right',
      b: 'left',
      l: 'left'
    },
    sizeX: {
      t: true,
      r: false,
      b: true,
      l: false
    },
    sizeY: {
      t: false,
      r: true,
      b: false,
      l: true
    }
  },
  {
    name: 'center',
    variants: [''],
    notchable: false,
    positionX: {
      '': 'top'
    },
    positionY: {
      '': 'left'
    },
    sizeX: {
      '': true
    },
    sizeY: {
      '': true
    }
  }
]

const mainMap = [
  {
    x: 0, y: 0, w: 4, h: 4, alias: 'corner1-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 4, y: 0, w: 4, h: 4, alias: 'corner1-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 8, y: 0, w: 4, h: 4, alias: 'corner1-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 12, y: 0, w: 4, h: 4, alias: 'corner1-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 16, y: 0, w: 4, h: 4, alias: 'corner2-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 20, y: 0, w: 4, h: 4, alias: 'corner2-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 24, y: 0, w: 4, h: 4, alias: 'corner2-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 28, y: 0, w: 4, h: 4, alias: 'corner2-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 32, y: 0, w: 4, h: 4, alias: 'straight-t',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'top',
    top: 0, left: 4, bottom: 0, right: 4, offsetX: 0, offsetY: 4
  },
  {
    x: 36, y: 0, w: 4, h: 4, alias: 'straight-r',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'right',
    top: 4, left: 0, bottom: 4, right: 0, offsetX: 4, offsetY: 0
  },
  {
    x: 40, y: 0, w: 4, h: 4, alias: 'straight-b',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom',
    top: 0, left: 4, bottom: 0, right: 4, offsetX: 0, offsetY: 4
  },
  {
    x: 44, y: 0, w: 4, h: 4, alias: 'straight-l',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'left',
    top: 4, left: 0, bottom: 4, right: 0, offsetX: 4, offsetY: 0
  },
  {
    x: 48, y: 0, w: 4, h: 4, alias: 'center',
    backgroundRepeat: 'repeat', backgroundPosition: null,
    top: 0, left: 4, bottom: 0, right: 4, offsetX: 4, offsetY: 4
  }
]

const brushMap = [
  {
    x: 0, y: 0, w: 1, h: 1, alias: '1px',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0, noSuperSample: true
  },
  {
    x: 1, y: 0, w: 2, h: 2, alias: '2px',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0, noSuperSample: true
  },
  {
    x: 10, y: 0, w: 5, h: 5, alias: '5px',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0, noSuperSample: true
  }
]

const smallButtonMap = [
  {
    x: 0, y: 0, w: 2, h: 2, alias: 'corner1-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 2, y: 0, w: 2, h: 2, alias: 'corner1-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 4, y: 0, w: 2, h: 2, alias: 'corner1-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 6, y: 0, w: 2, h: 2, alias: 'corner1-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'corner2-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-t',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'top',
    top: 0, left: 2, bottom: 0, right: 2, offsetX: 0, offsetY: 2
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-r',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'right',
    top: 2, left: 0, bottom: 2, right: 0, offsetX: 2, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-b',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom',
    top: 0, left: 2, bottom: 0, right: 2, offsetX: 0, offsetY: 2
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-l',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'left',
    top: 2, left: 0, bottom: 2, right: 0, offsetX: 2, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'center',
    backgroundRepeat: 'repeat', backgroundPosition: null,
    top: 0, left: 2, bottom: 0, right: 2, offsetX: 2, offsetY: 2
  }
]

const iconMap = [
  {
    x: 0, y: 0, w: 25, h: 17, alias: 'copy',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 25, y: 0, w: 27, h: 26, alias: 'send',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 52, y: 0, w: 25, h: 18, alias: 'clear',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 0, y: 26, w: 12, h: 12, alias: 'symbols2',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 12, y: 26, w: 12, h: 12, alias: 'symbols1',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 24, y: 26, w: 12, h: 12, alias: 'kana',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 36, y: 26, w: 12, h: 12, alias: 'accents',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 48, y: 26, w: 12, h: 12, alias: 'romaji',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 60, y: 26, w: 12, h: 12, alias: 'brush-small',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 72, y: 26, w: 12, h: 12, alias: 'brush-big',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 84, y: 26, w: 12, h: 12, alias: 'brush-bigger',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 0, y: 38, w: 12, h: 11, alias: 'brush',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 12, y: 38, w: 12, h: 11, alias: 'eraser',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 24, y: 38, w: 14, h: 14, alias: 'arrow-down',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 38, y: 38, w: 14, h: 14, alias: 'arrow-up',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 52, y: 38, w: 12, h: 11, alias: 'bucket',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  }
]

const keyboardMap = [
  {
    x: 0, y: 0, w: 23, h: 13, alias: 'backspace',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 23, y: 0, w: 32, h: 13, alias: 'enter',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 0, y: 13, w: 15, h: 13, alias: 'caps',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 15, y: 13, w: 23, h: 13, alias: 'shift',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 38, y: 13, w: 19, h: 12, alias: 'space',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 0, y: 26, w: 16, h: 13, alias: 'small-backspace',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 15, y: 26, w: 18, h: 11, alias: 'small-space',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 66, y: 0, w: 18, h: 29, alias: 'small-enter',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 0, y: 39, w: 15, h: 11, alias: 'hiragana',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 15, y: 39, w: 15, h: 12, alias: 'katakana',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 30, y: 39, w: 15, h: 12, alias: 'tenten',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 45, y: 39, w: 15, h: 12, alias: 'maru',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  },
  {
    x: 60, y: 39, w: 15, h: 9, alias: 'komoji',
    backgroundRepeat: 'no-repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0
  }
]

const thinFrame = [
  {
    x: 0, y: 0, w: 2, h: 2, alias: 'corner1-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 2, y: 0, w: 2, h: 2, alias: 'corner1-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 4, y: 0, w: 2, h: 2, alias: 'corner1-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 6, y: 0, w: 2, h: 2, alias: 'corner1-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 0, y: 0, w: 2, h: 2, alias: 'corner2-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 2, y: 0, w: 2, h: 2, alias: 'corner2-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 4, y: 0, w: 2, h: 2, alias: 'corner2-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 6, y: 0, w: 2, h: 2, alias: 'corner2-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 8, y: 0, w: 2, h: 2, alias: 'straight-t',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'top',
    top: 0, left: 2, bottom: 0, right: 2, offsetX: 0, offsetY: 2
  },
  {
    x: 10, y: 0, w: 2, h: 2, alias: 'straight-r',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'right',
    top: 2, left: 0, bottom: 2, right: 0, offsetX: 2, offsetY: 0
  },
  {
    x: 12, y: 0, w: 2, h: 2, alias: 'straight-b',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom',
    top: 0, left: 2, bottom: 0, right: 2, offsetX: 0, offsetY: 2
  },
  {
    x: 14, y: 0, w: 2, h: 2, alias: 'straight-l',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'left',
    top: 2, left: 0, bottom: 2, right: 0, offsetX: 2, offsetY: 0
  },
  {
    x: 16, y: 0, w: 2, h: 2, alias: 'center',
    backgroundRepeat: 'repeat', backgroundPosition: null,
    top: 0, left: 2, bottom: 0, right: 2, offsetX: 2, offsetY: 2
  }
]

const largeBeveledButton = [
  {
    x: 0, y: 0, w: 3, h: 3, alias: 'corner1-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 3, y: 0, w: 3, h: 3, alias: 'corner1-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 6, y: 0, w: 3, h: 3, alias: 'corner1-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 9, y: 0, w: 3, h: 3, alias: 'corner1-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 0, y: 0, w: 3, h: 3, alias: 'corner2-tl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 3, y: 0, w: 3, h: 3, alias: 'corner2-tr',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 6, y: 0, w: 3, h: 3, alias: 'corner2-bl',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 9, y: 0, w: 3, h: 3, alias: 'corner2-br',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 12, y: 0, w: 3, h: 3, alias: 'straight-t',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'top',
    top: 0, left: 3, bottom: 0, right: 3, offsetX: 0, offsetY: 3
  },
  {
    x: 15, y: 0, w: 3, h: 3, alias: 'straight-r',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'right',
    top: 3, left: 0, bottom: 3, right: 0, offsetX: 3, offsetY: 0
  },
  {
    x: 18, y: 0, w: 3, h: 3, alias: 'straight-b',
    backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom',
    top: 0, left: 3, bottom: 0, right: 3, offsetX: 0, offsetY: 3
  },
  {
    x: 21, y: 0, w: 3, h: 3, alias: 'straight-l',
    backgroundRepeat: 'repeat-y', backgroundPosition: 'left',
    top: 3, left: 0, bottom: 3, right: 0, offsetX: 3, offsetY: 0
  },
  {
    x: 0, y: 6, w: 1, h: 12, alias: 'center',
    backgroundRepeat: 'repeat', backgroundPosition: null,
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 3, offsetY: 3
  }
]

const gridBackground = [
  {
    x: 0, y: 0, w: 16, h: 16, alias: 'blank',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 16, y: 0, w: 16, h: 16, alias: 'input-pre-border-left',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 32, y: 0, w: 16, h: 16, alias: 'input-border-left',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 48, y: 0, w: 16, h: 16, alias: 'input',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 64, y: 0, w: 16, h: 16, alias: 'input-post-border-right',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  },
  {
    x: 80, y: 0, w: 16, h: 16, alias: 'input-caret',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'top left',
    top: 0, left: 0, bottom: 0, right: 0, offsetX: 0, offsetY: 0
  }
]

const tileMap = [
  {
    groupName: 'main-button', x: 0, y: 0,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-highlight', x: 0, y: 4,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-inverted', x: 0, y: 8,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-color-fill', x: 0, y: 12, colorVariations: true,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-background', x: 0, y: 16,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-foreground', x: 0, y: 20,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-drawing-area', x: 0, y: 24, colorVariations: true,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'main-color-background', x: 0, y: 28, colorVariations: true,
    map: cloneDeep(mainMap)
  },
  {
    groupName: 'brush-normal', x: 52, y: 0,
    map: cloneDeep(brushMap)
  },
  {
    groupName: 'small-button', x: 0, y: 32,
    map: cloneDeep(smallButtonMap)
  },
  {
    groupName: 'small-button-highlight', x: 10, y: 32, colorVariations: true,
    map: cloneDeep(smallButtonMap)
  },
  {
    groupName: 'keyboard-normal', x: 20, y: 32,
    map: cloneDeep(smallButtonMap)
  },
  {
    groupName: 'keyboard-special', x: 30, y: 32,
    map: cloneDeep(smallButtonMap)
  },
  {
    groupName: 'keyboard-highlight', x: 40, y: 32,
    map: cloneDeep(smallButtonMap)
  },
  {
    groupName: 'icon-normal', x: 0, y: 34,
    map: cloneDeep(iconMap)
  },
  {
    groupName: 'icon-color-fill', x: 0, y: 86, colorVariations: true,
    map: cloneDeep(iconMap)
  },
  {
    groupName: 'icon-keyboard-normal', x: 0, y: 138,
    map: cloneDeep(keyboardMap)
  },
  {
    groupName: 'icon-keyboard-highlight', x: 0, y: 190, colorVariations: true,
    map: cloneDeep(keyboardMap)
  },
  {
    groupName: 'thin-frame', x: 4, y: 247,
    map: cloneDeep(thinFrame)
  },
  {
    groupName: 'beveled-button', x: 4, y: 249,
    map: cloneDeep(thinFrame)
  },
  {
    groupName: 'beveled-button-highlight', x: 4, y: 251,
    map: cloneDeep(thinFrame)
  },
  {
    groupName: 'large-beveled-button', x: 0, y: 241,
    map: cloneDeep(largeBeveledButton)
  },
  {
    groupName: 'large-beveled-button-inverted', x: 0, y: 244,
    // eslint-disable-next-line no-return-assign
    map: cloneDeep(largeBeveledButton).map(a => a.alias === 'center' ? (a.x = 2, a.y = 3, a) : a)
  },
  {
    groupName: 'grid-background', x: 0, y: 259,
    map: cloneDeep(gridBackground)
  }
]

// all tiles were authored with colorIndex 2 (pure-ish red) as a base
const baseColorIndex = 2

export { tileMap, tileSpec, baseColorIndex }
