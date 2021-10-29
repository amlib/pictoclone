const layouts = {
  romaji: {
    sections: [
      {
        class: 'romaji-row1',
        keyClass: 'key-14px',
        keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
        shiftKeys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+']
      },
      {
        class: 'romaji-row2',
        keyClass: 'key-15px',
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'backspace'],
        shiftKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'backspace']
      },
      {
        class: 'romaji-row2',
        keyClass: 'key-15px',
        keys: ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter'],
        shiftKeys: ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'enter']
      },
      {
        class: 'romaji-row4',
        keyClass: 'key-15px',
        keys: ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        shiftKeys: ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
      },
      {
        class: 'romaji-row5',
        keyClass: 'key-14px',
        keys: [';', '\'', 'space', '[', ']'],
        shiftKeys: [':', '"', 'space', '{', '}']
      }
    ]
  }
}

const uniqueKeyTile = {
  backspace: true,
  enter: true,
  caps: true,
  shift: true,
  space: true
}

const uniqueKeyIcon = {
  backspace: true,
  enter: true,
  caps: true,
  shift: true,
  space: true
}

const uniqueKeyIconMargin = {
  backspace: [1, 1, 1, 1],
  enter: [1, 1, 1, 1],
  caps: [1, 1, 1, 1],
  shift: [1, 1, 1, 1],
  space: [1, 29, 1, 29]
}

export { layouts, uniqueKeyTile, uniqueKeyIcon, uniqueKeyIconMargin }
