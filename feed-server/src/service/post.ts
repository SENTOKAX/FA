import { ObjectId } from 'mongodb'
import * as db from '../db'
import { IPost, NotifyType, PostType } from '../models/types'
import ExceptionStatus from '../lib/exception/ExceptionStatus'
import * as notifyService from './notify'
import config from '../config'

const getLatestPost = async (uid: ObjectId, lastRequestId: ObjectId, limit: number) => {
  const following = await db.focus.find({
    uid
  }).toArray()
  let postSenderList: ObjectId[] = [ ...following.map((value => value.followingId)) ]
  const match = {
    uid: {
      $in: postSenderList
    },
    deleted: false,
    type: {
      $in: [ PostType.Default, PostType.Transmit ]
    }
  }
  const posts = await db.posts.aggregate<IPost & { _id: ObjectId }>([ {
    $match: Object.assign({
      ...match
    }, !!lastRequestId ? {_id: { $gt: lastRequestId }} : {})
  }, {
    $lookup: {
      from: 'users',
      localField: 'uid',
      foreignField: '_id',
      as: 'user'
    }
  },
    { $unwind: '$user' },
    {
      $project: {
        'user.openid': 0,
        'user.status': 0
      }
    } ]).sort({ _id: 1 }).limit(limit).sort({ _id: -1 }).toArray()

  let continues = false
  if (posts.length > 0){
    continues = !!(await db.posts.findOne({
      ...match,
      _id: { $gt: posts[0]._id }
    }))
  }

  let result = []
  for (const item of posts) {
    result.push(await wrapperWithTransmitRelation(await wrapperWithCurrentUserLikeStatus(item, uid)))
  }
  return {
    list: await wrapperWithProcessImages(result),
    continues
  }
}


const hasLatestPost = async (uid: ObjectId, lastRequestId: ObjectId) => {
  const following = await db.focus.find({
    uid
  }).toArray()
  let postSenderList: ObjectId[] = [ ...following.map((value => value.followingId)) ]
  return (await db.posts.find(Object.assign({
    uid: {
      $in: postSenderList
    },
    deleted: false,
    type: {
      $in: [ PostType.Default, PostType.Transmit ]
    }
  }, !!lastRequestId ? { _id: {$gt: lastRequestId} } : {})).toArray()).length > 0
}


const searchPost = async (uid: ObjectId, filter: { image: boolean, likeFor?: string, like: boolean, keyword: string, account: string }, paging: { limit: number, next?: ObjectId, prev?: ObjectId }) => {
  const match: any = {
    deleted: false
  }
  const pagingMatch = {
    $match: !paging.next && !paging.prev ? {} : (
      !!paging.prev ? {
        _id: {
          $gt: paging.prev
        }
      } : {
        _id: {
          $lt: paging.next
        }
      }
    )
  }
  if (filter.image) match.images = { $ne: [] }
  else if (filter.image === false) match.images = []
  if (filter.account) {
    const user = await db.users.findOne({
      account: filter.account
    })
    if (!user) throw ExceptionStatus.ErrUserNotExist
    match.uid = user._id
  }
  if (filter.like !== undefined) {
    const user = await db.users.findOne({
      account: filter.likeFor
    })
    if (!user) throw ExceptionStatus.ErrUserNotExist
    const likedPosts = (await db.likes.find({
      uid: user._id
    }).sort({ createAt: -1 }).toArray()).map<ObjectId>(value => value.postId)
    if (filter.like) {
      match._id = { $in: likedPosts }
    } else if (filter.like === false) {
      match._id = { $nin: likedPosts }
    }
  }
  if (filter.keyword) {
    const keywordUsers = (await db.users.find({
      $or: [
        { account: { $regex: filter.keyword, $options: 'i' } },
        { nickname: { $regex: filter.keyword, $options: 'i' } }
      ]
    }).toArray()).map<ObjectId>(value => value._id)
    match.$or = [ {
      uid: { $in: keywordUsers }
    }, {
      content: { $regex: filter.keyword, $options: 'i' }
    } ]
  }
  const userAddPipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.openid': 0,
        'user.status': 0
      }
    } ]

  const res = await db.posts.aggregate<IPost & { _id: ObjectId }>([
    {
      $match: match
    },
    pagingMatch,
    ...userAddPipeline
  ]).sort({ _id: paging.prev ? 1 : -1 }).limit(paging.limit)
  const list = filter.like ? await res.toArray() : await res.sort({ _id: -1 }).toArray()

  let hasNext = true
  if (list.length > 0) {
    hasNext = !!(await db.posts.aggregate([
      { $match: match },
      {
        $match: { _id: { $lt: new ObjectId(list[list.length - 1]._id) } }
      }
    ]).toArray()).length
  } else if (paging.next) {
    hasNext = false
  } else {
    if (paging.prev) hasNext = !!(await db.posts.aggregate([
      { $match: match },
      {
        $match: { _id: { $lt: paging.prev } }
      }
    ]).toArray()).length
    else hasNext = false
  }

  let hasPrev = true
  if (list.length > 0) {
    hasPrev = !!(await db.posts.aggregate([
      { $match: match },
      {
        $match: { _id: { $gt: new ObjectId(list[0]._id) } }
      }
    ]).toArray()).length
  } else if (paging.prev) {
    hasPrev = false
  } else {
    if (paging.next) hasPrev = !!(await db.posts.aggregate([
      { $match: match },
      {
        $match: { _id: { $gt: paging.next } }
      }
    ]).toArray()).length
    else hasPrev = false
  }

  let result = []
  for (const item of list) {
    result.push(await wrapperWithTransmitRelation(await wrapperWithCurrentUserLikeStatus(item, uid)))
  }
  return {
    list: await wrapperWithProcessImages(result),
    hasNext,
    hasPrev
  }
}

