import { MongoClient, Collection } from 'mongodb'
import config from './config'
import { IFollow, ILike, IMessage, IMessageSession, INotify, IPost, ISession, IUser } from './models/types'

export let sessions: Collection<ISession>
export let posts: Collection<IPost>
export let notifies: Collection<INotify>
export let messages: Collection<IMessage>
export let users: Collection<IUser>
export let focus: Collection<IFollow>
export let likes: Collection<ILike>
export let messageSession: Collection<IMessageSession>

export default async () => {
  console.log('Connecting MongoDB...')
  const client = new MongoClient(config.mongo.url)
  await client.connect().then(() => {
    console.log('MongoDB connect success')
  }).catch(error => {
    console.log('MongoDB connect error : ', error.message)
  })

  const db = client.db()
  sessions = db.collection('sessions')
  posts = db.collection('posts')
  notifies = db.collection('notifies')
  messages = db.collection('messages')
  users = db.collection('users')
  focus = db.collection('focus')
  likes = db.collection('likes')
  messageSession = db.collection('messageSession')

  await sessions.createIndex({
    sid: 1,
    uid: 1
  }, {
    unique: true
  })
  await sessions.createIndex({
    createdAt: 1
  }, {
    expireAfterSeconds: 60 * 60 * 24 * 7
  })
}
