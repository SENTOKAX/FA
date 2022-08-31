import * as db from '../db'
import ExceptionStatus from '../lib/exception/ExceptionStatus'
import { ObjectId } from 'mongodb'
import { FocusStatus, IUser, NotifyType, UserStatus } from '../models/types'
import * as notifyService from './notify'

const wrapperWithFocusStatus = async (user: (IUser & { _id: ObjectId }), selfId: ObjectId): Promise<(IUser & { focusStatus: FocusStatus })> => {
  const followUser = !!(await db.focus.findOne({
    uid: selfId,
    followingId: user._id
  }))
  const beFollowed = !!(await db.focus.findOne({
    uid: user._id,
    followingId: selfId
  }))
  let focusStatus = FocusStatus.NoFollow
  if (followUser && beFollowed) focusStatus = FocusStatus.HasEachFollowed
  else if (followUser) focusStatus = FocusStatus.HasFollow
  else if (beFollowed) focusStatus = FocusStatus.HasBeFollowed
  else if (user._id.equals(selfId)) focusStatus = FocusStatus.Self
  return {
    ...user,
    focusStatus
  }
}

const changeFocusStatus = async (uid: ObjectId, follow: ObjectId, status: boolean) => {
  if (uid.equals(follow)) throw ExceptionStatus.ErrFocusSelf
  const focusUser = await db.users.findOne({
    _id: follow,
    status: UserStatus.Normal
  })
  if (!focusUser) throw ExceptionStatus.ErrFocusNotExist
  const focusBefore = !!(await db.focus.findOne({
    uid,
    followingId: follow
  }))
  if (status === focusBefore) return {
    focusStatus: (await wrapperWithFocusStatus(focusUser, uid)).focusStatus
  }

  if (status) {
    await db.focus.insertOne({
      uid,
      followingId: follow,
      createAt: new Date().getTime()
    })
    await notifyService.notify(uid, NotifyType.Focus, null, follow)
  } else {
    await db.focus.deleteOne({
      uid,
      followingId: follow,
    })
  }
  await db.users.updateOne({
    _id: uid
  }, {
    $inc: {
      focuses: status ? 1 : -1
    }
  })
  await db.users.updateOne({
    _id: follow
  }, {
    $inc: {
      followers: status ? 1 : -1
    }
  })

  return {
    focusStatus: (await wrapperWithFocusStatus(focusUser, uid)).focusStatus
  }
}

export {
  changeFocusStatus,
  wrapperWithFocusStatus
}
