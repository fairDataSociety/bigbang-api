import express from 'express'
import cors from 'cors'
import inviteRouter from './routes/invite'
import { VERSION } from './const'

export const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = {
    status: 'error',
    message: err.message,
  }

  res.status(500).json(error)
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(`/v${VERSION}/invite`, inviteRouter)

// eslint-disable-next-line unused-imports/no-unused-vars
app.use(errorHandler)

export default app
