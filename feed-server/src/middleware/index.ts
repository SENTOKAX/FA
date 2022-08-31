import * as koaBody from 'koa-body'
import * as cors from '@koa/cors'

import log from './logger'
import errorCheck from './errorCheck'
import unifyResponse from './unifyResponse'
import authLogStatus from './authLogStatus'
import * as staticServe from 'koa-static'
import * as path from 'path'
import config from '../config'
import router from '../router'

const LoggerMiddleware = log()
const ErrorHandlerMiddleware = errorCheck()
const KoaBodyMiddleware = koaBody({
  formLimit: '56kb',
  jsonLimit: '1mb',
  textLimit: '1mb',
  strict: true,
  multipart: true
})
const CorsMiddleware = cors({
  origin: '*',
  credentials: true,
  allowMethods: [ 'GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH' ]
})
const UnifyResponseMessageMiddleware = unifyResponse()
const RouterMiddleware = router.routes()
const RouterAllowedMiddleware = router.allowedMethods()
const LogStatusMiddleware = authLogStatus()

const middlewares = [
  LoggerMiddleware,
  ErrorHandlerMiddleware,
  KoaBodyMiddleware,
  CorsMiddleware,
  UnifyResponseMessageMiddleware,
  LogStatusMiddleware,
  RouterMiddleware,
  RouterAllowedMiddleware
]

export default middlewares
