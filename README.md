# TripPics
## Setup
`npm install --force`

(Temporarily use --force)
## Run frontend
`npm start`
## Preview backend changes
### Bootstrap your dev AWS environment
**Skip this step if** the AWS account/region already contains a stack named *CDKToolkit*.

(Admin permissions required)

`cd backend && npx cdk bootstrap --profile your-aws-profile` 
### Deploy changes
(Admin permissions NOT required)

`cd backend && npx cdk deploy DevelopmentApp --profile your-aws-profile`
### Change frontend env vars
TODO