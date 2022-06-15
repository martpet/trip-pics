# TripPics
## Setup
`npm install -f`
## Run frontend
`npm start`
## Preview backend changes
### Bootstrap your dev AWS environment
**Skip this step if** the AWS account/region already contains a stack named `CDKToolkit`.
(Admin permissions required)
In `backend/`: `npx cdk bootstrap --profile my-aws-profile` 
### Deploy changes
(Admin permissions NOT required)
In `backend/`: `npx cdk deploy dev --profile my-aws-profile`
### Change frontend env vars
TODO