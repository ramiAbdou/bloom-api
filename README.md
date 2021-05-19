# Bloom (Backend)

Open-sourced backend powering the Bloom application. Controls all database operations, routing (w/ Express), integrations with 3rd-party services (Stripe, Mailchimp, etc) and internal jobs (emails, CRON jobs, etc).

Core Tools and Technologies
- Node.js
- Typescript
- GraphQL
- PostgreSQL

Other Key Libraries Used
- [MikroORM](https://mikro-orm.io/) - Object relational mapper, abstracts any SQL code into Typescript.

## Folder Structure

- `migrations/*` - Incremental database migrations stored as files. Compiles down to SQL scripts.
- `src/core/*` - Core functionality for fetching/updating database. Also handles all in-memory cache operations.
- `src/entities/*` - Contains all entity definitions (maps to SQL tables), CRUD operations, and pre/post-event listeners.
- `src/integrations/*` - All 3rd-party integrations (Google, Mailchimp, Stripe) including authentication and webhooks.
- `src/loaders/*` - Logic for booting up the application (ie: connecting to the database, starting the server, etc).
- `src/system/*` - Handles all internal events including sending emails and triggering CRON jobs.
- `src/util/*` - Utility functions and constants used throughout the application.

## Installation

To run this application, you need to have [Node.js](https://nodejs.org/en/download), [Typescript](https://www.typescriptlang.org), and [PostgreSQL 12](https://www.postgresql.org/download) installed on your machine. We also recommend that you install [Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/download-azure-data-studio?view=sql-server-ver15) to play around with any SQL scripts/data.

## Project Status

This project originated through a startup called [Bloom](http://onbloom.co/) back in 2020, but unfortunately the company has been shut down. Although there could be some development being continued, it is solely for the purpose of having fun.
