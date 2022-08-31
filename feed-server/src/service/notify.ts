import * as db from '../db'
import { ObjectId } from 'mongodb'
import { NotifyType } from '../models/types'
import { messages } from '../db'

const readNotify = async (uid : ObjectId, ids: string | string[]) => {
  await db.notifies.updateMany(Object.assign({
      receiverId: uid,
      isRead: false,
    }, {
      _id: ids instanceof Array ? { $in : ids } : ids
    }), {
    $set: {
      isRead: true
    }
  })
}


const deleteNotify = async (uid : ObjectId, ids: string | string[]) => {
  await db.notifies.updateMany(Object.assign({
    receiverId: uid,
    deleted: false,
  }, {
    _id: ids instanceof Array ? { $in : ids } : ids
  }), {
    $set: {
      deleted: true
    }
  })
}


const NotifyTypeMessageMapping : Record<NotifyType, string> = {
  [NotifyType.Focus]: '关注了你',
  [NotifyType.Comment]: '评论了你',
  [NotifyType.Transmit]: '转发了你的帖子'
}

const getNotifyInfo = async (uid : ObjectId, next: ObjectId | undefined, limit: number, prev: ObjectId | undefined)=>{
  const unread = (await db.notifies.find({
    receiverId: uid,
    deleted: false,
    isRead: false
  }).toArray()).length
  const items = await db.notifies.aggregate([
    {
      $match: Object.assign({
        receiverId: uid,
        deleted: false
      }, !next && !prev ? {} : (
        !!prev ? {
          _id : {
            $gt: prev
          }
        } : {
          _id : {
            $lt: next
          }
        }
      ))
    },
    {
      $project: {
        deleted: 0
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
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
  ]).sort({_id: prev ? 1 : -1}).limit(limit).sort({_id : -1}).toArray()

  let hasNext = true
  if (items.length > 0){
    hasNext = !!(await db.notifies.findOne({
      receiverId: uid,
      deleted: false,
      _id: {
        $lt: new ObjectId(items[items.length - 1]._id)
      }
    }))
  }else if (next){
    hasNext = false
  }else {
    if (prev) hasNext = !!(await db.notifies.find({
      receiverId: uid,
      deleted: false,
      _id: { $lt: prev }
    }))
    else hasNext = false
  }

  let hasPrev = true
  if (items.length > 0){
    hasPrev = !!(await db.notifies.findOne({
      receiverId: uid,
      deleted: false,
      _id: {
        $gt: new ObjectId(items[0]._id)
      }
    }))
  }else if (prev) {
    hasPrev = false
  } else {
    if(next) hasPrev = !!(await db.notifies.find({
      receiverId: uid,
      deleted: false,
      _id: { $gt: next }
    }))
    else hasPrev = false
  }
  return {
    items,
    hasPrev,
    hasNext,
    unread
  }
}

const notify = async (fromUser : ObjectId, type : NotifyType, postId : ObjectId, toUser : ObjectId)=>{
  await db.notifies.insertOne({
    receiverId: toUser,
    type: type,
    senderId: fromUser,
    relationId: postId,
    deleted: false,
    isRead: false,
    createAt: new Date().getTime(),
    content: NotifyTypeMessageMapping[type]
  })
}

export {
  notify,
  getNotifyInfo,
  readNotify,
  deleteNotify
}
