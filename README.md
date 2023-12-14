# Big Bang API

API for storing information about inviters, invites created by them, new accounts created with the help of these invites. With the help of the final database, we can determine the leaders by the number of invitations and the number of invites turned into FDS accounts.

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

---

### 5. POST `/v1/invite/inviter/:address`

This API is used to get information about the invites related to the inviter at a particular Ethereum address.

#### Parameters

The request to this API should include the Ethereum address of the inviter in the URL as a path parameter and a JSON object in the body, containing an array of invites to be checked.

- **address**: The Ethereum address of the inviter (Path Parameter)
- **invites**: An array of Ethereum addresses representing the invites (JSON Body)

The array of invites must have a length between 1 and 50, both inclusive.

Example request:

```json
{
  "invites": ["0x...", "0x...", ...]
}
```

#### Response

The API will return a JSON object with the status of each invite provided in the request. The response object will have the following properties:

- **isUsed**: A boolean indicating whether the invite has been used or not.
- **isAccountCreated**: A boolean indicating whether an account has been created for the invite or not.

Example response:

```json
{
  "status": "ok",
  "data": {
    "invites": {
      "0x...": {
        "isUsed": false,
        "isAccountCreated": true
      },
      "0x...": {
        "isUsed": true,
        "isAccountCreated": false
      },
      ...
    }
  }
}
```

#### Errors

The API may return an error if the "address" or "invites" provided are not valid Ethereum addresses or if the length of "invites" is not within the valid range.

Example error response:

```json
{
  "status": "error",
  "message": "\"invites\" length is not valid. Expected from 1 to 50 invites"
}
```

## Installation

1 - Install dependencies (Node.js >=16):

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
