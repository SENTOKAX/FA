import * as sessionService from './session'
import ExceptionStatus from '../lib/exception/ExceptionStatus'
import { getAccessToken, getUserInfoFromWechat } from '../lib/request'
import * as db from '../db'
import { IFollowObjectStatus, IUser, UserStatus } from '../models/types'
import { ObjectId } from 'mongodb'
import { trimObjectEmpty } from '../lib/utils'
import * as focusService from './focus'

const getAccountInfo = async (uid: ObjectId, account: string) => {
  const user = await db.users.findOne<IUser & { _id: ObjectId }>({
    account,
    status: UserStatus.Normal
  }, {
    projection: {
      status: 0
    }
  })
  if (!user) throw ExceptionStatus.ErrUserNotExist
  return await focusService.wrapperWithFocusStatus(user, uid)
}


const searchUser = async (keyword: string, followFilter: { uid: ObjectId, follow: IFollowObjectStatus }, paging: { limit: number, prev?: ObjectId, next?: ObjectId }, uid: ObjectId) => {
  const filter: any = {
    status: UserStatus.Normal,
    $or: [
      { account: { $regex: keyword, $options: 'i' } },
      { nickname: { $regex: keyword, $options: 'i' } },
      { bio: { $regex: keyword, $options: 'i' } },
    ]
  }
  if (followFilter.uid) {
    const ids = (await (await db.focus.find({
      [followFilter.follow === IFollowObjectStatus.Follower ? 'followingId' : 'uid']: followFilter.uid
    })).toArray()).map(item => followFilter.follow === IFollowObjectStatus.Follower ? item.uid : item.followingId)
    filter._id = {
      $in: ids
    }
  }

  const pagingMatch = {
    $match: !paging.next && !paging.prev ? {} : (
      !!paging.prev ? {
        _id: {
          $lt: paging.prev
        }
      } : {
        _id: {
          $gt: paging.next
        }
      }
    )
  }

  const users = await db.users.aggregate<IUser & { _id: ObjectId }>([ { $match: filter }, pagingMatch, {
    $project: {
      openid: 0,
      status: 0
    }
  } ]).sort({ _id: paging.prev ? -1 : 1 }).limit(paging.limit).sort({ _id: 1 }).toArray()

  let hasNext = true
  if (users.length > 0) {
    hasNext = !!(await db.users.aggregate([
      { $match: filter },
      {
        $match: { _id: { $gt: users[users.length - 1]._id } }
      }
    ]).toArray()).length
  } else if (paging.next) {
    hasNext = false
  } else {
    if (paging.prev) hasNext = !!(await db.users.aggregate([
      { $match: filter },
      {
        $match: { _id: { $gt: paging.prev } }
      }
    ]).toArray()).length
    else hasNext = false
  }

  let hasPrev = true
  if (users.length > 0) {
    hasPrev = !!(await db.users.aggregate([
      { $match: filter },
      {
        $match: { _id: { $lt: users[0]._id } }
      }
    ]).toArray()).length
  } else if (paging.prev) {
    hasPrev = false
  } else {
    if (paging.next) hasPrev = !!(await db.users.aggregate([
      { $match: filter },
      {
        $match: { _id: { $lt: paging.next } }
      }
    ]).toArray()).length
    else hasPrev = false
  }

  let result = []
  for (const user of users) {
    result.push(await focusService.wrapperWithFocusStatus(user, uid))
  }
  return {
    list: result,
    hasPrev,
    hasNext
  }
}


const modifyInfo = async (uid: ObjectId, avatar: string, backgroundImage: string, introduce: string, nickname: string) => {
  await db.users.updateOne({
    _id: uid
  }, {
    $set: trimObjectEmpty({
      avatar,
      banner: backgroundImage,
      bio: introduce,
      nickname
    })
  })
  return await db.users.findOne({_id: uid})
}


const getUserInfo = async (_id:ObjectId) => {
  return await db.users.findOne({
    _id
  }, {
    projection: {
      openid: 0
    }
  })
}

const register = async (account: string, id: ObjectId, ip: string) => {
  const user = await db.users.findOne({
    _id: id
  })
  if (!user || user.status === UserStatus.Disabled) throw ExceptionStatus.ErrUserNotExist
  if (user.status !== UserStatus.Registering) throw ExceptionStatus.ErrHasRegister
  const sameAccountUser = await db.users.findOne({
    account,
    status: UserStatus.Normal
  })
  if (sameAccountUser) throw ExceptionStatus.ErrAccountExist

  await db.users.updateOne({
    _id: id
  }, {
    $set: {
      account,
      status: UserStatus.Normal
    }
  })
}

const wxlogin = async (code: string, ip: string) => {
  const data = await getAccessToken(code)
  if (data?.errcode === 40029) throw ExceptionStatus.ErrLogin
  const { openid, nickname, headimgurl } = await getUserInfoFromWechat(data.access_token, data.openid)
  if (!openid) throw ExceptionStatus.ErrLogin
  const user = await db.users.findOne({
    openid
  })
  let uid = user?._id
  if (!user) {
    const insertedUser = await db.users.insertOne({
      openid,
      account: '',
      nickname,
      bio: '',
      banner: '',
      avatar: headimgurl,
      focuses: 0,
      followers: 0,
      status: UserStatus.Registering,
      createAt: new Date().getTime()
    })
    uid = insertedUser.insertedId
  }
  return {
    token: await sessionService.generateSession(uid, ip),
    needModifyName: !user || user.status === UserStatus.Registering
  }
}

const logout = async (sid: string)=>{
  await sessionService.clearSession(sid)
}

export {
  wxlogin,
  register,
  getUserInfo,
  modifyInfo,
  searchUser,
  getAccountInfo,
  logout
}
