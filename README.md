# Big Bang API

1 - Install dependencies:

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
