import {RouteType} from './index'
import { userRoutes } from './user'
import * as OSSController from '../controller/oss'
import * as Schema from '../schema/index'
import { postRoutes } from './post'
import { notifyRoutes } from './notify'
import { focusRoutes } from './focus'
import { messageRoutes } from './message'

const routes: RouteType = [
  {
    prefix: '/user',
    routes: userRoutes
  },
  {
    prefix: '/oss',
    routes: [
      {
        method: 'get',
        path: '/upload',
        controller: OSSController.getUploadSTS,
        schema: Schema.Upload
      }
    ]
  },
  {
    prefix: '/post',
    routes: postRoutes
  },
  {
    prefix: '/notify',
    routes: notifyRoutes
  },
  {
    prefix: '/focus',
    routes: focusRoutes
  },
  {
    prefix: '/message',
    routes: messageRoutes
  }
]

export default routes
