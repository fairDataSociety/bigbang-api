import supertest from 'supertest'
import app, { pool } from '../../../src/app'
import { Wallet } from 'ethers'
import knex from 'knex'
import knexConfig from '../../../knexfile'
import {
  AccountDb,
  expectItems,
  findItemById,
  InfoResponse,
  InviteDb,
  InviterDb,
  InviterResponse,
} from '../../utils/db'
import { LOGIN_MESSAGE_TO_SIGN } from '../../../src/utils/signature'

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

  it('/info', async () => {
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

    await expectItems(db, 1, 100, 0)

    const response = await supertestApp.get('/v1/invite/info')
    expect(response.status).toBe(200)
    const data = response.body as InfoResponse
    expect(Object.keys(data.data)).toHaveLength(3)
    expect(data.data.inviters).toEqual(1)
    expect(data.data.invites).toEqual(100)
    expect(data.data.accounts).toEqual(0)
  })

  it('/inviter/:address', async () => {
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

    for (let i = 0; i < 100; i++) {
      const data = invites[i]
      const response = await supertestApp.post('/v1/invite/create').send(data)
      expect(response.status).toBe(200)
    }

    await expectItems(db, 1, 100, 0)

    const response = await supertestApp.get(`/v1/invite/inviter/${inviter.address.toLowerCase()}`)
    const data = response.body as InviterResponse
    expect(response.status).toBe(200)
    expect(data.data.invites).toBe(100)
    expect(data.data.accounts).toBe(0)

    for (let i = 0; i < 100; i++) {
      const account = accounts[i]
      const response = await supertestApp.post('/v1/invite/link').send(account)
      expect(response.status).toBe(200)

      const accountsCount = i + 1
      await expectItems(db, 1, 100, accountsCount)
      const response1 = await supertestApp.get(`/v1/invite/inviter/${inviter.address.toLowerCase()}`)
      const data1 = response1.body as InviterResponse
      expect(response1.status).toBe(200)
      expect(Object.keys(data1.data)).toHaveLength(2)
      expect(data1.data.invites).toBe(100)
      expect(data1.data.accounts).toBe(accountsCount)
    }
  })

  it('/inviter/:address - get invites info', async () => {
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
        login_signature: await invite.signMessage(LOGIN_MESSAGE_TO_SIGN),
        invite_signature: await invite.signMessage(inviter.address.toLowerCase()),
      })

      accounts.push({
        invite_address: invite.address.toLowerCase(),
        account_address: account.address.toLowerCase(),
        invite_signature: await invite.signMessage(account.address.toLowerCase()),
        account_signature: await account.signMessage(invite.address.toLowerCase()),
      })
    }

    const invitesAddressesAll = invites.map(invite => invite.invite_address)
    const getInvitesInfo = async () => {
      const requestInvites = 50
      const invitesResponseCorrect = await supertestApp
        .post(`/v1/invite/inviter/${inviter.address.toLowerCase()}`)
        .send({
          invites: invitesAddressesAll.slice(0, requestInvites),
        })
      expect(invitesResponseCorrect.status).toBe(200)
      const correctInvites = invitesResponseCorrect.body.data.invites
      expect(Object.keys(correctInvites)).toHaveLength(requestInvites)

      return {
        invites: correctInvites,
        keys: Object.keys(correctInvites),
      }
    }

    for (let i = 0; i < 100; i++) {
      const data = invites[i]
      const response = await supertestApp.post('/v1/invite/create').send(data)
      expect(response.status).toBe(200)
    }

    await expectItems(db, 1, 100, 0)

    const response = await supertestApp.get(`/v1/invite/inviter/${inviter.address.toLowerCase()}`)
    const data = response.body as InviterResponse
    expect(response.status).toBe(200)
    expect(data.data.invites).toBe(100)
    expect(data.data.accounts).toBe(0)

    const invitesResponse = await supertestApp.post(`/v1/invite/inviter/${inviter.address.toLowerCase()}`).send({
      invites: invitesAddressesAll,
    })
    expect(invitesResponse.status).toBe(500)
    expect(invitesResponse.body).toEqual({
      status: 'error',
      message: '"invites" length is not valid. Expected from 1 to 50 invites',
    })

    const invitesInfo1 = await getInvitesInfo()
    invitesInfo1.keys.forEach((key: string) => {
      expect(invitesInfo1.invites[key]).toEqual({
        isUsed: false,
        isAccountCreated: false,
        isExists: true,
      })
    })

    const activateInviteCount = 5
    for (let i = 0; i < activateInviteCount; i++) {
      const data = invites[i]
      expect(data).toBeDefined()
      const response = await supertestApp.post(`/v1/invite/login`).send({
        invite_address: data.invite_address,
        invite_signature: data.login_signature,
      })
      expect(response.status).toBe(200)
    }

    const invitesInfo2 = await getInvitesInfo()
    invitesInfo2.keys.forEach((key: string, index: number) => {
      expect(invitesInfo2.invites[key]).toEqual({
        isUsed: index < activateInviteCount,
        isAccountCreated: false,
        isExists: true,
      })
    })

    for (let i = 0; i < activateInviteCount; i++) {
      const account = accounts[i]
      const response = await supertestApp.post('/v1/invite/link').send(account)
      expect(response.status).toBe(200)
    }

    const invitesInfo3 = await getInvitesInfo()
    invitesInfo3.keys.forEach((key: string, index: number) => {
      expect(invitesInfo3.invites[key]).toEqual({
        isUsed: index < activateInviteCount,
        isAccountCreated: index < activateInviteCount,
        isExists: true,
      })
    })
  })
})
