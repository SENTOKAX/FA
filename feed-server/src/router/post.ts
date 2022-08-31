import { RouteType } from './index'
import * as postController from '../controller/post'
import * as Schema from '../schema'

export const postRoutes : RouteType = [
  {
    method: 'post',
    path: '/create',
    controller: postController.createDefaultPost,
    schema: Schema.createDefaultPost
  },
  {
    method: 'post',
    path: '/create/reply',
    controller: postController.createReplyPost,
    schema: Schema.createChildrenPost
  },
  {
    method: 'post',
    path: '/create/transmit',
    controller: postController.createTransmitPost,
    schema: Schema.createChildrenPost
  },
  {
    method: 'post',
    path: '/delete/:id',
    controller: postController.deletePost,
    schema: Schema.deletePost
  },
  {
    method: 'post',
    path: '/like/:id',
    controller: postController.changeLikeStatus,
    schema: Schema.changeLikeStatus
  },
  {
    method: 'get',
    path: '/relative',
    controller: postController.getRelativePost,
    schema: Schema.PagingSkipById,
  },
  {
    method: 'get',
    path: '/detail/:id',
    controller: postController.getPostDetail,
    schema: Schema.getPostAndReplyById
  },
  {
    method: 'get',
    path: '/reply/:id',
    controller: postController.getPostReplyList,
    schema: Schema.getPostReplyList
  },
  {
    method: 'get',
    path: '/search',
    controller: postController.searchPost,
    schema: Schema.searchPost
  },
  {
    method: 'get',
    path: '/status/latest',
    controller: postController.hasLatestPost,
    schema: Schema.hasLatestPost
  },
  {
    method: 'get',
    path: '/latest',
    controller: postController.getLatestPost,
    schema: Schema.getLatestPost
  }
]
