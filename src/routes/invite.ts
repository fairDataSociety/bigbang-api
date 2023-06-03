import mysql, { FieldPacket, OkPacket } from 'mysql2/promise'
import express from 'express'
import { InviteCreate, InviteLink } from '../interfaces'
import { isEthAddress, isSignature, isSignatureCorrect } from '../utils/signature'
import { pool } from '../app'

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
    await connection.beginTransaction()
    try {
      const [inviterRows] = await connection.query<mysql.RowDataPacket[]>('SELECT id FROM inviter WHERE address = ?', [
        inviter_address,
      ])

      let inviterId

      if (inviterRows.length === 0) {
        const [result] = (await connection.query('INSERT INTO inviter (address) VALUES (?)', [
          inviter_address.toLowerCase(),
        ])) as [OkPacket, FieldPacket[]]
        inviterId = result.insertId
      } else {
        inviterId = inviterRows[0].id
      }

      if (!inviterId) {
        throw new Error(`Inviter id is not valid: ${inviterId}`)
      }

      // Insert invite information
      await connection.query(
        'INSERT INTO invite (inviter_id, invite_address, inviter_signature, invite_signature) VALUES (?, ?, ?, ?)',
        [inviterId, invite_address.toLowerCase(), inviter_signature.toLowerCase(), invite_signature.toLowerCase()],
      )

      // Commit the transaction
      await connection.commit()

      res.json({
        result: 'ok',
      })
    } catch (error) {
      // If there's an error, rollback the transaction
      await connection.rollback()

      // Pass the error to the next middleware
      next(error)
    } finally {
      // Whether there's an error or not, release the connection back to the pool
      connection.release()
    }
  } catch (e) {
    next(e)
  }
})

router.post('/link', async (req, res, next) => {
  try {
    const { invite_address, account_address, invite_signature, account_signature } = req.body as unknown as InviteLink

    if (!invite_address || !isEthAddress(invite_address)) {
      throw new Error(`"invite_address" is not valid: ${invite_address}`)
    }

    if (!account_address || !isEthAddress(account_address)) {
      throw new Error(`"account_address" is not valid: ${account_address}`)
    }

    if (!invite_signature || !isSignature(invite_signature)) {
      throw new Error(`"invite_signature" is not valid: ${invite_signature}`)
    }

    if (!account_signature || !isSignature(account_signature)) {
      throw new Error(`"account_signature" is not valid: ${account_signature}`)
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()
    try {
      const [inviteRows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM invite WHERE invite_address = ?',
        [invite_address],
      )

      if (inviteRows.length === 0) {
        throw new Error(`Invite does not exist with address: ${invite_address}`)
      }

      const inviteId = inviteRows[0].id

      // Insert account information
      await connection.query(
        'INSERT INTO account (invite_id, account_address, invite_signature, account_signature) VALUES (?, ?, ?, ?)',
        [inviteId, account_address.toLowerCase(), invite_signature.toLowerCase(), account_signature.toLowerCase()],
      )

      // Commit the transaction
      await connection.commit()

      res.json({
        result: 'ok',
      })
    } catch (error) {
      // If there's an error, rollback the transaction
      await connection.rollback()

      // Pass the error to the next middleware
      next(error)
    } finally {
      // Whether there's an error or not, release the connection back to the pool
      connection.release()
    }
  } catch (e) {
    next(e)
  }
})

export default router
