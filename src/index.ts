import dotenv from 'dotenv'
import app from './app'

dotenv.config()

const port = process.env.PORT || 1111
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`)
})
