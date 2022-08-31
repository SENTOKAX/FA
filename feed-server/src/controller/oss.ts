import config from '../config'
import * as OSS from 'ali-oss'
import * as moment from 'moment'
import { randomBytes } from 'crypto'

const getUploadSTS = async (ctx)=>{
  const {filename} = ctx.request.query

  const client = new OSS({
    accessKeyId: config.OSSConfig.accessKeyId,
    accessKeySecret: config.OSSConfig.accessKeySecret,
    bucket: config.OSSConfig.bucket,
    callbackUrl: config.OSSConfig.callbackUrl,
    dir: config.OSSConfig.dir
  })
  const expiration = moment(new Date()).add(config.OSSConfig.expiration , 'seconds').toDate()
  const policy = {
    expiration: expiration.toISOString(),
    conditions: [
      ["content-length-range", 0, config.OSSConfig.maxSize],
    ],
  }
  const formData = await client.calculatePostSignature(policy)
  const host = config.OSSConfig.host
  const callback = {
    callbackUrl: config.OSSConfig.callbackUrl,
    callbackBody:
      "filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}",
    callbackBodyType: "application/x-www-form-urlencoded",
  }
  const key = config.OSSConfig.dir + randomBytes(12).toString('hex') + moment(new Date()).format('_YYYYMMDD_hhmmss') + filename.split('.').pop()

  ctx.body = {
    expire: moment(expiration).unix().toString(),
    policy: formData.policy,
    signature: formData.Signature,
    OSSAccessKeyId: formData.OSSAccessKeyId,
    host,
    callback: Buffer.from(JSON.stringify(callback)).toString("base64"),
    key,
    success_action_status: 200,
    url: host + key,
    processUrl: host + key + config.processImage
  }
}


export {
  getUploadSTS
}
