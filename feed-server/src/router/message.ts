import { RouteType } from './index'
import * as Schema from '../schema'
import * as messageController from '../controller/message'

export const messageRoutes : RouteType = [
  {
    method: 'post',
    path: '/send',
    controller: messageController.sendMessage,
    schema: Schema.SendMessage
  },
  {
    method: 'get',
    path: '/list',
    controller: messageController.getMessageList,
    schema: Schema.PagingSkipByTime
  },
  {
    method: 'post',
    path: '/delete',
    controller: messageController.deleteMessage,
    schema: Schema.IdsSchema
  },
  {
    method: 'get',
    path: '/dialogue/:account',
    controller: messageController.getDialogueMessage,
    schema: Schema.DialogueMessage
  },
  {
    method: 'post',
    path: '/delete/session',
    controller: messageController.deleteSession,
    schema: Schema.IdsSchema
  },
  {
    method: 'post',
    path: '/top/:id',
    controller: messageController.topMessageSession,
    schema: Schema.topMessageSession
  }
]