const wrapperWithProcessImageItem = (post: IPost) => {
  return {
    ...post,
    processImages: post.images.map(item => item + config.processImage)
  }
}

const wrapperWithProcessImages = async (posts: IPost[]) => {
  return posts.map(post => wrapperWithProcessImageItem(post))
}

const getPostDetail = async (uid: ObjectId, pid: ObjectId) => {
  const userAddPipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.openid': 0,
        'user.status': 0
      }
    } ]
  const post = (await db.posts.aggregate<IPost & { _id: ObjectId }>([
    {
      $match: { _id: pid, deleted: false }
    },
    {
      $project: {
        deleted: 0
      }
    },
    ...userAddPipeline
  ]).toArray()).pop()
  if (!post) throw ExceptionStatus.ErrPostNotFind
  let relation = { deleted: true }
  if (post?.relationId && post.type) {
    const relationPost = (await db.posts.aggregate<IPost & { _id: ObjectId }>([
      {
        $match: { _id: post?.relationId, deleted: false }
      },
      {
        $project: {
          deleted: 0
        }
      },
      ...userAddPipeline
    ]).toArray()).pop()
    if (relationPost) relation = relationPost
  }
  return {
    post: wrapperWithProcessImageItem(await wrapperWithCurrentUserLikeStatus(post, uid)),
    relation: !relation.deleted ? wrapperWithProcessImageItem(await wrapperWithCurrentUserLikeStatus(relation as IPost & { _id: ObjectId }, uid)) : relation
  }
}

const getPostReplyList = async (uid: ObjectId, pid: ObjectId, paging: { prev?: ObjectId, next?: ObjectId }, limit: number) => {
  const match = {
    $match: {
      relationId: pid,
      deleted: false,
      type: PostType.Replay
    }
  }
  const pagingMatch = {
    $match: !paging.next && !paging.prev ? {} : (
      !!paging.prev ? {
        _id: {
          $gt: paging.prev
        }
      } : {
        _id: {
          $lt: paging.next
        }
      }
    )
  }
  const list = await db.posts.aggregate<IPost & { _id: ObjectId }>([
    match,
    pagingMatch,
    {
      $lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.openid': 0,
        'user.status': 0
      }
    }
  ]).sort({ _id: paging.prev ? 1 : -1 }).limit(limit).sort({ _id: -1 }).toArray()

  let hasNext = true
  if (list.length > 0) {
    hasNext = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $lt: new ObjectId(list[list.length - 1]._id) } }
      }
    ]).toArray()).length
  } else if (paging.next) {
    hasNext = false
  } else {
    if (paging.prev) hasNext = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $lt: paging.prev } }
      }
    ]).toArray()).length
    else hasNext = false
  }

  let hasPrev = true
  if (list.length > 0) {
    hasPrev = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $gt: new ObjectId(list[0]._id) } }
      }
    ]).toArray()).length
  } else if (paging.prev) {
    hasPrev = false
  } else {
    if (paging.next) hasPrev = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $gt: paging.next } }
      }
    ]).toArray()).length
    else hasPrev = false
  }

  let result = []
  for (const item of list) {
    result.push(await wrapperWithCurrentUserLikeStatus(item, uid))
  }
  return {
    list: await wrapperWithProcessImages(result),
    hasPrev,
    hasNext
  }
}

