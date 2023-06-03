// eslint-disable-next-line @typescript-eslint/no-var-requires
import { config } from 'dotenv'
import { Knex } from 'knex'

config()

const knexConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
  },
  migrations: {
    directory: './migrations',
  },
}

const configurations: { [key: string]: Knex.Config } = {
  development: knexConfig,
  production: knexConfig,
}

export default configurations
