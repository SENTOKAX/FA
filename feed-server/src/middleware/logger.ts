import * as log4js from 'log4js'
import config from '../config'
import * as dayjs from 'dayjs'
import { SUCCESS } from '../lib/exception/ExceptionStatus'

const { outDir, flag, level } = config.logConfig

log4js.configure({
  appenders: { cheese: { type: 'file', filename: `${outDir}/request.log` } },
  categories: { default: { appenders: [ 'cheese' ], level: 'info' } },
  pm2: true
})

const logger = log4js.getLogger()
logger.level = level

const log = () => {
  return async (ctx, next) => {
    const startTime = Date.now()
    await next()
    const endTime = Date.now()
    const logs = ctx.state.logs || {}
    const { query, body, headers } = ctx.request
    const data = {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      method: ctx.method,
      url: ctx.url,
      ip: ctx.request.ip,
      status: ctx.status,
      cost: endTime - startTime,
      query,
      body,
      headers,
      ...logs
    }
    if (flag) {
      const { status, params } = ctx
      data.status = status
      data.params = params
      data.result = ctx.body || 'no content'
      if (ctx.body?.code !== SUCCESS) {
        logger.error(JSON.stringify(data))
      } else {
        logger.info(JSON.stringify(data))
      }
    }
    // console.log(JSON.stringify(data))
  }
}

export default log
