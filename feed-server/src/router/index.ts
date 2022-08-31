import * as koaRouter from 'koa-router'
import * as Joi from 'joi'
import * as Koa from 'koa'
import paramValidator from '../lib/paramValidator'
import routes from './routes'

export interface RouterType {
  method: 'get' | 'post' | 'put' | 'delete' | 'head'
  path: string
  controller: (ctx : Koa.Context, next ?: Koa.Next) => Promise<void>
  schema: Record<string, Joi.ObjectSchema>
}

export interface RouterGroupType {
  prefix: string,
  routes: RouteType
}

export type RouteType = (RouterType | RouterGroupType)[]

const router = new koaRouter({
  prefix: '/api'
})

const instanceofRouterType = (props : any) : props is RouterType => typeof (props as RouterType)['method'] !== 'undefined'
const instanceofRouterGroupType = (props : any) : props is RouterGroupType => typeof (props as RouterGroupType)['prefix'] !== 'undefined'

const addRoutes = (router, routes : RouteType)=>{
  for (const route of routes) {
    if (instanceofRouterType(route)){
      router[route.method](route.path, paramValidator(route.schema), route.controller)
    }else if(instanceofRouterGroupType(route)){
      const routerGroup = new koaRouter({
        prefix: route.prefix
      })
      addRoutes(routerGroup, route.routes)
      router.use(routerGroup.routes())
    }
  }
}

addRoutes(router, routes)

export default router
