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

`npm run bootstrap -- --profile my-aws-profile` 
### Deploy changes
(Admin permissions NOT required)

`npm run deploy -- --profile my-aws-profile`
### Change frontend env vars
TODO