import { ObjectId } from 'mongodb'
import * as db from '../db'
import { randomBytes } from 'crypto'
import { UserStatus } from '../models/types'
import ExceptionStatus from '../lib/exception/ExceptionStatus'

const generateSession = async (uid : ObjectId, ip : string)=>{
  const sid = randomBytes(12).toString('hex')
  await db.sessions.insertOne( {
    sid,
    uid,
    ip,
    createdAt: new Date()
  })
  return sid
}

const clearSession = async (sid : string) => {
  await db.sessions.findOneAndDelete({
    sid
  })
}

const getUserInfoFromSession = async (sid : string) => {
  const session = await db.sessions.findOne({
    sid
  })
  if (!session) throw ExceptionStatus.ErrTokenTimeout
  if (new Date().getTime() - session.createdAt.getTime() > 1000 * 60 * 60 * 24 * 7) throw ExceptionStatus.ErrTokenTimeout
  const user = await db.users.findOne({
    _id: session.uid
  },{
    projection: {
      openid: 0
    }
  })
  if (!user) throw  ExceptionStatus.ErrUserNotExist
  if (user.status === UserStatus.Disabled) throw ExceptionStatus.ErrUserCancelled
  return user
}

const clearUserSession = async (userId: ObjectId) => {
  await db.sessions.deleteMany({
    userId
  })
}

export {
  generateSession,
  clearSession,
  getUserInfoFromSession,
  clearUserSession
}
