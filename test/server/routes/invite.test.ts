import supertest from 'supertest'
import app from '../../../src/app'
import { Wallet } from 'ethers'

describe('/invite', () => {
  it('/invite/create', async () => {
    const inviter = Wallet.createRandom()
    const invite = Wallet.createRandom()
    const data = {
      inviter_address: inviter.address,
      invite_address: invite.address,
      inviter_signature: await inviter.signMessage(invite.address.toLowerCase()),
      invite_signature: await invite.signMessage(inviter.address.toLowerCase()),
    }
    const response = await supertest(app).post('/v1/invite/create').send(data)
    expect(response.status).toBe(200)
  })
})
