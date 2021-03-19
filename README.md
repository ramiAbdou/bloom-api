# Bloom Core API

Includes a mixture of OOP, functional practices and event-driven architecture.

Core Tools and Technologies

- Node
- Typescript
- Express
- GraphQL

## Setting Up PostgreSQL on MacOS

To get PostgreSQL up and running on your local computer, you'll need to do the following steps:

1. Install PostgreSQL 12 to your Mac.
2. Create a test PostgreSQL database.
3. Install and set up Azure Data Studio.
4. Initialize your PostgreSQL schema and tables.

### Step 1: Installing PostgreSQL 12

If you don't have Homebrew installed, download Homebrew by running:

- `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

Open up your terminal and running the following commands:

- `brew update`
- `brew install postgresql@12`

Double check that your PostgreSQL version is 12.

- `postgres --version`

### Step 2: Create Test PostgreSQL Database

In your terminal, run:

- `createdb defaultdb` - Using the name defaultdb will help to create consistency for your developer onboarding experience.

To double check that the DB was created okay, list all of your database by running:

- `psql -l`

Then, you can actually connect to your DB by running:

- `psql defaultdb`

You should now be in a database session where you can actually run SQL commands. The next step is to create your own PostgreSQL username and password so you can connect to the DB elsewhere. In the SQL terminal, run the following:

- `CREATE USER [your username] WITH SUPERUSER PASSWORD [your password]`

Now that you have a user name and password to access your DB with, be sure to update that in your `.env.dev` file by setting:

- DB_USER="`your username`"
- DB_PASSWORD="`your password`"

### Step 3: Set Up Azure Data Studio

You can download Azure Data Studio here: https://docs.microsoft.com/en-us/sql/azure-data-studio/download-azure-data-studio?view=sql-server-ver15.

You will need to download the PostgreSQL extension for Azure Data Studio, which you can follow here: https://docs.microsoft.com/en-us/sql/azure-data-studio/extensions/postgres-extension?view=sql-server-ver15.

Once you're in, you can create a connection to your PostgreSQL database by setting the following connection details:

- Connection Type: `PostgreSQL`
- Server Name: `localhost`
- Authentication Type: `password`
- User Name: `your username`
- Password: `your password`
- Database Name: `defaultdb`
- Name (optional): `Bloom Dev DB`

You should see a live connection with the database on the left panel! 🤪

### Step 4: Initialize Your Tables

Now, it's time to get some tables into the database. We can get a "dump" of SQL code that will help us initialize our tables based on our entity definitions. Then, we'll take that "SQL code dump" and run it in a SQL query using the Azure Data Studio interface. To get this "SQL dump", run:

- `npm run dump:dev`

Go ahead an copy all of the SQL code that was dumped.

Now, go into Azure Data Studio, and right click on the `defaultdb` and click `New Query`.

- `Expand Bloom Dev DB` -> `Databases` -> `defaultdb` -> `New Query`

Paste the SQL code into the query and run it. If you refresh the `defaultdb`, you should now have some tables in your database. YAAAAYYYYY 🎉
