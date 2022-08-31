import { RouteType } from './index'
import * as focusController from '../controller/focus'
import * as Schema from '../schema'

export const focusRoutes : RouteType = [
  {
    method: 'post',
    path: '/changeFocusStatus/:uid',
    controller: focusController.changeFocusStatus,
    schema: Schema.changeFocusStatus,
  }
]


