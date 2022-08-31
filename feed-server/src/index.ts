import middlewares from './middleware'
import config from './config'
import * as Koa from 'koa'
import * as compose from 'koa-compose'
import mongoConnect from './db'
import emitErrorHandler from './lib/exception/emitErrorHandler'

const app = new Koa()

app.on('error', emitErrorHandler)
app.use(compose(middlewares))

mongoConnect().then(()=>{
  app.listen(config.port, () => {
    console.log(`Feed server listening on http://localhost:${config.port}`)
  })
})
