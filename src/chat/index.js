import {
  messageTypesStr, messageTypesInt, isMessageTypeResult,
  errorsStr, errorsInt,
  encodeMessage, decodeMessage, decodeMessageHeader
} from './specs.js'

export class ChatClient {
  socket
  newConnectionPromise
  onCloseCallback

  messageResultPromiseWrappers = new Map()
  globalTimeout = 5 * 1000
  handleMessageMap = new Map()

  roomCode
  roomConnected
  uniqueId

  onReceiveChatMessages

  constructor () {
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_GENERIC_ERROR'), this.handleGenericError)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_NEW_CONNECTION_RESULT'), this.handleNewConnection)

    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_CREATE_ROOM_RESULT'), this.handleCreateRoomResult)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_CONNECT_ROOM_RESULT'), this.handleConnectRoomResult)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_LEAVE_ROOM_RESULT'), this.handleLeaveRoomResult)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE_RESULT'), this.handleSendChatMessageResult)

    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_RECEIVE_CHAT_MESSAGES'), this.handleReceiveChatMessages)
  }

  onOpen (callback) {
    this.socket.onopen = () => {
      callback(this.newConnectionPromise)
    }
  }

  startConnection (onCloseCallback) {
    this.socket = new WebSocket("ws://localhost:9001")
    this.socket.binaryType = 'arraybuffer'

    this.socket.onmessage = (event) => { this.handleMessage(event) }
    this.socket.onclose = () => { this.onClose() }

    this.onCloseCallback = onCloseCallback
    this.newConnectionPromise = new Promise((resolve, reject) => {
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_NEW_CONNECTION_RESULT'), resolve, reject)
    })
  }

  onOpen (callback) {
    this.socket.onopen = () => {
      callback(this.newConnectionPromise)
    }
  }

  onClose () {
    this.messageResultPromiseCancel(messageTypesStr.get('MSG_TYPE_NEW_CONNECTION_RESULT'))
    this.onReceiveChatMessages = undefined

    this.roomConnected = undefined
    this.roomCode = undefined
    this.uniqueId = undefined
    this.onCloseCallback()
  }

  endConnection () {
    this.socket.close()
    this.onClose()
  }

  /* Message result Promise stuff */

  messageResultPromiseAdd (messageType, resolve, reject, contextPayload) {
    const timestamp = Date.now()

    if (messageType == null) {
      const e = new Error('messageResultPromiseAdd: void messageType, ignoring!')
      e.name = 'ERROR_MESSAGE_RESULT_REJECTED'
      reject(e)
    }

    const timeout = setTimeout(() => {
      if (!this.messageResultPromiseWrappers.has(messageType)) {
        return
      }

      const currentPromise = this.messageResultPromiseWrappers.get(messageType)
      if (currentPromise.timestamp === timestamp) {
        this.messageResultPromiseWrappers.delete(messageType)
        const e = new Error(`messageResultPromiseAdd: a promise for ${messageTypesInt.get(messageType)} (${messageType}) has expired, timing out!`)
        e.name = 'ERROR_MESSAGE_RESULT_TIMEOUT'
        reject(e)
      }
    }, this.globalTimeout)

    this.messageResultPromiseWrappers.set(messageType, {
      resolve: resolve,
      reject: reject,
      timestamp: timestamp,
      timeout: timeout,
      contextPayload: contextPayload,
      status: 'pending'
    })
  }

  messageResultPromiseArrived (messageType) {
    if (!isMessageTypeResult.get(messageType)) {
      return null
    }

    if (!this.messageResultPromiseWrappers.has(messageType)) {
      const e = new Error(`messageResultPromiseArrived: no promises for message type: ${messageTypesInt.get(messageType)} (${messageType})`)
      e.name = 'ERROR_MESSAGE_RESULT_NO_PROMISE'
      throw e
    }

    const promiseWrapper = this.messageResultPromiseWrappers.get(messageType)

    clearTimeout(promiseWrapper.timeout)

    if (promiseWrapper.status === 'arrived') {
      const e = new Error(`messageResultPromiseArrived: already processed for message type: ${messageTypesInt.get(messageType)} (${messageType})`)
      e.name = 'ERROR_MESSAGE_RESULT_EXPIRED'
      throw e
    }

    promiseWrapper.status = 'arrived'

    return promiseWrapper
  }

  messageResultPromiseCancel (messageType, doReject = false) {
    const promiseWrapper = this.messageResultPromiseWrappers.get(messageType)
    if (promiseWrapper != null && promiseWrapper.status === 'pending') {
      promiseWrapper.status = 'canceled'
      this.messageResultPromiseWrappers.delete(messageType)
      clearTimeout(promiseWrapper.timeout)
      doReject && promiseWrapper.reject()
    }
  }

  isAwaitingResult (messageType) {
    const promiseWrapper = this.messageResultPromiseWrappers.get(messageType)
    if (promiseWrapper != null && promiseWrapper.status === 'pending') {
      return true
    } else {
      return false
    }
  }

  /* Base incoming and outgoing message handling */

  sendMessage (type, message) {
    import.meta.env.DEV && console.log(`ChatClient.sendMessage: ${messageTypesInt.get(type)} (${type})`)
    message.type = type
    message.uniqueId = this.uniqueId
    this.socket.send(encodeMessage(message))
  }

  handleMessage (event) {
    const payload = event.data
    const { message, payloadOffset } = decodeMessageHeader(payload)
    const newOffset = decodeMessage(message, payload, payloadOffset)
    const callback = this.handleMessageMap.get(message.type)
    const promise = this.messageResultPromiseArrived(message.type)
    if (callback != null) {
      import.meta.env.DEV && console.log(`ChatClient.handleMessage: ${messageTypesInt.get(message.type)} (${message.type})`)
      if (promise == null) {
        callback.call(this, message)
      } else {
        callback.call(this, promise, message)
      }
    } else {
      const e = new Error('handleMessage: unknown message type: ' + message.type)
      e.name = 'ERROR_MESSAGE_UNIMPLEMENTED_MESSAGE_TYPE'
      throw e
    }
  }

  /* Specific outgoing message handlers */

  // deprecated
  sendCreateRoom (code) {
    return new Promise((resolve, reject) => {
      const message = {
        code: code
      }

      this.sendMessage(messageTypesStr.get('MSG_TYPE_CREATE_ROOM'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_CREATE_ROOM_RESULT'), resolve, reject, message)
    })
  }

  sendLeaveRoom () {
    return new Promise((resolve, reject) => {
      const message = {
      }

      this.sendMessage(messageTypesStr.get('MSG_TYPE_LEAVE_ROOM'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_LEAVE_ROOM_RESULT'), resolve, reject, message)
    })
  }

  sendConnectRoom (code, username, colorIndex) {
    return new Promise((resolve, reject) => {
      if (this.isAwaitingResult(messageTypesStr.get('MSG_TYPE_CONNECT_ROOM_RESULT'))) {
        reject()
        return
      }

      const message = {
        code: code,
        userName: username,
        colorIndex: colorIndex
      }

      this.sendMessage(messageTypesStr.get('MSG_TYPE_CONNECT_ROOM'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_CONNECT_ROOM_RESULT'), resolve, reject, message)
    })
  }

  sendChatMessage (message) {
    return new Promise((resolve, reject) => {
      if (this.isAwaitingResult(messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE_RESULT'))) {
        reject()
        return
      }
      this.sendMessage(messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE_RESULT'), resolve, reject, message)
    })
  }

  /* Specific incoming messages handlers */

  handleCreateRoomResult (promise, message) {
    if (message.success) {
      promise.resolve()
    } else {
      promise.reject(this.errorFromMessage(message))
    }
  }

  handleLeaveRoomResult (promise, message) {
    if (message.success) {
      this.roomCode = undefined
      this.roomConnected = false
      promise.resolve()
    } else {
      promise.reject(this.errorFromMessage(message))
    }
  }

  handleConnectRoomResult (promise, message) {
    if (message.success) {
      import.meta.env.DEV && console.log("ChatClient.handleConnectRoomResult: connected to room", promise.contextPayload.code)
      this.roomCode = message.code
      this.roomConnected = true
      promise.resolve()
    } else {
      this.roomCode = undefined
      this.roomConnected = false
      promise.reject(this.errorFromMessage(message))
    }
  }

  handleSendChatMessageResult (promise, message) {
    if (message.success) {
      promise.resolve()
    } else {
      promise.reject(this.errorFromMessage(message))
    }
  }

  handleNewConnection (promise, message) {
    this.uniqueId = message.uniqueId
    promise.resolve()
  }

  handleReceiveChatMessages (message) {
    if (this.onReceiveChatMessages != null) {
      this.onReceiveChatMessages(message.chatMessages)
    } else {
      import.meta.env.DEV && console.warn('ChatClient.handleReceiveChatMessages: no handler!')
    }
  }

  handleGenericError(message) {
    const e = this.errorFromMessage(message)
    import.meta.env.DEV && console.error('ChatClient.handleGenericError:', e)
    throw e
  }

  errorFromMessage (message) {
    const e = new Error(message.errorMessage != null ? message.errorMessage : `${errorsInt.get(message.errorCode)} (${message.errorCode})`)
    e.name = errorsInt.get(message.errorCode)
    return e
  }
}
