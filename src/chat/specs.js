const textDec = new TextDecoder('utf-8')
const textEnc = new TextEncoder('utf-8')

// each value in key value pair must be unique!
const messageTypesStr = Object.freeze(new Map([
  ['MSG_TYPE_GENERIC_ERROR', 0],
  ['MSG_TYPE_NEW_CONNECTION_RESULT', 1],
  ['MSG_TYPE_CREATE_ROOM', 10],
  ['MSG_TYPE_CREATE_ROOM_RESULT', 11],
  ['MSG_TYPE_CONNECT_ROOM', 12],
  ['MSG_TYPE_CONNECT_ROOM_RESULT', 13],
  ['MSG_TYPE_LEAVE_ROOM', 14],
  ['MSG_TYPE_LEAVE_ROOM_RESULT', 15],
  ['MSG_TYPE_USER_LIST_CHANGE', 16],
  ['MSG_TYPE_SEND_CHAT_MESSAGE', 20],
  ['MSG_TYPE_SEND_CHAT_MESSAGE_RESULT', 21],
  ['MSG_TYPE_RECEIVE_CHAT_MESSAGES', 30]
]))

const messageTypesInt = Object.freeze(new Map([...messageTypesStr].map(x => [x[1], x[0]])))

const isMessageTypeResult = Object.freeze(new Map([...messageTypesStr].map(x => [ x[1], x[0].match('_RESULT$') != null])))

