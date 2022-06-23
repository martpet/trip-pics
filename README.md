# TripPics

## Install
`npm install -f`

## Start frontend
`npm start`

----

## Setup a personal deployment environment

### Bootstrap

`cd backend && npx bootstrap --profile <aws-profile>`

### Deploy

`cd backend && npx cdk deploy personal --profile <aws-profile>`

## Setup Production and Staging environments

### 1. Bootstrap
It is **recommended** to use separate AWS accounts for each environment (Production, Staging, etc). It is also possible to have all environments deployed to a single account (in which case change the .github/workflows to deploy to the same account).

For each deployment environment run (needs admin rights):

`cd backend && npx bootstrap --profile <aws-profile-for-the-account>`

### 2. Add an AWS hosted zone
Create a hosted zone for the the app domain in the account of the Production environment.

#### If separate AWS accounts are used for each enviroment:

##### 1. Create a policy in the Production account:

<details>
  <summary>Route53ChangeRootZoneRecordSets</summary>

  ```
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "route53:ChangeResourceRecordSets",
            "Resource": "arn:aws:route53:::hostedzone/Z025668263BPB5OKFH9E"
        },
        {
            "Effect": "Allow",
            "Action": "route53:ListHostedZonesByName",
            "Resource": "*"
        }
    ]
  }
  ```
</details>

##### 2. Create a role, attach the above policy to it, and add the following trust policy to the role:

<details>
  <summary>Trust policy</summary>

  ```
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "aws:PrincipalOrgID": "o-#####"
                }
            }
        }
    ]
  }
  ```
</details>

##### 3. Pass the role ARN from *AppStack*.ts to the *HostedZones* struct.
