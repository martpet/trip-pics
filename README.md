# TripPics

## Install
`npm install -f`

## Start frontend
`npm start`

## Deploying
Git push to `main` triggers a deploy to Staging. Pushing to `prod` depoloys to Production.

----

## Setup a personal AWS environment

### Create a personal account in the AWS Organization

Ask the administrator to create a new account for you.

### Choose a personal subdomain

Should be unique among other subdomains in the app.

* Create a `.env.local` file in the repo root folder.
* Add a `PERSONAL_ENV_SUBDOMAIN` env variable.

### Bootstrap

`cd backend && npx cdk bootstrap <account id>/<region> --profile <personal-account-aws-profile>`

### Deploy

`cd backend && npx cdk deploy Personal --profile <personal-account-aws-profile>`

----

## Setup Production and Staging environments

### 1. Bootstrap
It is **recommended** to use separate AWS accounts for each environment (Production, Staging, etc). It is also possible to have all environments deployed to a single account (in which case change the .github/workflows to deploy to the same account).

For each deployment environment run (needs admin rights):

`cd backend && npx bootstrap --profile <aws-profile-for-the-account>`

### 2. Add an AWS hosted zone
* Create a hosted zone in the account of the Production environment. Name it after the app domain.
* Add the hosted zone id as `rootHostedZoneId` in `consts/app.ts`.
* TODO: health checks

#### If separate AWS accounts are used for each enviroment:

**2.1. Create a policy in the Production account:**

<details>
  <summary>Route53ChangeRootZoneRecordSets</summary>

  ```
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "route53:ChangeResourceRecordSets",
            "Resource": "arn:aws:route53:::hostedzone/####"
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

**2.2. Create a role, attach the above policy to it, add the following trust policy to the role:**

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

**2.3. ** Set the role ARN as `zoneDelegationRole` variable in `const/app.ts`

### 3. Add a domain

* Add a domain name for the hosted zone from step 2, in the account of the Production environment.
* Add the domain name as `rootDomain` in `consts/app.ts`