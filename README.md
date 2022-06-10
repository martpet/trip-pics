# <Project name>
## Setup project
`npm install`
## Run frontend
`npm start`
## Preview backend changes locally
### Bootstrap your AWS account
**Skip this step if** the AWS account region already contains a stack `CDKToolkit`.
In `backend` dir run: `npx cdk bootstrap --profile my-aws-profile` (Admin permissions required)
### Deploy changes
In `backend` dir run: `npx cdk deploy dev --profile my-aws-profile` (Admin permissions NOT required)
### Change frontend env vars
TODO