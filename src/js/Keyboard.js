const layouts = {
  romaji: {
    sections: [
      {
        class: 'row1',
        keyClass: 'key-14px',
        keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
        shiftKeys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+']
      },
      {
        class: 'row2',
        keyClass: 'key-15px',
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'backspace'],
        shiftKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'backspace']
      },
      {
        class: 'row3',
        keyClass: 'key-15px',
        keys: ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter'],
        shiftKeys: ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'enter']
      },
      {
        class: 'row4',
        keyClass: 'key-15px',
        keys: ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        shiftKeys: ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
      },
      {
        class: 'row5',
        keyClass: 'key-14px',
        keys: [';', '\'', 'space', '[', ']'],
        shiftKeys: [':', '"', 'space', '{', '}']
      }
    ]
  },
  accents: {
    sections: [
      {
        class: 'row1',
        keyClass: 'key-15px-slim',
        keys: ['à', 'á', 'â', 'ä', 'ã', 'À', 'Á', 'Â', 'Ä', 'ç', 'ñ']
      },
      {
        class: 'row2',
        keyClass: 'key-15px-slim',
        keys: ['ì', 'í', 'î', 'ï', '¡', 'Ì', 'Í', 'Î', 'Ï', 'Ç', 'Ñ', 'small-backspace']
      },
      {
        class: 'row3',
        keyClass: 'key-15px-slim',
        keys: ['ù', 'ú', 'û', 'ü', '¿', 'Ù', 'Ú', 'Û', 'Ü', 'œ', 'æ', 'small-enter']
      },
      {
        class: 'row4',
        keyClass: 'key-15px-slim',
        keys: ['è', 'é', 'ê', 'ë', 'ß', 'È', 'É', 'Ê', 'Ë', 'Œ', 'Æ']
      },
      {
        class: 'row5',
        keyClass: 'key-15px-slim',
        keys: ['ò', 'ó', 'ô', 'ö', 'õ', 'Ò', 'Ó', 'Ô', 'Ö', 'ɍ', '¶', 'small-space']
      }
    ]
  },
  kana: {
    sections: [
      {
        class: 'row1',
        keyClass: 'key-15px-slim',
        keys: ['hiragana', 'あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'ー'],
        shiftKeys: ['hiragana', 'ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ', 'ー']
      },
      {
        class: 'row2',
        keyClass: 'key-15px-slim',
        keys: ['katakana', 'い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'ゆ', 'り', 'を', 'small-backspace'],
        shiftKeys: ['katakana', 'イ', 'キ', 'シ', 'チ', 'ニ', 'ヒ', 'ミ', 'ユ', 'リ', 'ヲ', 'small-backspace']
      },
      {
        class: 'row3',
        keyClass: 'key-15px-slim',
        keys: ['tenten', 'う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'よ', 'る', 'ん', 'small-enter'],
        shiftKeys: ['tenten', 'ウ', 'ク', 'ス', 'ツ', 'ヌ', 'フ', 'ム', 'ヨ', 'ル', 'ン', 'small-enter']
      },
      {
        class: 'row4',
        keyClass: 'key-15px-slim',
        keys: ['maru', 'え', 'け', 'せ', 'て', 'ね', 'へ', 'め', '！', 'れ', '、'],
        shiftKeys: ['maru', 'エ', 'ケ', 'セ', 'テ', 'ネ', 'ヘ', 'メ', '！', 'レ', '、']
      },
      {
        class: 'row5',
        keyClass: 'key-15px-slim',
        keys: ['komoji', 'お', 'こ', 'そ', 'と', 'の', 'は', 'も', '？', 'ろ', '。', 'small-space'],
        shiftKeys: ['komoji', 'オ', 'コ', 'ソ', 'ト', 'ノ', 'ハ', 'モ', '？', 'ロ', '。', 'small-space']
      }
    ]
  },
  symbols1: {
    sections: [
      {
        class: 'row1',
        keyClass: 'key-15px-slim',
        keys: ['!', '?', '&', '"', '\'', '~', ':', ';', '@', '˜', '_', '€']
      },
      {
        class: 'row2',
        keyClass: 'key-15px-slim',
        keys: ['+', '-', '*', '/', '×', '÷', '=', '→', '←', '↑', '↓', 'small-backspace']
      },
      {
        class: 'row3',
        keyClass: 'key-15px-slim',
        keys: ['「', '」', '“', '”', '(', ')', '<', '>', '{', '}', '•', 'small-enter']
      },
      {
        class: 'row4',
        keyClass: 'key-15px-slim',
        keys: ['%', '♨', '〒', '#', '♭', '♪', '±', '$', '¢', '£', '\\']
      },
      {
        class: 'row5',
        keyClass: 'key-15px-slim',
        keys: ['^', '゜', '|', '／', '＼', '∞', '∴', '…', '™', '©', '®', 'small-space']
      }
    ]
  },
  symbols2: {
    sections: [
      {
        class: 'row1',
        keyClass: 'key-15px-slim',
        keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '=', 'π']
      },
      {
        class: 'row2',
        keyClass: 'key-15px-slim',
        keys: ['☸', '☹', '☺', '☻', '☼', '☁', '☂', '☃', '✉', '☎', '☄', 'small-backspace']
      },
      {
        class: 'row3',
        keyClass: 'key-15px-slim',
        keys: ['☰', '☱', '☲', '☳', '☴', '☵', '✜', '♠', '♦', '♥', '♣', 'small-enter']
      },
      {
        class: 'row4',
        keyClass: 'key-15px-slim',
        keys: ['☶', '☷', '+', '-', '✫', '✲', '◇', '□', '△', '▽', '◎']
      },
      {
        class: 'row5',
        keyClass: 'key-15px-slim',
        keys: ['➔', '➕', '➖', '➗', '✬', '✱', '◆', '█', '▲', '▼', '✕', 'small-space']
      }
    ]
  }
}

const uniqueKeyTile = {
  backspace: true,
  enter: true,
  caps: true,
  shift: true,
  space: true,
  'small-enter': true,
  'small-backspace': true,
  'small-space': true,
  hiragana: true,
  katakana: true,
  maru: true,
  tenten: true,
  komoji: true
}

const uniqueKeyIcon = {
  backspace: true,
  enter: true,
  caps: true,
  shift: true,
  space: true,
  'small-enter': true,
  'small-backspace': true,
  'small-space': true,
  hiragana: true,
  katakana: true,
  maru: true,
  tenten: true,
  komoji: true
}

const uniqueKeyIconMargin = {
  backspace: [1, 1],
  enter: [1, 1],
  caps: [1, 1],
  shift: [1, 1],
  space: [1, 29],
  'small-enter': [1, 0],
  'small-backspace': [1, 1],
  'small-space': [1, 0],
  hiragana: [1, 1],
  katakana: [1, 1],
  maru: [1, 1],
  tenten: [1, 1],
  komoji: [1, 1]
}

const uniqueKeyClass = {
  'small-enter': 'small-enter',
  ー: 'wide-kana-dash',
  'small-space': 'small-space',
  komoji: 'komoji',
  hiragana: 'hiragana',
  ò: 'komoji',
  à: 'hiragana',
  '!': 'hiragana',
  '^': 'komoji',
  1: 'hiragana',
  '➔': 'komoji'
}

const komojiMap = {
  あ: 'ぁ',
  い: 'ぃ',
  う: 'ぅ',
  え: 'ぇ',
  お: 'ぉ',
  つ: 'っ',
  や: 'ゃ',
  ゆ: 'ゅ',
  よ: 'ょ',
  わ: 'ゎ',
  ア: 'ァ',
  イ: 'ィ',
  ウ: 'ゥ',
  エ: 'ェ',
  オ: 'ォ',
  ツ: 'ッ',
  ヤ: 'ャ',
  ユ: 'ュ',
  ヨ: 'ョ',
  ワ: 'ヮ'
}

const tentenMap = {
  か: 'が',
  き: 'ぎ',
  く: 'ぐ',
  け: 'げ',
  こ: 'ご',
  さ: 'ざ',
  し: 'じ',
  す: 'ず',
  せ: 'ぜ',
  そ: 'ぞ',
  た: 'だ',
  ち: 'ぢ',
  つ: 'づ',
  て: 'で',
  は: 'ば',
  ひ: 'び',
  ふ: 'ぶ',
  へ: 'べ',
  ほ: 'ぼ',
  カ: 'ガ',
  キ: 'ギ',
  ク: 'グ',
  ケ: 'ゲ',
  コ: 'ゴ',
  サ: 'ザ',
  シ: 'ジ',
  ス: 'ズ',
  セ: 'ゼ',
  ソ: 'ゾ',
  タ: 'ダ',
  チ: 'ヂ',
  ツ: 'ヅ',
  テ: 'デ',
  ハ: 'バ',
  ヒ: 'ビ',
  フ: 'ブ',
  ヘ: 'ベ',
  ホ: 'ボ'
}

const maruMap = {
  は: 'ぱ',
  ひ: 'ぴ',
  ふ: 'ぷ',
  へ: 'ぺ',
  ほ: 'ぽ',
  ハ: 'パ',
  ヒ: 'ピ',
  フ: 'プ',
  ヘ: 'ペ',
  ホ: 'ポ'
}

export {
  layouts,
  uniqueKeyTile, uniqueKeyIcon, uniqueKeyIconMargin, uniqueKeyClass,
  komojiMap, tentenMap, maruMap
}
