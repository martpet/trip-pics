# TripPics

## Install
`npm install -f`

## Start frontend
`npm start`

----

## Personal Dev AWS environment

### Create a personal *Dev* account in AWS Organizations

Ask the administrator to create a new account for you in the *Dev* unit.

### Choose a personal subdomain name

The domain will be like *john*.dev.domain.com

* Create a *.env.local* file in the repo root folder.
* Write the choosen name (*john*) as an env variable *PERSONAL_SUBDOMAIN* in *.env.local*.

### Bootstrap

Admin rights required.

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Deploy

Admin rights **not** required.

`npm run deploy -- --profile aws-rofile-name --require-approval never`

----

## Prod and Staging AWS environments

### Create AWS Organizations units and accounts.
* Create *Dev* and *NonDev* units.
* Create *Production* and `Staging` accounts under *Dev* unit.

### Bootstrap
It is **recommended** to use separate AWS accounts for each environment (Production, Staging, Dev). It is also possible to have all environments deployed to a single account (in which case change the .github/workflows to deploy to a single environment).

For each environment run (with admin rights):

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Add AWS hosted zones

In the *Production* account:

* Create the *root* hosted with a name `somedomain.com`.
* Write the *root* hosted zone id to a variable `rootHostedZoneId` in *consts/appConsts.ts*.
* Create the *dev* hosted zone with a name `dev.somedomain.com`.
* Write the *dev* hosted zone id to a variable `devHostedZoneId` in *consts/appConsts.ts*.

### Add a domain

In the *Production* account:

* Add a domain in Route53.
* Copy the domain NS records to the root hosted zone.
* Write the domain name as a variable `rootDomain` in *consts/appConsts.ts*

### Create policies for editing hosted zones

In the *Production* account add 2 policies named:

* `ChangeRootHostedZoneRecordSets`
* `ChangeDevHostedZoneRecordSets`

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

### Create roles for the policies

In the Production account add 2 roles named:

* `CrossAccountRootHostedZone`
* `CrossAccountDevHostedZone`

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
*o-dqkaknenun* is the organization id, *r-weph* is the root id, and *ou-weph-kvrx3xqm* is the id of the `Dev` or `NonDev` units.