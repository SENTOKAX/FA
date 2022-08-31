import * as notifyService from '../service/notify'

const deleteNotify = async (ctx) => {
  const { ids } = ctx.request.body
  await notifyService.deleteNotify(ctx.state.user._id, ids)
}


const readNotify = async (ctx) => {
  const { ids } = ctx.request.body
  await notifyService.readNotify(ctx.state.user._id, ids)
}


const getNotifyInfo = async (ctx) => {
  const { next, limit, prev } = ctx.request.query
  ctx.body = await notifyService.getNotifyInfo(ctx.state.user._id, next, limit, prev)
}

export {
  getNotifyInfo,
  readNotify,
  deleteNotify
}
