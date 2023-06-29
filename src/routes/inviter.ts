import { isEthAddress } from '../utils/signature'
import { pool } from '../app'
import mysql from 'mysql2/promise'
import express from 'express'

const router = express.Router()

/**
 * Amount of registered invites and amount of created accounts
 */
router.get('/:address', async (req, res, next) => {
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

/**
 * Gets information list of invites for inviter
 */
router.post('/:address', async (req, res, next) => {
  try {
    const MAX_INVITES = 50
    const address = req.params?.address?.toLowerCase()
    let invites = req.body?.invites

    if (!isEthAddress(address)) {
      throw new Error(`"address" is not valid: ${address}`)
    }

    if (!Array.isArray(invites)) {
      throw new Error(`"invites" is not valid array`)
    }

    if (invites.length === 0 || invites.length > 50) {
      throw new Error(`"invites" length is not valid. Expected from 1 to ${MAX_INVITES} invites`)
    }

    invites = invites.map(invite => {
      if (!isEthAddress(invite)) {
        throw new Error(`invite in array is not valid: ${invite}`)
      }

      return invite.toLowerCase()
    })

    const connection = await pool.getConnection()
    try {
      const [inviterRows] = await connection.query<mysql.RowDataPacket[]>('SELECT id FROM inviter WHERE address = ?', [
        address,
      ])

      if (inviterRows.length === 0) {
        throw new Error(`Inviter does not exist with address: ${address}`)
      }

      const inviterId = inviterRows[0].id

      const [inviteRows] = await connection.query<mysql.RowDataPacket[]>('SELECT * FROM invite WHERE inviter_id = ?', [
        inviterId,
      ])

      const [accountRows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT * FROM account WHERE invite_id IN (SELECT id FROM invite WHERE inviter_id = ?)',
        [inviterId],
      )

      const resultInvites: { [key: string]: { isUsed: boolean; isAccountCreated: boolean } } = {}
      invites.forEach((invite: string) => {
        const foundInvite = inviteRows.find(row => row.invite_address === invite)

        if (foundInvite) {
          const foundAccount = accountRows.find(row => row.invite_id === foundInvite.id)
          resultInvites[invite] = {
            isUsed: foundInvite.invite_use_signature?.length > 0,
            isAccountCreated: Boolean(foundAccount),
          }
        } else {
          resultInvites[invite] = {
            isUsed: false,
            isAccountCreated: false,
          }
        }
      })
      res.json({
        status: 'ok',
        data: {
          invites: resultInvites,
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

export default router
