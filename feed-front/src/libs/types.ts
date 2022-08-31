export interface IUser {
  account: string
  avatar: string
  banner: string
  createAt: number
  focuses: number
  followers: number
  bio: string
  nickname: string
  _id: string
  focusStatus?: FollowStatus
  type: number
}

export const DefaultUser: IUser = {
  account: '',
  avatar: '',
  banner: '',
  createAt: 0,
  focuses: 0,
  followers: 0,
  bio: '',
  nickname: '',
  _id: '',
  type: 0,
}

export enum UserStatus {
  Normal = 1,
  Disabled = 2,
  Registering = 3,
}

export interface IPost {
  content: string
  createAt: number
  deleted: boolean
  images: string[]
  like: boolean
  likes: number
  relation?: IPost
  relationId?: string
  replays: number
  transmits: number
  type: PostType
  uid: string
  user: IUser
  _id: string
  processImages: string[]
}

export enum PostType {
  Default = 1,
  Replay = 2,
  Transmit = 3,
}

export const DefaultPost: IPost = {
  _id: '',
  content: '',
  createAt: 0,
  deleted: false,
  images: [],
  like: false,
  likes: 0,
  processImages: [],
  relation: undefined,
  relationId: '',
  replays: 0,
  transmits: 0,
  uid: '',
  user: DefaultUser,
  type: PostType.Default,
}

export interface IFollow {
  _id: string
  account: string
  nickname: string
  bio: string
  banner: string
  avatar: string
  focuses: number
  followers: number
  createAt: number
  focusStatus: FollowStatus
}

export enum FollowStatus {
  HasFollow = 1, // 已关注，单方向关注
  HasBeFollowed = 2, // 被关注，对方单方向关注，互关
  HasEachFollowed = 3, // 已互关
  NoFollow = 4, // 未关注，双方都没关注
  Self = 5, // 用户自己
}
export enum NotifyType {
  Focus = 1,
  Comment = 2,
  Transmit = 3,
}
export interface INotice {
  content: string
  createAt: number
  isRead: false
  receiverId: string
  relationId: string
  senderId: string
  type: NotifyType
  user: IUser
  _id: string
}

export interface IMessage {
  _id: string
  fromUser: string
  toUser: string
  isRead: boolean
  content?: string
  type: IMessageType
  fromDeleted: boolean
  toDeleted: boolean
  createAt: number
  user: IUser
  status?: SendStatus
  originImage?: string
  file?: File
  clientId ?: string
}

export enum SendStatus {
  Sending = 1,
  Fail = 2,
  Uploading = 3,
}

export enum IMessageType {
  Text = 1,
  Image = 2,
}

export enum IFollowObjectStatus {
  Follower = 1,
  Following = 2,
}

export interface IMessageSession {
  _id: string
  uid: string
  messageWith: string
  latestMessage: string | null
  time: number
  user: IUser
  message: IMessage
  notReadNumber: number
  top: boolean
}

export interface Position {
  left: number
  top: number
}
