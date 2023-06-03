import supertest from 'supertest'
import app, { pool } from '../../../src/app'
import { Wallet } from 'ethers'
import knex from 'knex'
import knexConfig from '../../../knexfile'
import { AccountDb, expectItems, findItemById, InviteDb, InviterDb } from '../../utils/db'

const db = knex(knexConfig.development)

describe('/invite', () => {
  beforeEach(async () => {
    // Rollback the migration (if any)
    await db.migrate.rollback()

    // Run the migration
    await db.migrate.latest()
  })

  afterEach(async () => {
    // After each test, we can rollback the migration
    await db.migrate.rollback()
  })

  afterAll(async () => {
    // Close the database connection after all tests are done
    await db.destroy()
    pool.end()
  })

  it('/invite/create', async () => {
    await expectItems(db, 0, 0)

    const supertestApp = supertest(app)
    const inviter = Wallet.createRandom()
    const invites = []

    for (let i = 0; i < 100; i++) {
      const invite = Wallet.createRandom()
      invites.push({
        inviter_address: inviter.address.toLowerCase(),
        invite_address: invite.address.toLowerCase(),
        inviter_signature: await inviter.signMessage(invite.address.toLowerCase()),
        invite_signature: await invite.signMessage(inviter.address.toLowerCase()),
      })
    }

    for (let i = 0; i < 100; i++) {
      const data = invites[i]
      const response = await supertestApp.post('/v1/invite/create').send(data)
      expect(response.status).toBe(200)
    }

    await expectItems(db, 1, 100)

    const inviterData = (await findItemById(db, 'inviter', 1)) as InviterDb
    expect(inviterData.address).toEqual(inviter.address.toLowerCase())
    for (let i = 0; i < 100; i++) {
      const invite = invites[i]
      const data = (await findItemById(db, 'invite', i + 1)) as InviteDb
      expect(data.inviter_id).toEqual(1)
      expect(data.invite_address).toEqual(invite.invite_address)
      expect(data.invite_signature).toEqual(invite.invite_signature)
      expect(data.inviter_signature).toEqual(invite.inviter_signature)
    }
  })

  it('/invite/link', async () => {
    await expectItems(db, 0, 0)

    const supertestApp = supertest(app)
    const inviter = Wallet.createRandom()
    const invites = []
    const accounts = []

    for (let i = 0; i < 100; i++) {
      const invite = Wallet.createRandom()
      const account = Wallet.createRandom()
      invites.push({
        inviter_address: inviter.address.toLowerCase(),
        invite_address: invite.address.toLowerCase(),
        inviter_signature: await inviter.signMessage(invite.address.toLowerCase()),
        invite_signature: await invite.signMessage(inviter.address.toLowerCase()),
      })

      accounts.push({
        invite_address: invite.address.toLowerCase(),
        account_address: account.address.toLowerCase(),
        invite_signature: await invite.signMessage(account.address.toLowerCase()),
        account_signature: await account.signMessage(invite.address.toLowerCase()),
      })
    }

    for (let i = 0; i < invites.length; i++) {
      const invite = invites[i]
      const response = await supertestApp.post('/v1/invite/create').send(invite)
      expect(response.status).toBe(200)
    }

    await expectItems(db, 1, 100, 0)

    for (let i = 0; i < 100; i++) {
      const account = accounts[i]
      const response = await supertestApp.post('/v1/invite/link').send(account)
      expect(response.status).toBe(200)
    }

    await expectItems(db, 1, 100, 100)

    for (let i = 0; i < 100; i++) {
      const dbId = i + 1
      const account = accounts[i]
      const data = (await findItemById(db, 'account', dbId)) as AccountDb

      expect(data.invite_id).toEqual(dbId)
      expect(data.invite_signature).toEqual(account.invite_signature)
      expect(data.account_address).toEqual(account.account_address)
      expect(data.account_signature).toEqual(account.account_signature)
    }
  })
})
