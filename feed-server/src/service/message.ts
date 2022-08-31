import { ObjectId } from 'mongodb'
import * as db from '../db'
import { IMessage, IMessageType, UserStatus } from '../models/types'
import ExceptionStatus from '../lib/exception/ExceptionStatus'
import config from '../config'

const topMessageSession = async (uid: ObjectId, id: ObjectId, top: boolean)=>{
  const messageSession = await db.messageSession.findOne({
    uid,
    _id: id
  })
  if (!messageSession) throw ExceptionStatus.ErrMessageSessionNotFind
  if (top === messageSession.top) return
  await db.messageSession.updateOne({
    uid,
    _id: id
  }, {
    $set: {
      top
    }
  })
}


const getDialogueMessage = async (uid: ObjectId, account: string, paging: { next: ObjectId | null; prev: ObjectId | null; limit: number }) => {
  const user = await db.users.findOne({
    account,
    status: UserStatus.Normal
  }, {
    projection: {
      status: 0,
      openid: 0
    }
  })
  if (!user) throw ExceptionStatus.ErrUserNotExist
  if (uid.equals(user._id)) throw ExceptionStatus.ErrSendDialogue
  const id = user._id
  const matchPipeline = [ {
    $match: {
      $or: [
        { fromUser: uid, fromDeleted: false, toUser: id },
        { toUser: uid, toDeleted: false, fromUser: id }
      ]
    }
  },
    {
      $sort: { createAt: -1 }
    } ]
  const result = await db.messages.aggregate<IMessage & {_id: ObjectId}>([
    ...matchPipeline,
    {
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
  ]).sort({_id: paging.prev ? 1 : -1}).limit(paging.limit).sort({ _id: -1 }).toArray()

  let hasNext = true
  if (result.length > 0) {
    hasNext = !!(await db.messages.aggregate([
      ...matchPipeline,
      {
        $match: {
          _id: {
            $lt: new ObjectId(result[result.length - 1]._id)
          }
        }
      }
    ]).toArray()).length
  } else if (paging.next) {
    hasNext = false
  } else {
    if (paging.prev) hasNext = !!(await db.messages.aggregate([
      ...matchPipeline,
      {
        $match: {
          _id: { $lt: paging.prev }
        }
      }
      ]))
    else hasNext = false
  }

  let hasPrev = true
  if (result.length > 0) {
    hasPrev = !!(await db.messages.aggregate([
      ...matchPipeline,
      {
        $match: {
          _id: { $gt: new ObjectId(result[0]._id) }
        }
      }
    ]).toArray()).length
  } else if (paging.prev) {
    hasPrev = false
  } else {
    if (paging.next) hasPrev = !!(await db.messages.aggregate([ {
      ...matchPipeline
    },
      { $match: { _id: { $gt: paging.next } } } ]).toArray()).length
    else hasPrev = false
  }
  const sessionTime = (await db.messageSession.findOne({
    uid,
    messageWith: user._id
  }))?.time || 0
  await messageSessionTime(uid, id, new Date().getTime())
  return {
    items: await processImages(result),
    hasNext,
    hasPrev,
    user,
    sessionTime
  }
}

const processImages = async (messages : IMessage[])=>{
  let result : (IMessage & {originImage ?: string})[] = [...messages]
  for (const message of result) {
    if (message.type === IMessageType.Image){
      const content = message.content
      message.content = content + config.processImage
      message.originImage = content
    }
  }
  return result
}

const deleteMessage = async (uid: ObjectId, ids: ObjectId | ObjectId[]) => {
  if (ids instanceof Array) {
    for (const id of ids) {
      await deleteOneMessage(uid, id)
    }
  } else {
    await deleteOneMessage(uid, ids)
  }
}

const deleteOneMessage = async (uid: ObjectId, id: ObjectId) => {
  const message = await db.messages.findOne({
    _id: id
  })
  if (message) {
    await db.messages.updateOne({
      _id: id,
      [message.fromUser.equals(uid) ? 'fromUser' : 'toUser']: uid,
      [message.fromUser.equals(uid) ? 'fromDeleted' : 'toDeleted']: false
    }, {
      $set: {
        [message.fromUser.equals(uid) ? 'fromDeleted' : 'toDeleted']: true
      }
    })
    const deleteLatestMessage = await db.messageSession.findOne({
      uid,
      latestMessage: id
    })
    if (!!deleteLatestMessage){
      const latestMessage = (await db.messages.find({
        $or: [
          {fromUser: uid, toUser: deleteLatestMessage.messageWith, fromDeleted: false},
          {fromUser: deleteLatestMessage.messageWith, toUser: uid, toDeleted: false},
        ]
      }).sort({createAt: -1}).limit(1).toArray()).pop()
      await messageSession(uid, deleteLatestMessage.messageWith, latestMessage?._id || null)
    }
  }
}

const deleteSession = async (uid: ObjectId, ids: ObjectId | ObjectId[]) => {
  if (ids instanceof Array) {
    for (const id of ids) {
      await deleteOneSession(uid, id)
    }
  } else {
    await deleteOneSession(uid, ids)
  }
}

const deleteOneSession = async (uid: ObjectId, id: ObjectId)=>{
  await db.messageSession.deleteOne({
    uid,
    _id: id
  })
}

const getMessageList = async (uid: ObjectId, paging: {prev: number | null, limit: number, next: number | null}) => {
  const messagesTemp = await db.messageSession.aggregate([
    {
      $match: {
        uid
      }
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'latestMessage',
        foreignField: '_id',
        as: 'message'
      }
    },
    { $unwind: '$message' },
    {
      $match: !paging.next && !paging.prev ? {} : (
        !!paging.prev ? {
          'message.createAt': {
            $gt: paging.prev
          }
        } : {
          'message.createAt': {
            $lt: paging.next
          }
        }
      )
    },
    {
      $lookup: {
        from: 'users',
        localField: 'messageWith',
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
  ]).sort({'message.createAt': paging.prev ? 1 : -1})
  const messages = paging.prev ? await messagesTemp.toArray() : await messagesTemp.limit(paging.limit).toArray()

  let hasNext = true
  if (messages.length > 0){
    hasNext = !!(await db.messageSession.aggregate([
      { $match: { uid } },
      {
        $match: { time: { $lt: messages[messages.length - 1].time } }
      }
    ]).toArray()).length
  }else if (paging.next) {
    hasNext = false
  }else {
    if (paging.prev) hasNext = !!(await db.messageSession.aggregate([
      { $match: { uid } },
      {
        $match: { time: { $lt: paging.prev } }
      }
    ]).toArray()).length
    else hasNext = false
  }

  let hasPrev = true
  if (messages.length > 0){
    hasPrev = !!(await db.messageSession.aggregate([
      { $match: { uid } },
      {
        $match: { time: { $gt: messages[0].time } }
      }
    ]).toArray()).length
  }else if (paging.prev) {
    hasPrev = false
  }else {
    if (paging.next) hasPrev = !!(await db.messageSession.aggregate([
      { $match: { uid } },
      {
        $match: { time: { $gt: paging.next } }
      }
    ]).toArray()).length
    else hasPrev = false
  }

  for (const message of messages) {
    message.notReadNumber = (await db.messages.find({
      fromUser: message.user._id,
      toUser: uid,
      toDeleted: false,
      createAt: {
        $gt: message?.time || 0
      }
    }).toArray()).length || 0
  }

  const sessions = await db.messageSession.find({
    uid
  }).toArray()
  let unRead = 0
  for (const session of sessions) {
    unRead += (await db.messages.find({
      fromUser: session.messageWith,
      toUser: uid,
      toDeleted: false,
      createAt: {
        $gt: session?.time || 0
      }
    }).toArray()).length || 0
  }
  return {
    list: messages,
    hasNext,
    hasPrev,
    unRead
  }
}

const messageSession = async (uid: ObjectId, messageWith: ObjectId, latestMessage : ObjectId | null, time ?: number) => {
  await db.messageSession.updateOne({
    uid,
    messageWith
  }, {
    $set: {
      latestMessage
    },
    $setOnInsert: {
      top: false,
      time: time || new Date().getTime()
    }
  }, {
    upsert: true
  })
}

const messageSessionTime = async (uid: ObjectId, messageWith: ObjectId, time: number) => {
  await db.messageSession.updateOne({
    uid,
    messageWith
  }, {
    $set: {
      time
    }
  })
}

const sendMessage = async (uid: ObjectId, sendTo: ObjectId, content: string, image: string) => {
  if (uid.equals(sendTo)) throw ExceptionStatus.ErrSendToSelf
  const user = await db.users.findOne({
    _id: sendTo
  })
  if (!user) throw ExceptionStatus.ErrUserNotExist
  const now = new Date().getTime()
  const message = await db.messages.insertOne({
    fromUser: uid,
    toUser: sendTo,
    isRead: false,
    content: content || image,
    type: content ? IMessageType.Text : IMessageType.Image,
    fromDeleted: false,
    toDeleted: false,
    createAt: now
  })
  const id = message.insertedId
  await messageSession(uid, sendTo, id, now - 1)
  await messageSessionTime(uid, sendTo, now)
  await messageSession(sendTo, uid, id, now - 1)
  return await db.messages.findOne({
    _id: message.insertedId
  })
}

export {
  sendMessage,
  messageSession,
  getMessageList,
  deleteMessage,
  getDialogueMessage,
  deleteSession,
  topMessageSession
}
