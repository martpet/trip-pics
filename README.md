# TripPics

## Install
`npm install -f`

## Start frontend
`npm start`

----

## Personal dev environment

### Create a personal dev account in AWS Organizations

Ask the administrator to create a new account for you in the *Dev* unit.

### Choose a name for the personal subdomain

It should be like `**name**.dev.xyz.com`

* Create a *.env.local* file in the repo root folder.
* Write the choosen name as an env variable *PERSONAL_SUBDOMAIN* in *.env.local*.

### Bootstrap

`cd backend && npx cdk bootstrap <account id>/<region> --profile <personal-account-aws-profile>`

### Deploy

`npm run deploy -- --profile <personal-account-aws-profile> --require-approval never`

----

## `Prod` and `Staging` AWS environments

### 1. Create AWS Organizations units and accounts.
* Create *Dev* and *NonDev* units.
* Create *Production* and `Staging` accounts under *Dev* unit.

### 2. Bootstrap
It is **recommended** to use separate AWS accounts for each environment (Production, Staging, etc). It is also possible to have all environments deployed to a single account (in which case change the .github/workflows to deploy to the same account).

For each deployment environment run (with admin permissions):

`cd backend && npx bootstrap --profile <aws-profile-for-the-account>`

### 3. Add AWS hosted zones

In the *Production* account:

* Create the root hosted zone. Name: *somedomain.com*.
* Create the dev hosted zone. Name: *dev.somedomain.com*.
* Write the root hosted zone id to a variable *rootHostedZoneId* in *consts/appConsts.ts*.
* Write the dev hosted zone id as variable *devHostedZoneId* in *consts/appConsts.ts*.

### 4. Add a domain

In the *Production* account:

* Add a domain in Route53.
* Copy the domain NS records to the root hosted zone.
* Write the domain name as a variable *rootDomain* in *consts/appConsts.ts*

### 5. Create policies for editing hosted zones

In the *Production* account *add 2 policies* named:

* *ChangeRootHostedZoneRecordSets*
* *ChangeDevHostedZoneRecordSets*

<details>
  <summary>Policy content</summary>

  ```
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "route53:ChangeResourceRecordSets",
            "Resource": "arn:aws:route53:::hostedzone/<id-of-Root-or-Dev-hosted-zone>"
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

### 6. Create roles for hosted zones policies

In the Production account **add 2 roles** named:

* CrossAccountRootHostedZone
* CrossAccountDevHostedZone

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
                "ForAnyValue:StringLike": {
                    "aws:PrincipalOrgPaths": "<organizations-path-to-unit-dev-or-nondev>/*"
                }
            }
        }
    ]
}
  ```
</details>

Write the ARN of the 2 roles to *crossAccountDevHostedZoneRole* and *crossAccountRootHostedZoneRole* in *consts/appConsts.ts*.

The value for *PrincipalOrgPaths* should be similar to:  `o-dqkaknenun/r-weph/ou-weph-n389l0xd/ou-weph-kvrx3xqm/*`, where
*o-dqkaknenun* is the organization id, *r-weph* is the root id, and *ou-weph-kvrx3xqm* is the id of the Dev or NonDev units.