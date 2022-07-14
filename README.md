# TripPics

This is a playground for learning AWS CDK.

(work in progress)

## Setup development environment

Ask the administrator to create a personal AWS account for you, or provide him with the ID of an existing AWS account.

### Bootstrap your AWS account for CDK

`npx cdk bootstrap --profile your-aws-profile`

### Choose a subdomain for your personal dev environment

The full domain will look like *__chosen-name__.dev.domain.com*

* Create a `.env.local` file in the repo root folder.
* In *.env.local* put the choosen name to an env variable named `PERSONAL_SUBDOMAIN`.

### Install dependencies

`npm install`

### Deploy to your personal account

`npm run deploy -- --profile your-aws-profile`

### Start the frontend server

`npm start`

----

Check also: [Setup Production, Staging and DevService accounts](README-setup-envs.md)

