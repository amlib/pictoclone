const errors = [
  'ERROR_MESSAGE_RESULT_TIMEOUT',
  'ERROR_MESSAGE_RESULT_NO_PROMISE',
  'ERROR_MESSAGE_RESULT_EXPIRED',
  'ERROR_MESSAGE_UNIMPLEMENTED_MESSAGE_TYPE'
]

import { messageTypesStr, messageTypesInt } from '../audio/enums.js'

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

  constructor (openCallback) {
    this.socket = new WebSocket("ws://localhost:9001")
    this.socket.onmessage = (event) => { this.handleMessage(event) }
    this.newConnectionPromise = new Promise((resolve, reject) => {
      this.messageResultPromiseAdd('newConnectionResult', resolve, reject)
    })

    this.handleMessageMap.set('createRoomResult', this.handleCreateRoomResult)
    this.handleMessageMap.set('connectRoomResult', this.handleConnectRoomResult)
    this.handleMessageMap.set('sendChatMessageResult', this.handleSendChatMessageResult)
    this.handleMessageMap.set('newConnectionResult', this.handleNewConnection)

    this.handleMessageMap.set('genericError', this.handleGenericError)
    this.handleMessageMap.set('receiveChatMessages', this.handleReceiveChatMessages)
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
        const e = new Error('messageResultPromiseAdd: a promise for ' + messageType + ' has expired, timing out!')
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
    if (messageType.match('Result$') == null) {
      return null
    }

    if (!this.messageResultPromiseBank.has(messageType)) {
      const e = new Error('messageResultPromiseArrived: no promises for message type: ' + messageType)
      e.name = 'ERROR_MESSAGE_RESULT_NO_PROMISE'
      throw e
    }

    const promise = this.messageResultPromiseBank.get(messageType)

    clearTimeout(promise.timeout)

    if (promise.status === 'arrived') {
      const e = new Error('messageResultPromiseArrived: already processed for message type: ' + messageType)
      e.name = 'ERROR_MESSAGE_RESULT_EXPIRED'
      throw e
    }

    promise.status = 'arrived'

    return promise
  }

  /* Outgoing message */

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

      this.sendMessage('createRoom', message)
      this.messageResultPromiseAdd('createRoomResult', resolve, reject)
    })
  }

  sendConnectRoom (code, username) {
    return new Promise((resolve, reject) => {
      const message = {
        code: code,
        userName: username,
      }

      this.sendMessage('connectRoom', message)
      this.messageResultPromiseAdd('connectRoomResult', resolve, reject)
    })
  }

  sendChatMessage (messagePayload) {
    return new Promise((resolve, reject) => {
      const message = {
        messagePayload: messagePayload,
      }

      this.sendMessage('sendChatMessage', message)
      this.messageResultPromiseAdd('sendChatMessageResult', resolve, reject)
    })
  }

  /* Incoming messages */

  handleMessage (event) {
    console.log('handleMessage:', event.data)
    const message = JSON.parse(event.data)
    const callback = this.handleMessageMap.get(message.type)
    const promise = this.messageResultPromiseArrived(message.type)
    if (callback != null) {
      console.log('handleMessage:', message.type)
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

  handleConnectRoomResult (promise, message) {
    if (message.success) {
      console.log("connected to room", message.code)
      this.roomCode = message.code
      this.roomConnected = true
      promise.resolve()
    } else {
      console.log("could not connect to room", message.reason)
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
    const e = new Error(message.errorMessage != null ? message.errorMessage : message.errorCode)
    e.name = message.errorCode
    return e
  }
}
