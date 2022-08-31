import { RouteType } from './index'

import * as notifyController from '../controller/notify'
import * as Schema from '../schema'

export const notifyRoutes : RouteType = [
  {
    method: 'get',
    path: '/',
    controller: notifyController.getNotifyInfo,
    schema: Schema.PagingSkipById
  },
  {
    method: 'post',
    path: '/read',
    controller: notifyController.readNotify,
    schema: Schema.IdsSchema
  },
  {
    method: 'post',
    path: '/delete',
    controller: notifyController.deleteNotify,
    schema: Schema.IdsSchema
  }
]
