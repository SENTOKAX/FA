import config from '../config'
import ExceptionStatus from '../lib/exception/ExceptionStatus'
import * as sessionService from '../service/session'
import { UserStatus } from '../models/types'

const authLogStatus = ()=>{
  return async (ctx, next) => {
    const { authWhiteList, registerStatusWhiteList } = config
    if (checkWhiteList(ctx.request.path, authWhiteList)) return next()

    const token = ctx.cookies.get('token')
    if (!token) throw ExceptionStatus.ErrUserNotLogin
    try {
      ctx.state.user = await sessionService.getUserInfoFromSession(token)
    }catch (e) {
      ctx.cookies.set('token', '')
      throw e
    }
    // 注册状态处理
    if (ctx.state.user.status === UserStatus.Registering){
      if (checkWhiteList(ctx.request.path, registerStatusWhiteList)) return next()
      else throw ExceptionStatus.ErrRegistering
    }
    await next()
  }
}

const checkWhiteList = (path : string, whiteList : string[])=>{
  return whiteList.some((url)=>{
    if (path === url) return true
    const splitPath = path.split('/')
    const splitUrl = url.split('/')
    if (splitPath.length !== splitUrl.length) return false
    return splitUrl.every((item, index)=> {
      if (item.startsWith(':')){
        return true
      }
      return item === splitPath[index]
    })
  })
}

export default authLogStatus