const getRelativePost = async (paging: { next?: ObjectId, prev?: ObjectId }, limit: number, uid: ObjectId) => {
  let postSenderList: ObjectId[] = [ uid ]
  const following = await db.focus.find({
    uid
  }).toArray()
  postSenderList.push(...following.map((value => value.followingId)))
  const match = {
    $match: {
      uid: {
        $in: postSenderList
      },
      deleted: false,
      type: {
        $in: [ PostType.Default, PostType.Transmit ]
      }
    }
  }
  const pagingMatch = {
    $match: !paging.next && !paging.prev ? {} : (
      !!paging.prev ? {
        _id: {
          $gt: paging.prev
        }
      } : {
        _id: {
          $lt: paging.next
        }
      }
    )
  }
  const list = await db.posts.aggregate<IPost & { _id: ObjectId }>([
    match,
    pagingMatch,
    {
      $lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.openid': 0,
        'user.status': 0
      }
    },
    {
      $sort: {
        createAt: -1
      }
    }
  ]).sort({ _id: paging.prev ? 1 : -1 }).limit(limit).sort({ _id: -1 }).toArray()

  let hasNext = true
  if (list.length > 0) {
    hasNext = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $lt: new ObjectId(list[list.length - 1]._id) } }
      }
    ]).toArray()).length
  } else if (paging.next) {
    hasNext = false
  } else {
    if (paging.prev) hasNext = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $lt: paging.prev } }
      }
    ]).toArray()).length
    else hasNext = false
  }

  let hasPrev = true
  if (list.length > 0) {
    hasPrev = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $gt: new ObjectId(list[0]._id) } }
      }
    ]).toArray()).length
  } else if (paging.prev) {
    hasPrev = false
  } else {
    if (paging.next) hasPrev = !!(await db.posts.aggregate([
      match,
      {
        $match: { _id: { $gt: paging.next } }
      }
    ]).toArray()).length
    else hasPrev = false
  }


  let result = []
  for (const item of list) {
    result.push(await wrapperWithTransmitRelation(await wrapperWithCurrentUserLikeStatus(item, uid)))
  }
  return {
    list: await wrapperWithProcessImages(result),
    hasNext,
    hasPrev
  }
}

const wrapperWithCurrentUserLikeStatus = async (post: IPost & { _id: ObjectId }, uid: ObjectId) => {
  let like = !!(await db.likes.findOne({
    uid,
    postId: post._id
  }))
  return {
    ...post,
    like
  }
}

const wrapperWithTransmitRelation = async (post: IPost & { _id: ObjectId }) => {
  const userAddPipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.openid': 0,
        'user.status': 0
      }
    } ]
  if (post.type === PostType.Transmit || post.type === PostType.Replay) {
    let relation = { deleted: true }
    if (post?.relationId) {
      const relationPost = (await db.posts.aggregate<IPost & { _id: ObjectId }>([
        {
          $match: { _id: post?.relationId, deleted: false }
        },
        {
          $project: {
            deleted: 0
          }
        },
        ...userAddPipeline
      ]).toArray()).pop()
      if (relationPost) relation = relationPost
    }
    return {
      ...post,
      relation: !relation.deleted ? wrapperWithProcessImageItem(relation as IPost) : relation
    }
  }
  return post
}

const changeLikeStatus = async (uid: ObjectId, postId: ObjectId, like: boolean) => {
  const post = await db.posts.findOne({
    _id: postId,
    deleted: false
  })
  if (!post) throw ExceptionStatus.ErrPostNotFind
  const likeBefore = !!(await db.likes.findOne({
    uid,
    postId
  }))
  if (like === likeBefore) return
  if (like) {
    await db.likes.insertOne({
      uid,
      postId,
      createAt: new Date().getTime()
    })
  } else {
    await db.likes.deleteOne({
      uid,
      postId,
    })
  }
  await db.posts.updateOne({
    _id: postId
  }, {
    $inc: {
      likes: like ? 1 : -1
    }
  })
}

