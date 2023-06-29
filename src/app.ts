import express from 'express'
import cors from 'cors'
import inviteRouter from './routes/invite'
import inviterRouter from './routes/inviter'
import { VERSION } from './const'
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'bigbang',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

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
app.use(`/v${VERSION}/invite/inviter`, inviterRouter)

// eslint-disable-next-line unused-imports/no-unused-vars
app.use(errorHandler)

export default app
