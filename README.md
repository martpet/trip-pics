# TripPics

## Setup Production and Staging environments
### Bootstrap CDK
It is **recommended** to use separate AWS accounts for each environment (Production, Staging, etc). It is also possible to have all environments deployed to a single account (you must edit the GitHub workflows to deploy to the same account).

For each deployment environment run:

`cd backend && npx bootstrap --profile <aws-profile-for-the-account>`

The profile should have admin access.

### Add an AWS hosted zone
In the account of the Production environment:
* Create a hosted zone for the app domain name.

(optional) If multiple separate AWS accounts are used for the enviroments:
* Create a role in Production account, which can be asumed by the other accounts:

## (optional) Setup a personal environment
### Bootstrap CDK
`cd backend && npx bootstrap --profile <aws-profile-for-your-account>`

### Deploying to the personal environment
`cd backend && npx cdk deploy personal --profile your-aws-profile`

## Install npm dependencies
`npm install --force`

## Start frontend server
`npm start`
