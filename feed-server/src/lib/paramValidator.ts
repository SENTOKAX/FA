import ExceptionStatus from './exception/ExceptionStatus'
import { ErrorUnifyResponse } from './exception/UnifyResponse'

const paramValidator = paramSchema => {
  return async function (ctx, next) {
    let { body } = ctx.request
    try{
      if (typeof body === 'string' && body.length) body = JSON.parse(body)
    }catch (e){}
    const params = {
      body,
      params: ctx.request.params,
      query: ctx.request.query
    }
    if (!paramSchema) return next()

    const schemaKeys = Object.getOwnPropertyNames(paramSchema)
    if (!schemaKeys.length) return next()

    schemaKeys.some(item => {
      const param = params[item]

      const { value, error: validRes } = paramSchema[item].validate(param, {
        allowUnknown: true
      })
      Object.assign(ctx.request[item], value || {})
      if (validRes){
        throw ExceptionStatus[validRes.message] || new ErrorUnifyResponse(4000, validRes.message, 400)
      }
    })

    await next()
  }
}

export default paramValidator
