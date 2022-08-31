import * as env from 'dotenv'

env.config()
const pwd = process.cwd()

const config = {
  port: Number(process.env.PORT) || 3000,
  logConfig: {
    flag: true,
    outDir: `${pwd}/log`,
    level: 'info'
  },
  mongo: {
    url: process.env.MONGO_URL
  },
  authWhiteList: [
    '/api/user/wxlogin'
  ],
  registerStatusWhiteList: [
    '/api/user/info',
    '/api/user/register'
  ],
  wechatAuth: {
    appId: process.env.APP_ID,
    appSecret: process.env.APP_SECRET
  },
  OSSConfig: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    host: process.env.OSS_HOST,
    bucket: process.env.OSS_BUCKET,
    callbackUrl: '',
    dir: 'images/',
    expiration: 600, // seconds
    maxSize: 1048576000
  },
  processImage: '?x-oss-process=image/resize,p_50'
}

export default config
