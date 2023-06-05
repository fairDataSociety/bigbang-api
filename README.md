# Big Bang API

## API Endpoints

Example of sending POST request with `fetch`.

```js
const data = {
  inviter_address: '0x4ea09ea012ed94fdc2d87f39f007218ab9fed75c',
  invite_address: '0xdd7b8ee07152d7b14ad35ba8eca5ee5490437869',
  inviter_signature: '0x6770d398d5e87d0b96f46fb51770fb92b00da9999bd5acf7bf8acfa34598fce04f9b55d2a850d3efe8ec975ffc4e730004f3175ffdb904b7270ff371542f642a1c',
  invite_signature: '0xf8919d14add60615f8a5929533a7591625b191f652732d475b49bb3ffde47f9a22374e696018e64e2eed024f220c1688dccbc14c9066edd8d1f4c5669674408e1b'
}

fetch('http://localhost:3333/v1/invite/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
```

### 1. POST `/v1/invite/create`

This API is used to create a record about the inviter and his invite. Using this method, information about the inviter who created the first invitation is inserted into the database.

#### Request Body

```json
{
    "inviter_address": "<Ethereum address of the inviter>",
    "invite_address": "<Ethereum address of the invitee>",
    "invite_signature": "<Signature of the invitee>",
    "inviter_signature": "<Signature of the inviter>"
}
```

#### Response

The API will return a JSON object indicating the result of the operation.

Example response:

```json
{
    "status": "ok"
}
```

---

### 2. POST `/v1/invite/link`

This API is used to link an invite to newly created account using this invite.

#### Request Body

```json
{
    "invite_address": "<Ethereum address of the invitee>",
    "account_address": "<Ethereum address of the account>",
    "invite_signature": "<Signature of the invitee>",
    "account_signature": "<Signature of the account>"
}
```

#### Response

The API will return a JSON object indicating the result of the operation.

Example response:

```json
{
    "status": "ok"
}
```

---

### 3. GET `/v1/invite/inviter/:address`

This API is used to get the count of invites and created accounts for a particular inviter.

#### URL Parameters

`address`: Ethereum address of the inviter

#### Response

The API will return a JSON object with the count of invites and created accounts for the inviter.

Example response:

```json
{
    "status": "ok",
    "data": {
        "invites": 10,
        "accounts": 5
    }
}
```

---

### 4. GET `/v1/invite/info`

This API is used to get general information about the system including the total number of invites, accounts, and inviters.

#### Response

The API will return a JSON object with the information about the system.

Example response:

```json
{
    "status": "ok",
        "data": {
            "invites": 100,
            "accounts": 50,
            "inviters": 30
        }
}
```

## Installation

1 - Install dependencies (Node.js 16):

`npm ci`

2 - Install MySQL.

3 - Create `bigbang` db:
  
`mysql -u root -p < ./migrations/db.sql`

4 - Start interactive mode for MySQL user creation:

`mysql -u root`

and run commands:

`CREATE USER 'bigbanguser'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';`

`GRANT ALL PRIVILEGES ON bigbang.* TO 'bigbanguser'@'localhost';`

`FLUSH PRIVILEGES;`

5 - Put these credentials to `.env` file.

6 - Run migrations:

`npx knex migrate:latest --env production`

7 - Start server using pm2:

`npm run start`
