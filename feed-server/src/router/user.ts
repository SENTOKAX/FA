import { RouteType } from './index'
import * as userController from '../controller/user'
import * as Schema from '../schema/index'

export const userRoutes : RouteType = [
  {
    method: 'get',
    path: '/wxlogin',
    controller: userController.wxlogin,
    schema: Schema.WxLogin
  },
  {
    method: 'post',
    path: '/register',
    controller: userController.register,
    schema: Schema.register
  },
  {
    method: 'get',
    path: '/info',
    controller: userController.getUserInfo,
    schema: null
  },
  {
    method: 'post',
    path: '/modifyInfo',
    controller: userController.modifyInfo,
    schema: Schema.modifyUserInfo
  },
  {
    method: 'get',
    path: '/search',
    controller: userController.searchUser,
    schema: Schema.searchUser
  },
  {
    method: 'get',
    path: '/:account',
    controller: userController.getAccountInfo,
    schema: Schema.accountInfo
  },
  {
    method: 'post',
    path: '/logout',
    controller: userController.logout,
    schema: null
  }
]
