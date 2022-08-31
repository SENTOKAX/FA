import { ObjectId } from 'mongodb'

export interface ISession {
  sid: string
  uid: ObjectId
  ip: string
  createdAt: Date
}

export interface IPost {
  uid: ObjectId
  type: PostType
  relationId ?: ObjectId
  content: string
  images: string[]
  replays: number
  transmits: number
  likes: number
  createAt: number
  deleted: boolean
}

export enum PostType {
  Default = 1,
  Replay = 2,
  Transmit = 3
}

export interface INotify {
  content: string
  receiverId: ObjectId
  type: NotifyType
  senderId: ObjectId
  relationId ?: ObjectId
  deleted: boolean
  isRead: boolean
  createAt: number
}

export enum NotifyType {
  Focus = 1,
  Comment = 2,
  Transmit = 3
}

export interface IMessage {
  fromUser: ObjectId
  toUser: ObjectId
  isRead: boolean
  content ?: string
  type: IMessageType
  fromDeleted: boolean
  toDeleted: boolean
  createAt: number
}

export enum IMessageType {
  Text = 1,
  Image = 2
}

export interface IUser {
  openid: string
  account: string
  nickname: string
  bio: string
  banner: string
  avatar: string
  focuses: number
  followers: number
  status: UserStatus
  createAt: number
}

export enum FocusStatus {
  HasFollow = 1,
  HasBeFollowed = 2,
  HasEachFollowed = 3,
  NoFollow = 4,
  Self = 5
}

export enum UserStatus {
  Normal = 1,
  Disabled = 2,
  Registering = 3,
}

export interface IFollow {
  uid: ObjectId
  followingId: ObjectId
  createAt: number
}

export interface ILike {
  uid: ObjectId
  postId: ObjectId
  createAt: number
}

export enum IFollowObjectStatus{
  Follower = 1,
  Following = 2
}

export interface IMessageSession {
  uid: ObjectId
  messageWith: ObjectId
  latestMessage: ObjectId | null
  time: number
  top: boolean
}
