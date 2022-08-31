import {ErrorUnifyResponse} from '../lib/exception/UnifyResponse'

const errorCheck = () => {
  return async (ctx, next) => {
    try {
      await next()
      if ((ctx._matchedRoute && ctx.status === 404) || ctx.status === 200 || ctx.status === 204) {
        ctx.res.success()
      }
    }catch (error){
      if (error instanceof ErrorUnifyResponse) {
        ctx.res.fail(error)
      }else {
        ctx.app.emit('error', error, ctx)
      }
    }
  }
}

export default errorCheck