const maxIncomingPayloadSize = Object.freeze(new Map([
  [messageTypesStr.get('MSG_TYPE_GENERIC_ERROR'), -1],
  [messageTypesStr.get('MSG_TYPE_NEW_CONNECTION_RESULT'), -1],
  [messageTypesStr.get('MSG_TYPE_CREATE_ROOM'), 32],
  [messageTypesStr.get('MSG_TYPE_CREATE_ROOM_RESULT'), -1],
  [messageTypesStr.get('MSG_TYPE_CONNECT_ROOM'), 64],
  [messageTypesStr.get('MSG_TYPE_CONNECT_ROOM_RESULT'), -1],
  [messageTypesStr.get('MSG_TYPE_LEAVE_ROOM'), 32],
  [messageTypesStr.get('MSG_TYPE_LEAVE_ROOM_RESULT'), -1],
  [messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE'), 32 * 1024],
  [messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE_RESULT'), -1],
  [messageTypesStr.get('MSG_TYPE_RECEIVE_CHAT_MESSAGES'), -1]
]))

// each value in key value pair must be unique!
const errorsStr = Object.freeze(new Map([
  ['ERROR_GENERIC_ERROR', 0],
  ['ERROR_NO_UNIQUE_ID', 1],
  ['ERROR_INVALID_UNIQUE_ID', 2],
  ['ERROR_INVALID_USER_NAME', 3],
  ['ERROR_INVALID_COLOR_INDEX', 4],
  ['ERROR_MESSAGE_RESULT_REJECTED', 10],
  ['ERROR_MESSAGE_RESULT_TIMEOUT', 11],
  ['ERROR_MESSAGE_RESULT_NO_PROMISE', 12],
  ['ERROR_MESSAGE_RESULT_EXPIRED', 13],
  ['ERROR_MESSAGE_UNIMPLEMENTED_MESSAGE_TYPE', 14],
  ['ERROR_ROOM_ALREADY_EXISTS', 20],
  ['ERROR_ROOM_DOES_NOT_EXISTS', 21],
  ['ERROR_ROOM_NO_FREE_SLOTS', 22],
  ['ERROR_ROOM_USER_ALREADY_TAKEN', 23],
  ['ERROR_ROOM_NOT_IN_ANY_ROOM', 24],
  ['ERROR_ROOM_ALREADY_IN_A_ROOM', 25],
  ['ERROR_CHAT_MESSAGE_INVALID_IMAGE', 30],
]))

const errorsInt = Object.freeze(new Map([...errorsStr].map(x => [x[1], x[0]])))

const messageHeaderOffset = 9
const colorIndexSize = 15
const nameSize = 10
const maxImageSize = 32 * 1024

/* Decoding Stuff */

const decodeMessageHeader = function (payload) {
  const view = new DataView(payload)
  const type = view.getUint8(0)
  const uniqueId = Number(view.getBigUint64(1))
  let payloadOffset = messageHeaderOffset

  const message = {
    type: type,
    uniqueId: uniqueId
  }

  return {
    message,
    payloadOffset
  }
}

const decodeMessage = function (message, payload, payloadOffset) {
  return messageTypesDecoder.get(message.type)(message, payload, payloadOffset)
}

const decodeString = function (payload, payloadOffset, maxSize = null) {
  const view = new DataView(payload, payloadOffset)
  const stringSize = view.getUint32(0)
  const string = textDec.decode(new Uint8Array(payload, payloadOffset + 4, maxSize != null && stringSize > maxSize ? maxSize : stringSize))
  return {
    string,
    newPayloadOffset: payloadOffset + 4 + stringSize
  }
}

const messageTypesDecoder = Object.freeze(new Map([
  // MSG_TYPE_GENERIC_ERROR
  [0, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    message.errorCode = view.getUint8(0)
    let { string, newPayloadOffset } = decodeString(payload, payloadOffset + 1)
    message.errorMessage = string
    return newPayloadOffset
  }],
  // MSG_TYPE_NEW_CONNECTION_RESULT
  [1, function (message, payload, payloadOffset) {
    return 0
  }],
  // MSG_TYPE_CREATE_ROOM
  [10, function (message, payload, payloadOffset) {
    return 0
  }],
  // MSG_TYPE_CREATE_ROOM_RESULT
  [11, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    message.success = view.getUint8(0)
    if (message.success) {
      message.code = view.getUint32(1)
      return 5
    } else {
      console.log('unimplemented')
    }
  }],
  // MSG_TYPE_CONNECT_ROOM
  [12, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    message.code = view.getUint32(0)
    message.colorIndex = view.getUint8(4)
    let { string, newPayloadOffset } = decodeString(payload, payloadOffset + 5)
    message.userName = string
    return newPayloadOffset
  }],
  // MSG_TYPE_CONNECT_ROOM_RESULT
  [13, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    message.success = view.getUint8(0)
    if (message.success) {
      message.publicId = view.getUint32(1)
      const userListLength = view.getUint8(5)

      message.userList = new Array(userListLength)
      let currentArrayOffset = payloadOffset + 1 + 4 + 1
      for (let i = 0; i < userListLength; ++i) {
        const user = {}
        message.userList[i] = user
        let view = new DataView(payload, currentArrayOffset)
        const userSize = view.getUint32(0)
        user.publicId = view.getUint32(4)
        user.colorIndex = view.getUint8(8)
        let string, newPayloadOffset;
        ({ string, newPayloadOffset } = decodeString(payload, currentArrayOffset + 9))
        user.userName = string
        currentArrayOffset = newPayloadOffset
      }

      return currentArrayOffset
    } else {
      message.errorCode = view.getUint8(1)
      let { string, newPayloadOffset } = decodeString(payload, payloadOffset + 2, nameSize * 4)
      message.errorMessage = string
      return newPayloadOffset
    }
  }],
  // MSG_TYPE_LEAVE_ROOM
  [14, function (message, payload, payloadOffset) {
    return 0
  }],
  // MSG_TYPE_LEAVE_ROOM_RESULT
  [15, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    message.success = view.getUint8(0)
    if (message.success) {
      return 1
    } else {
      message.errorCode = view.getUint8(1)
      let { string, newPayloadOffset } = decodeString(payload, payloadOffset + 2)
      message.errorMessage = string
      return newPayloadOffset
    }
  }],
  // MSG_TYPE_USER_LIST_CHANGE
  [16, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    const userListLength = view.getUint8(0)

    message.userList = new Array(userListLength)
    let currentArrayOffset = payloadOffset + 1
    for (let i = 0; i < userListLength; ++i) {
      const user = {}
      message.userList[i] = user
      let view = new DataView(payload, currentArrayOffset)
      const userSize = view.getUint32(0)
      user.publicId = view.getUint32(4)
      user.colorIndex = view.getUint8(8)
      let string, newPayloadOffset;
      ({ string, newPayloadOffset } = decodeString(payload, currentArrayOffset + 9))
      user.userName = string
      currentArrayOffset = newPayloadOffset
    }

    return currentArrayOffset
  }],
  // MSG_TYPE_SEND_CHAT_MESSAGE
  [20, function (message, payload, payloadOffset) {
    let view = new DataView(payload, payloadOffset)
    message.timestamp = view.getBigInt64(0)
    let { string, newPayloadOffset } = decodeString(payload, payloadOffset + 8)
    message.text = string
    view = new DataView(payload, newPayloadOffset)
    const imageSize =  view.getUint32(0)

    // SharedArrayBuffer keeps buffer from detaching
    // maybe it yields more performance?
    const shared = new SharedArrayBuffer(imageSize)
    const uint8 = new Uint8Array(shared)
    uint8.set(new Uint8Array(payload, newPayloadOffset + 4, imageSize))
    message.image = uint8

    // Another way of fixing is using slice()
    // without slice arraybuffer would become detached
    // message.image = (new Uint8Array(payload, newPayloadOffset + 4, imageSize)).slice()
    return newPayloadOffset
  }],
  // MSG_TYPE_SEND_CHAT_MESSAGE_RESULT
  [21, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    message.success = view.getUint8(0)
    if (message.success) {
      return 1
    } else {
      message.errorCode = view.getUint8(1)
      let { string, newPayloadOffset } = decodeString(payload, payloadOffset + 2)
      message.errorMessage = string
      return newPayloadOffset
    }
  }],
  // MSG_TYPE_RECEIVE_CHAT_MESSAGES
  [30, function (message, payload, payloadOffset) {
    const view = new DataView(payload, payloadOffset)
    const chatMessagesLength = view.getUint8(0)

    message.chatMessages = new Array(chatMessagesLength)
    let currentArrayOffset = payloadOffset + 1
    for (let i = 0; i < chatMessagesLength; ++i) {
      const chatMessage = {}
      message.chatMessages[i] = chatMessage
      let view = new DataView(payload, currentArrayOffset)
      const chatMessageSize = view.getUint32(0)
      chatMessage.timestamp = Number(view.getBigInt64(4))
      chatMessage.colorIndex = view.getUint8(12)
      let string, newPayloadOffset;
      ({ string, newPayloadOffset } = decodeString(payload, currentArrayOffset + 13))
      chatMessage.text = string;
      ({ string, newPayloadOffset } = decodeString(payload, newPayloadOffset))
      chatMessage.userName = string
      currentArrayOffset = newPayloadOffset
      view = new DataView(payload, currentArrayOffset)
      const imageSize = view.getUint32(0)
      chatMessage.image = new Uint8Array(payload, currentArrayOffset + 4, imageSize)
      currentArrayOffset = currentArrayOffset + 4 + imageSize
    }

    return currentArrayOffset
  }],
]))

