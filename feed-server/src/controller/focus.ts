import * as focusService from '../service/focus'

const changeFocusStatus = async (ctx)=>{
  const { uid } = ctx.request.params
  const { follow } = ctx.request.query
  ctx.body = await focusService.changeFocusStatus(ctx.state.user._id, uid, follow)
}


export {
  changeFocusStatus
}
