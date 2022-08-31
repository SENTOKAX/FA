import { ErrorUnifyResponse } from './UnifyResponse'

const emitErrorHandler = (error, ctx) => {
  console.error(error)
  if (ctx) {
    ctx.status = 500
    ctx.body = new ErrorUnifyResponse(5000, '服务器内部异常')
  }
}
export default emitErrorHandler
