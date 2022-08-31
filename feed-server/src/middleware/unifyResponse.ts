import {ErrorUnifyResponse, UnifyResponse} from '../lib/exception/UnifyResponse'

const unifyResponse = () => {
  return async (ctx, next) => {
    ctx.res.fail = (error : ErrorUnifyResponse) => {
      ctx.status = error.status
      ctx.body = error
    }

    ctx.res.success = () => {
      ctx.status = 200
      if (!(ctx.body instanceof UnifyResponse)){
        ctx.body = UnifyResponse.success(ctx.body)
      }
    }

    await next()
  }
}

export default unifyResponse
