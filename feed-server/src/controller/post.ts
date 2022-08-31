import * as postService from '../service/post'
import { PostType } from '../models/types'

const getLatestPost = async (ctx) => {
  const { lastRequestId, limit } = ctx.request.query
  ctx.body = await postService.getLatestPost(ctx.state.user._id, lastRequestId, limit)
}


const hasLatestPost = async (ctx) => {
  const { lastRequestId } = ctx.request.query
  ctx.body = {
    hasNew: await postService.hasLatestPost(ctx.state.user._id, lastRequestId)
  }
}

const searchPost = async (ctx) => {
  const { keyword, account, image, like, next, prev, limit, likeFor } = ctx.request.query
  ctx.body = await postService.searchPost(ctx.state.user._id, {
    keyword,
    account,
    image,
    like,
    likeFor
  }, {
    limit,
    next,
    prev
  })
}


const getPostReplyList = async (ctx) => {
  const { prev, next, limit } = ctx.request.query
  const { id } = ctx.request.params
  ctx.body = await postService.getPostReplyList(ctx.state.user._id, id, {prev, next}, limit)
}

const getPostDetail = async (ctx) => {
  const { id } = ctx.request.params
  ctx.body = await postService.getPostDetail(ctx.state.user._id, id)
}


  const getRelativePost = async (ctx) => {
  const {next, prev, limit} = ctx.request.query
  ctx.body = await postService.getRelativePost({next, prev}, limit, ctx.state.user._id)
}


const changeLikeStatus = async (ctx)=>{
  const { id } = ctx.request.params
  const { like } = ctx.request.query
  await postService.changeLikeStatus(ctx.state.user._id, id, like)
}


const deletePost = async (ctx)=>{
  const { id } = ctx.request.params
  await postService.deleteSelfPost(id, ctx.state.user._id)
}


const createDefaultPost = async (ctx)=>{
  const {content, images} = ctx.request.body
  ctx.body = await postService.createPost(ctx.state.user._id, content, images, PostType.Default)
}

const createTransmitPost = async (ctx)=>{
  const {relationId, content, images} = ctx.request.body
  ctx.body = await postService.createTransmitPost(ctx.state.user._id, relationId, content, images)
}

const createReplyPost = async (ctx)=>{
  const {relationId, content, images} = ctx.request.body
  ctx.body = await postService.createReplyPost(ctx.state.user._id, relationId, content, images)
}

export {
  createDefaultPost,
  createTransmitPost,
  createReplyPost,
  deletePost,
  changeLikeStatus,
  getRelativePost,
  getPostDetail,
  getPostReplyList,
  searchPost,
  hasLatestPost,
  getLatestPost
}
