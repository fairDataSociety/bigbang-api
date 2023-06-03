# Big Bang API

Create `bigbang` db:
  
`mysql -u root -p < ./migrations/db.sql`

Start interactive mode for MySQL user creation:

`mysql -u root`

and run commands:

`CREATE USER 'bigbanguser'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';`

`GRANT ALL PRIVILEGES ON bigbang.* TO 'bigbanguser'@'localhost';`

`FLUSH PRIVILEGES;`

Put these credentials to `.env` file.

Run migrations:

`npx knex migrate:latest --env production`