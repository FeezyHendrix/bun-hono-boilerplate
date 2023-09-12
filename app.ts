import { Hono } from 'hono';
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'


const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.notFound(() => {
  throw new ApiError(httpStatus.NOT_FOUND, 'Not found')
})

app.onError(errorHandler)

defaultRoutes.forEach((route) => {
  app.route(`${route.path}`, route.route)
})

export default app