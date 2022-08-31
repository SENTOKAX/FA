import * as userService from '../service/user'
import ExceptionStatus from '../lib/exception/ExceptionStatus'

const getAccountInfo = async (ctx) => {
  const { account } = ctx.request.params
  ctx.body = await userService.getAccountInfo(ctx.state.user._id, account)
}


const searchUser = async (ctx) => {
  const {keyword,uid, follow, prev, next, limit} = ctx.request.query
  ctx.body = await userService.searchUser(keyword,{
    uid, follow
  },{
    limit, prev, next
  }, ctx.state.user._id)
}


const modifyInfo = async (ctx)=>{
  const { avatar, banner, bio, nickname } = ctx.request.body
  ctx.body = await userService.modifyInfo(ctx.state.user._id, avatar, banner, bio, nickname)
}


const register = async (ctx)=>{
  const { account } = ctx.request.body
  await userService.register(account, ctx.state.user._id, ctx.request.ip)
}


const getUserInfo = async (ctx)=>{
  ctx.body = await userService.getUserInfo(ctx.state.user._id)
}


const wxlogin = async (ctx)=>{
  const { code } = ctx.request.query
  if (!code) throw ExceptionStatus.ErrParamError
  const { token, needModifyName} = await userService.wxlogin(code, ctx.request.ip)
  ctx.status = 302
  if (!needModifyName) {
    ctx.redirect('/')
  }else{
    ctx.redirect(`/register`)
  }
  ctx.cookies.set('token', token)
}

const logout = async (ctx)=>{
  await userService.logout(ctx.cookies.get('token'))
  ctx.cookies.set('token', '')
}

export {
  wxlogin,
  register,
  getUserInfo,
  modifyInfo,
  searchUser,
  getAccountInfo,
  logout
}
