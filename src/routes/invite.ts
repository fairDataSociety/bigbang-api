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

    const inviterAddress = inviter_address?.toLowerCase()
    const inviteAddress = invite_address?.toLowerCase()
    const inviteSignature = invite_signature?.toLowerCase()
    const inviterSignature = inviter_signature?.toLowerCase()

    if (!inviterAddress || !isEthAddress(inviterAddress)) {
      throw new Error(`"inviter_address" is not valid: ${inviterAddress}`)
    }

    if (!inviteAddress || !isEthAddress(inviteAddress)) {
      throw new Error(`"invite_address" is not valid: ${inviteAddress}`)
    }

    if (!inviteSignature || !isSignature(inviteSignature)) {
      throw new Error(`"invite_signature" is not valid: ${inviteSignature}`)
    }

    if (!inviterSignature || !isSignature(inviterSignature)) {
      throw new Error(`"inviter_signature" is not valid: ${inviterSignature}`)
    }

    if (!isSignatureCorrect(inviterAddress, inviterSignature, inviteAddress)) {
      throw new Error(`Inviter signature is not correct: ${inviterSignature}`)
    }

    if (!isSignatureCorrect(inviteAddress, inviteSignature, inviterAddress)) {
      throw new Error(`Invite signature is not correct: ${inviteSignature}`)
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()
    try {
      const [inviterRows] = await connection.query<mysql.RowDataPacket[]>('SELECT id FROM inviter WHERE address = ?', [
        inviterAddress,
      ])

      let inviterId

      if (inviterRows.length === 0) {
        const [result] = (await connection.query('INSERT INTO inviter (address) VALUES (?)', [inviterAddress])) as [
          OkPacket,
          FieldPacket[],
        ]
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
        [inviterId, inviteAddress, inviterSignature, inviteSignature],
      )

      // Commit the transaction
      await connection.commit()

      res.json({
        status: 'ok',
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

    const inviteAddress = invite_address.toLowerCase()
    const accountAddress = account_address.toLowerCase()
    const inviteSignature = invite_signature.toLowerCase()
    const accountSignature = account_signature.toLowerCase()

    if (!inviteAddress || !isEthAddress(inviteAddress)) {
      throw new Error(`"invite_address" is not valid: ${inviteAddress}`)
    }

    if (!accountAddress || !isEthAddress(accountAddress)) {
      throw new Error(`"account_address" is not valid: ${accountAddress}`)
    }

    if (!inviteSignature || !isSignature(inviteSignature)) {
      throw new Error(`"invite_signature" is not valid: ${inviteSignature}`)
    }

    if (!accountSignature || !isSignature(accountSignature)) {
      throw new Error(`"account_signature" is not valid: ${accountSignature}`)
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()
    try {
      const [inviteRows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM invite WHERE invite_address = ?',
        [inviteAddress],
      )

      if (inviteRows.length === 0) {
        throw new Error(`Invite does not exist with address: ${inviteAddress}`)
      }

      const inviteId = inviteRows[0].id

      // Insert account information
      await connection.query(
        'INSERT INTO account (invite_id, account_address, invite_signature, account_signature) VALUES (?, ?, ?, ?)',
        [inviteId, accountAddress, inviteSignature, accountSignature],
      )

      // Commit the transaction
      await connection.commit()

      res.json({
        status: 'ok',
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

/**
 * Amount of registered invites and amount of created accounts
 */
router.get('/inviter/:address', async (req, res, next) => {
  try {
    const address = req.params?.address?.toLowerCase()

    if (!isEthAddress(address)) {
      throw new Error(`"address" is not valid: ${address}`)
    }

    const connection = await pool.getConnection()
    try {
      const [inviterRows] = await connection.query<mysql.RowDataPacket[]>('SELECT id FROM inviter WHERE address = ?', [
        address,
      ])

      if (inviterRows.length === 0) {
        throw new Error(`Inviter does not exist with address: ${address}`)
      }

      const inviterId = inviterRows[0].id

      const [inviteRows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM invite WHERE inviter_id = ?',
        [inviterId],
      )

      const [accountRows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM account WHERE invite_id IN (SELECT id FROM invite WHERE inviter_id = ?)',
        [inviterId],
      )

      res.json({
        status: 'ok',
        data: {
          invites: inviteRows[0].count,
          accounts: accountRows[0].count,
        },
      })
    } catch (error) {
      next(error)
    } finally {
      connection.release()
    }
  } catch (e) {
    next(e)
  }
})

router.get('/info', async (req, res, next) => {
  try {
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.query<mysql.RowDataPacket[]>(`
        SELECT 'invites' as type, COUNT(*) as count FROM invite
        UNION ALL
        SELECT 'accounts', COUNT(*) FROM account
        UNION ALL
        SELECT 'inviters', COUNT(*) FROM inviter
      `)

      const info = result.reduce((acc: Record<string, number>, row) => {
        acc[row.type] = row.count

        return acc
      }, {})

      res.json({
        status: 'ok',
        data: info,
      })
    } catch (error) {
      next(error)
    } finally {
      connection.release()
    }
  } catch (e) {
    next(e)
  }
})

export default router