const deleteSelfPost = async (postId: ObjectId, uid: ObjectId) => {
  const post = await db.posts.findOne({
    _id: postId,
    deleted: false
  })
  if (!post) throw ExceptionStatus.ErrPostNotFind
  if (!post.uid.equals(uid) && post.relationId){
    const relation = await db.posts.findOne({
      _id: post.relationId,
      deleted: false
    })
    if (! relation.uid.equals(uid)) throw ExceptionStatus.ErrPostDeleteNotPermission
  }else if (!post.uid.equals(uid) && !post.relationId){
    throw ExceptionStatus.ErrPostDeleteNotPermission
  }
  await deleteRepliesPost(postId)
  await deleteSelfAndModifyParent(postId)
}

const deleteRepliesPost = async (postId: ObjectId) => {
  const posts = await db.posts.find({
    relationId: postId,
    deleted: false,
    type: PostType.Replay
  }).toArray()
  for (const post of posts) {
    await deleteRepliesPost(post._id)
    await db.posts.updateOne({
      _id: post._id,
      deleted: false,
      type: PostType.Replay
    }, {
      $set: {
        deleted: true
      }
    })
  }
}

const deleteSelfAndModifyParent = async (postId: ObjectId) => {
  const post = await db.posts.findOne({
    _id: postId,
    deleted: false
  })
  if (post?.relationId) {
    let update = {
      $inc: {}
    }
    if (post.type === PostType.Replay) {
      update.$inc = {
        replays: -1
      }
    } else if (post.type === PostType.Transmit) {
      update.$inc = {
        transmits: -1
      }
    }
    await db.posts.updateOne({
      _id: post.relationId
    }, update)
  }
  await db.posts.updateOne({
    _id: postId,
    deleted: false
  }, {
    $set: {
      deleted: true
    }
  })
}

const createTransmitPost = async (uid: ObjectId, pid: ObjectId, content: string, images: string[]) => {
  const parentIdPost = await db.posts.findOne({
    _id: pid,
    deleted: false
  })
  if (!parentIdPost) throw ExceptionStatus.ErrPostNotFind
  await db.posts.updateOne({
    _id: pid,
    deleted: false
  }, {
    $inc: {
      transmits: 1
    }
  })
  const created = await createPost(uid, content, images, PostType.Transmit, pid)
  if (!uid.equals(parentIdPost.uid)) await notifyService.notify(uid, NotifyType.Transmit, (created as any)._id, parentIdPost.uid)
  return created
}

const createReplyPost = async (uid: ObjectId, pid: ObjectId, content: string, images: string[]) => {
  const parentIdPost = await db.posts.findOne({
    _id: pid,
    deleted: false
  })
  if (!parentIdPost) throw ExceptionStatus.ErrPostNotFind
  await db.posts.updateOne({
    _id: pid,
    deleted: false
  }, {
    $inc: {
      replays: 1
    }
  })
  const created = await createPost(uid, content, images, PostType.Replay, pid)
  if (!uid.equals(parentIdPost.uid)) await notifyService.notify(uid, NotifyType.Comment, (created as any)._id, parentIdPost.uid)
  return created
}

const createPost = async (uid: ObjectId, content: any, images: string[], type: PostType, pid ?: ObjectId,) => {
  const result = await db.posts.insertOne({
    relationId: pid,
    uid,
    type,
    content,
    images: images || [],
    replays: 0,
    transmits: 0,
    likes: 0,
    createAt: new Date().getTime(),
    deleted: false
  })
  const post = (await db.posts.aggregate<IPost>([
    {
      $match: {
        _id: result.insertedId,
        deleted: false
      }
    }, {
      $lookup: {
        from: 'users',
        localField: 'uid',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        'user.openid': 0,
        'user.status': 0
      }
    } ]).toArray()).pop()
  return wrapperWithProcessImageItem(post)
}

export {
  createPost,
  createReplyPost,
  createTransmitPost,
  deleteSelfPost,
  changeLikeStatus,
  getRelativePost,
  getPostDetail,
  getPostReplyList,
  searchPost,
  hasLatestPost,
  getLatestPost
}
