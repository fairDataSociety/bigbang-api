import mysql from 'mysql2/promise'
import express from 'express'
import { InviteCreate } from '../interfaces'
import { isEthAddress, isSignature, isSignatureCorrect } from '../utils/signature'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'bigbang',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const router = express.Router()

/**
 * Creates a record about inviter and his invite
 */
router.post('/create', async (req, res, next) => {
  try {
    const { inviter_address, invite_address, invite_signature, inviter_signature } = req.body as unknown as InviteCreate

    if (!inviter_address || !isEthAddress(inviter_address)) {
      throw new Error(`"inviter_address" is not valid: ${inviter_address}`)
    }

    if (!invite_address || !isEthAddress(invite_address)) {
      throw new Error(`"invite_address" is not valid: ${invite_address}`)
    }

    if (!invite_signature || !isSignature(invite_signature)) {
      throw new Error(`"invite_signature" is not valid: ${invite_signature}`)
    }

    if (!inviter_signature || !isSignature(inviter_signature)) {
      throw new Error(`"inviter_signature" is not valid: ${inviter_signature}`)
    }

    if (!isSignatureCorrect(inviter_address, inviter_signature, invite_address)) {
      throw new Error('Inviter signature is not correct')
    }

    if (!isSignatureCorrect(invite_address, invite_signature, inviter_address)) {
      throw new Error('Invite signature is not correct')
    }

    const connection = await pool.getConnection()
    // const [rows] = await connection.query('SELECT * FROM invites WHERE inviter_address = ? AND invite_address = ?', [inviter_address, invite_address])
    // todo add signatures to mysql
    // todo check duplicates
    res.json({
      result: 'ok',
    })
  } catch (e) {
    next(e)
  }
})

router.post('/link', async (req, res, next) => {
  // todo what is invite wasn't created before? skip linking
  try {
    const query = req.query as unknown as InviteCreate
    const { inviter_address, invite_address, invite_signature, inviter_signature } = query

    // todo validate signatures
    // todo add signatures to mysql
    res.json({
      result: 'ok',
    })
  } catch (e) {
    next(e)
  }
})

export default router
