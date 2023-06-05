import { Knex } from 'knex'

export interface InviterDb {
  id: number
  address: string
  created_at: string
  updated_at: string
}

export interface InviteDb {
  id: number
  inviter_id: number
  invite_address: string
  inviter_signature: string
  invite_signature: string
  created_at: string
  updated_at: string
}

export interface AccountDb {
  id: number
  invite_id: number
  account_address: string
  invite_signature: string
  account_signature: string
  created_at: string
  updated_at: string
}

export interface InfoResponse extends ApiResponse {
  data: {
    invites: number
    accounts: number
    inviters: number
  }
}

export interface InviterResponse extends ApiResponse {
  data: {
    invites: number
    accounts: number
  }
}

export interface ApiResponse {
  result: string
}

export async function expectItems(db: Knex, inviter: number, invite = 0, account = 0): Promise<void> {
  const inviterData = await db('inviter').count('* as count')
  expect(inviterData[0].count).toEqual(inviter)
  const inviteData = await db('invite').count('* as count')
  expect(inviteData[0].count).toEqual(invite)
  const accountData = await db('account').count('* as count')
  expect(accountData[0].count).toEqual(account)
}

export async function findItemById(db: Knex, table: string, id: number): Promise<unknown> {
  return db(table).select('*').where('id', id).first()
}
