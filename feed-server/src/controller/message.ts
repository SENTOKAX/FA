import * as messageService from '../service/message'

const topMessageSession = async (ctx) => {
  const { id } = ctx.request.params
  const { top } = ctx.request.query
  await messageService.topMessageSession(ctx.state.user._id, id, top)
}


const getDialogueMessage = async (ctx) => {
  const { account } = ctx.request.params
  const { prev, next, limit } = ctx.request.query
  ctx.body = await messageService.getDialogueMessage(ctx.state.user._id, account, {
    prev,
    next,
    limit
  })
}


const deleteMessage = async (ctx) => {
  const { ids } = ctx.request.body
  ctx.body = await messageService.deleteMessage(ctx.state.user._id, ids)
}

const deleteSession = async (ctx) => {
  const { ids } = ctx.request.body
  ctx.body = await messageService.deleteSession(ctx.state.user._id, ids)
}


const getMessageList = async (ctx) => {
  const { prev, next, limit } = ctx.request.query
  ctx.body = await messageService.getMessageList(ctx.state.user._id, { prev, limit, next })
}


const sendMessage = async (ctx) => {
  const { sendTo, content, image } = ctx.request.body
  ctx.body = await messageService.sendMessage(ctx.state.user._id, sendTo, content, image)
}

export {
  sendMessage,
  getMessageList,
  deleteMessage,
  getDialogueMessage,
  deleteSession,
  topMessageSession
}
