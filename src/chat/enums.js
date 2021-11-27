// each value in key value pair must be unique!
const messageTypesStr = new Map([
  ['MSG_TYPE_CREATE_ROOM', 0],
  ['MSG_TYPE_CONNECT_ROOM', 1],
  ['MSG_TYPE_SEND_CHAT_MESSAGE', 2],
  ['MSG_TYPE_CREATE_ROOM_RESULT', 3],
  ['MSG_TYPE_CONNECT_ROOM_RESULT', 4],
  ['MSG_TYPE_SEND_CHAT_MESSAGE_RESULT', 5],
  ['MSG_TYPE_NEW_CONNECTION_RESULT', 6],
  ['MSG_TYPE_GENERIC_ERROR', 7],
  ['MSG_TYPE_RECEIVE_CHAT_MESSAGES', 8]
])

const messageTypesInt = new Map([...messageTypesStr].map(x => [x[1], x[0]]))

const errorsStr = new Map([
  ['ERROR_MESSAGE_RESULT_TIMEOUT', 0],
  ['ERROR_MESSAGE_RESULT_NO_PROMISE', 1],
  ['ERROR_MESSAGE_RESULT_EXPIRED', 2],
  ['ERROR_MESSAGE_UNIMPLEMENTED_MESSAGE_TYPE', 3]
])

const errorsInt = new Map([...errorsStr].map(x => [x[1], x[0]]))

export { messageTypesStr, messageTypesInt, errorsStr, errorsInt }
