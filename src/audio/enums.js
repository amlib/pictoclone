// each value in key value pair must be unique!
const messageTypesStr = new Map([
  ['createRoom', 0],
  ['connectRoom', 1],
  ['sendChatMessage', 2],
  ['createRoomResult', 3],
  ['connectRoomResult', 4],
  ['sendChatMessageResult', 5],
  ['newConnectionResult', 6],
  ['genericError', 7],
  ['receiveChatMessages', 8]
])

const messageTypesInt = new Map([...messageTypesStr].map(x => [x[1], x[0]]))


export { messageTypesStr, messageTypesInt }
