import { messageTypesStr, messageTypesInt, errorsStr, errorsInt } from './enums.js'

export class ChatClient {
  socket
  newConnectionPromise

  messageResultPromiseBank = new Map()
  globalTimeout = 5 * 1000
  handleMessageMap = new Map()

  roomCode
  roomConnected
  uniqueId

  onReceiveChatMessages

  constructor () {
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_CREATE_ROOM_RESULT'), this.handleCreateRoomResult)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_LEAVE_ROOM_RESULT'), this.handleLeaveRoomResult)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_CONNECT_ROOM_RESULT'), this.handleConnectRoomResult)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE_RESULT'), this.handleSendChatMessageResult)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_NEW_CONNECTION_RESULT'), this.handleNewConnection)

    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_GENERIC_ERROR'), this.handleGenericError)
    this.handleMessageMap.set(messageTypesStr.get('MSG_TYPE_RECEIVE_CHAT_MESSAGES'), this.handleReceiveChatMessages)
  }

  startConnection () {
    this.socket = new WebSocket("ws://localhost:9001")
    this.socket.onmessage = (event) => { this.handleMessage(event) }
    this.newConnectionPromise = new Promise((resolve, reject) => {
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_NEW_CONNECTION_RESULT'), resolve, reject)
    })
  }

  endConnection () {
    this.socket.close()
    this.onReceiveChatMessages = undefined

    this.roomConnected = undefined
    this.roomCode = undefined
    this.uniqueId = undefined
  }

  onOpen (callback) {
    this.socket.onopen = () => {
      callback(this.newConnectionPromise)
    }
  }

  messageResultPromiseAdd (messageType, resolve, reject) {
    const timestamp = Date.now()

    if (messageType == null) {
      const e = new Error('messageResultPromiseAdd: void messageType, ignoring!')
      e.name = 'ERROR_MESSAGE_RESULT_REJECTED'
      reject(e)
    }

    const timeout = setTimeout(() => {
      if (!this.messageResultPromiseBank.has(messageType)) {
        return
      }

      const currentPromise = this.messageResultPromiseBank.get(messageType)
      if (currentPromise.timestamp === timestamp) {
        this.messageResultPromiseBank.delete(messageType)
        const e = new Error(`messageResultPromiseAdd: a promise for ${messageTypesInt.get(messageType)} (${messageType}) has expired, timing out!`)
        e.name = 'ERROR_MESSAGE_RESULT_TIMEOUT'
        reject(e)
      }
    }, this.globalTimeout)

    this.messageResultPromiseBank.set(messageType, {
      resolve: resolve,
      reject: reject,
      timestamp: timestamp,
      timeout: timeout,
      status: 'pending'
    })
  }

  messageResultPromiseArrived (messageType) {
    if (messageTypesInt.get(messageType).match('_RESULT$') == null) {
      return null
    }

    if (!this.messageResultPromiseBank.has(messageType)) {
      const e = new Error(`messageResultPromiseArrived: no promises for message type: ${messageTypesInt.get(messageType)} (${messageType})`)
      e.name = 'ERROR_MESSAGE_RESULT_NO_PROMISE'
      throw e
    }

    const promise = this.messageResultPromiseBank.get(messageType)

    clearTimeout(promise.timeout)

    if (promise.status === 'arrived') {
      const e = new Error(`messageResultPromiseArrived: already processed for message type: ${messageTypesInt.get(messageType)} (${messageType})`)
      e.name = 'ERROR_MESSAGE_RESULT_EXPIRED'
      throw e
    }

    promise.status = 'arrived'

    return promise
  }

  /* Outgoing message handlers */

  sendMessage (type, response) {
    console.log('sendMessage: ', type)
    response.type = type
    response.uniqueId = this.uniqueId
    this.socket.send(JSON.stringify(response))
  }

  sendCreateRoom (code) {
    return new Promise((resolve, reject) => {
      const message = {
        code: code
      }

      this.sendMessage(messageTypesStr.get('MSG_TYPE_CREATE_ROOM'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_CREATE_ROOM_RESULT'), resolve, reject)
    })
  }

  sendLeaveRoom () {
    return new Promise((resolve, reject) => {
      const message = {
      }

      this.sendMessage(messageTypesStr.get('MSG_TYPE_LEAVE_ROOM'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_LEAVE_ROOM_RESULT'), resolve, reject)
    })
  }

  sendConnectRoom (code, username) {
    return new Promise((resolve, reject) => {
      const message = {
        code: code,
        userName: username,
      }

      this.sendMessage(messageTypesStr.get('MSG_TYPE_CONNECT_ROOM'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_CONNECT_ROOM_RESULT'), resolve, reject)
    })
  }

  sendChatMessage (messagePayload) {
    return new Promise((resolve, reject) => {
      const message = {
        messagePayload: messagePayload,
      }

      this.sendMessage(messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE'), message)
      this.messageResultPromiseAdd(messageTypesStr.get('MSG_TYPE_SEND_CHAT_MESSAGE_RESULT'), resolve, reject)
    })
  }

  /* Incoming messages handlers */

  handleMessage (event) {
    console.log('handleMessage:', event.data)
    const message = JSON.parse(event.data)
    const callback = this.handleMessageMap.get(message.type)
    const promise = this.messageResultPromiseArrived(message.type)
    if (callback != null) {
      console.log('handleMessage:', messageTypesInt.get(message.type))
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

  handleCreateRoomResult (promise, message) {
    if (message.success) {
      console.log("created room", message.code)
      promise.resolve()
    } else {
      promise.reject(this.errorFromMessage(message))
    }
  }

  handleLeaveRoomResult (promise, message) {
    if (message.success) {
      promise.resolve()
    } else {
      promise.reject(this.errorFromMessage(message))
    }
  }

  handleConnectRoomResult (promise, message) {
    if (message.success) {
      console.log("connected to room", message.code)
      this.roomCode = message.code
      this.roomConnected = true
      promise.resolve()
    } else {
      this.roomCode = message.code
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
      console.warn('handleReceiveChatMessages: no handler')
    }
  }

  handleGenericError(promise, message) {
    promise.reject(this.errorFromMessage(message))
  }

  errorFromMessage (message) {
    const e = new Error(message.errorMessage != null ? message.errorMessage : `${errorsInt.get(message.errorCode)} (${message.errorCode})`)
    e.name = errorsInt.get(message.errorCode)
    return e
  }
}