/* Encoding stuff */

const encodeMessageHeader = function (message, payload) {
  const view = new DataView(payload)
  view.setUint8(0, message.type)
  view.setBigUint64(1, BigInt(message.uniqueId))
}

const encodeMessage = function (message) {
  const payload = messageTypesEncoder.get(message.type)(message, messageHeaderOffset)
  encodeMessageHeader(message, payload)
  return payload
}

const encodeString = function (string, payload, payloadOffset) {
  const view = new DataView(payload, payloadOffset)
  view.setUint32(0, string.length)
  const { written } = textEnc.encodeInto(string, (new Uint8Array(payload)).subarray(payloadOffset + 4))
  return payloadOffset + 4 + written
}

const messageTypesEncoder = Object.freeze(new Map([
  // MSG_TYPE_GENERIC_ERROR
  [0, function (message, headerOffset) {
    const payload = new ArrayBuffer(headerOffset + 1 + (4 + message.errorMessage.length))
    const view = new DataView(payload, headerOffset)

    view.setUint8(0, message.errorCode)
    encodeString(message.errorMessage, payload, headerOffset + 1)
    return payload
  }],
  // MSG_TYPE_NEW_CONNECTION_RESULT
  [1, function (message, headerOffset) {
    return new ArrayBuffer(headerOffset)
  }],
  // MSG_TYPE_CREATE_ROOM
  [10, function (message, headerOffset) {
    return new ArrayBuffer(headerOffset)
  }],
  // MSG_TYPE_CREATE_ROOM_RESULT
  [11, function (message, headerOffset) {
    if (message.success) {
      const payload = new ArrayBuffer(headerOffset + 5)
      const view = new DataView(payload, headerOffset)

      view.setUint8(0, message.success)
      view.setUint32(1, message.code)
      return payload
    } else {
      console.log('unimplemented')
    }
  }],
  // MSG_TYPE_CONNECT_ROOM
  [12, function (message, headerOffset) {
    const payload = new ArrayBuffer(headerOffset + 5 + (4 + message.userName.length))
    const view = new DataView(payload, headerOffset)

    view.setUint32(0, message.code)
    view.setUint8(4, message.colorIndex)
    encodeString(message.userName, payload, headerOffset + 5)
    return payload
  }],
  // MSG_TYPE_CONNECT_ROOM_RESULT
  [13, function (message, headerOffset) {
    if (message.success) {
      const userListSizes = []
      let totalUserListSizes = 0
      for (let i = 0; i < message.userList.length; ++i) {
        const user = message.userList[i]
        const userSize = (4) + (4) + (1) + (4 + user.userName.length)
        userListSizes.push(userSize)
        totalUserListSizes += userSize
      }

      const payload = new ArrayBuffer(headerOffset + 1 + 4 + 1 + totalUserListSizes)
      const view = new DataView(payload, headerOffset)

      view.setUint8(0, message.success)
      view.setUint32(1, message.publicId)
      view.setUint8(5, message.userList.length)

      let currentArrayOffset = headerOffset + 1 + 4 + 1
      for (let i = 0; i < message.userList.length; ++i) {
        const user = message.userList[i]
        const userListSize = userListSizes[i]
        let view = new DataView(payload, currentArrayOffset)

        view.setUint32(0, userListSize)
        view.setUint32(4, user.publicId)
        view.setUint8(8, user.colorIndex)
        currentArrayOffset = encodeString(user.userName, payload, currentArrayOffset + 9)
      }

      return payload
    } else {
      const payload = new ArrayBuffer(headerOffset + 2 + (4 + message.errorMessage.length))
      const view = new DataView(payload, headerOffset)

      view.setUint8(0, message.success)
      view.setUint8(1, message.errorCode)
      encodeString(message.errorMessage, payload, headerOffset + 2)
      return payload
    }
  }],
  // MSG_TYPE_LEAVE_ROOM
  [14, function (message, headerOffset) {
    return new ArrayBuffer(headerOffset)
  }],
  // MSG_TYPE_LEAVE_ROOM_RESULT
  [15, function (message, headerOffset) {
    if (message.success) {
      const payload = new ArrayBuffer(headerOffset + 1)
      const view = new DataView(payload, headerOffset)

      view.setUint8(0, message.success)
      return payload
    } else {
      const payload = new ArrayBuffer(headerOffset + 2 + (4 + message.errorMessage.length))
      const view = new DataView(payload, headerOffset)

      view.setUint8(0, message.success)
      view.setUint8(1, message.errorCode)
      encodeString(message.errorMessage, payload, headerOffset + 2)
      return payload
    }
  }],
  // MSG_TYPE_USER_LIST_CHANGE
  [16, function (message, headerOffset) {
    const userListSizes = []
    let totalUserListSizes = 0
    for (let i = 0; i < message.userList.length; ++i) {
      const user = message.userList[i]
      const userSize = (4) + (4) + (1) + (4 + user.userName.length)
      userListSizes.push(userSize)
      totalUserListSizes += userSize
    }

    const payload = new ArrayBuffer(headerOffset + 1 + totalUserListSizes)
    const view = new DataView(payload, headerOffset)

    view.setUint8(0, message.userList.length)

    let currentArrayOffset = headerOffset + 1
    for (let i = 0; i < message.userList.length; ++i) {
      const user = message.userList[i]
      const userListSize = userListSizes[i]
      let view = new DataView(payload, currentArrayOffset)

      view.setUint32(0, userListSize)
      view.setUint32(4, user.publicId)
      view.setUint8(8, user.colorIndex)
      currentArrayOffset = encodeString(user.userName, payload, currentArrayOffset + 9)
    }

    return payload
  }],
  // MSG_TYPE_SEND_CHAT_MESSAGE
  [20, function (message, headerOffset) {
    const payload = new ArrayBuffer(headerOffset + 8 + (4 + message.text.length) + (4 + message.image.byteLength))
    let view = new DataView(payload, headerOffset)
    const uint8 = new Uint8Array(payload)

    view.setBigInt64(0, BigInt(message.timestamp))
    let newOffset = encodeString(message.text, payload, headerOffset + 8)
    view = new DataView(payload, newOffset)
    view.setUint32(0, message.image.byteLength)
    uint8.set(new Uint8Array(message.image), newOffset + 4)
    return payload
  }],
  // MSG_TYPE_SEND_CHAT_MESSAGE_RESULT
  [21, function (message, headerOffset) {
    if (message.success) {
      const payload = new ArrayBuffer(headerOffset + 1)
      const view = new DataView(payload, headerOffset)

      view.setUint8(0, message.success)
      return payload
    } else {
      const payload = new ArrayBuffer(headerOffset + 2 + (4 + message.errorMessage.length))
      const view = new DataView(payload, headerOffset)

      view.setUint8(0, message.success)
      view.setUint8(1, message.errorCode)
      encodeString(message.errorMessage, payload, headerOffset + 2)
      return payload
    }
  }],
  // MSG_TYPE_RECEIVE_CHAT_MESSAGES
  [30, function (message, headerOffset) {
    const chatMessageSizes = []
    let totalChatMessageSizes = 0
    for (let i = 0; i < message.chatMessages.length; ++i) {
      const chatMessage = message.chatMessages[i]
      const chatMessageSize = (4) + (8) + (1) + (4 + chatMessage.text.length) + (4 + chatMessage.userName.length) + (4 + chatMessage.image.byteLength)
      chatMessageSizes.push(chatMessageSize)
      totalChatMessageSizes += chatMessageSize
    }

    const payload = new ArrayBuffer(headerOffset + 1 + totalChatMessageSizes)
    const view = new DataView(payload, headerOffset)
    const uint8 = new Uint8Array(payload)

    view.setUint8(0, message.chatMessages.length)

    let currentArrayOffset = headerOffset + 1
    for (let i = 0; i < message.chatMessages.length; ++i) {
      const chatMessage = message.chatMessages[i]
      const chatMessageSize = chatMessageSizes[i]
      let view = new DataView(payload, currentArrayOffset)
      // TODO encode publicId ? if so also add to decoder!
      view.setUint32(0, chatMessageSize)
      view.setBigInt64(4, BigInt(chatMessage.timestamp))
      view.setUint8(12, chatMessage.colorIndex)
      currentArrayOffset = encodeString(chatMessage.text, payload, currentArrayOffset + 13)
      currentArrayOffset = encodeString(chatMessage.userName, payload, currentArrayOffset)
      view = new DataView(payload, currentArrayOffset)
      view.setUint32(0, chatMessage.image.byteLength)
      uint8.set(chatMessage.image, currentArrayOffset + 4)
      currentArrayOffset = currentArrayOffset + 4 + chatMessage.image.byteLength
    }

    return payload
  }],
]))

export {
  messageTypesStr, messageTypesInt, isMessageTypeResult, maxIncomingPayloadSize,
  errorsStr, errorsInt,
  nameSize, colorIndexSize, maxImageSize,
  decodeMessageHeader, decodeMessage, encodeMessage
}
