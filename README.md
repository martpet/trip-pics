# TripPics

## Install
`npm install -f`

## Start frontend
`npm start`

----

## Personal *Dev* AWS environment

There are two options:

Ask the administrator to create a new account for you under the *Dev* AWS Organizations unit.

Or ask the administrator to give permissions to an account of your choice.

### Choose a personal subdomain name

The domain will be like *john*.dev.domain.com

* Create a `.env.local` file in the repo root folder.
* Write the choosen name (*john*) as an env variable `PERSONAL_SUBDOMAIN` in *.env.local*.

### Bootstrap

Admin rights required.

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Deploy

Admin rights **not** required.

`npm run deploy -- --profile aws-rofile-name --require-approval never`

----

## *Prod* and *Staging* AWS environments

### Setup AWS Organizations
* Create `Dev` and `NonDev` units.
* Create `Production` and `Staging` accounts under the *Dev* unit.

### Bootstrap
It is recommended to use separate AWS accounts for each environment (Production, Staging, Dev). It is also possible, but not recommended, to have all environments deployed to a single account, in which case you should adapt the workflows in *backend/.github*.

For each environment, using admin rights, run:

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Add AWS hosted zones

In the *Production* account:

* Create the *root* hosted with name `yourdomain.com`.
* Copy the *root* hosted zone id to a variable named `rootHostedZoneId` in *backend/consts/appConsts.ts*.
* Create the *dev* hosted zone with name `dev.yourdmain.com`.
* Copy the *dev* hosted zone id to a variable named `devHostedZoneId` in *backend/consts/appConsts.ts*.

### Add a domain

In the *Production* account:

* Add a domain to Route53.
* Put the provided DNS records to a single NS record in the `Root` hosted zone.
* Copy the domain name to a variable named `rootDomain` in *backend/consts/appConsts.ts*

### Create policies for the hosted zones

In the *Production* account add 2 policies with names:

* `ChangeRootHostedZoneRecordSets`
* `ChangeDevHostedZoneRecordSets`

<details>
    <summary>Policy content</summary>

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
</details>

### Create roles for the hosted zones policies

In the Production account add 2 roles with names:

* `CrossAccountRootHostedZone`
* `CrossAccountDevHostedZone`

Add a Trust relationship policy the the role:

<details>
    <summary>Trust relationship policy content</summary>

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
                        "aws:PrincipalOrgPaths": "<organizations-path-to-Dev-or-NonDev-unit>/*"
                    }
                }
            }
        ]
    }
</details>

Add the corresponding policy to each role.

Copy the ARNs of the 2 roles to variables named `crossAccountDevHostedZoneRole` and `crossAccountRootHostedZoneRole` in *backend/consts/appConsts.ts*.

### Creating *Dev* accounts

Developers need permissions to assume the *CrossAccountDevHostedZone* role.

There are two options:

* Create a personal account in the *Dev* unit of AWS Organizations.
* Use an external account. Allow the external account to assume role *CrossAccountDevHostedZone*.

<details>
    <summary>Permissions for an external account in CrossAccountDevHostedZone trust policy</summary>

     {
        "Effect": "Allow",
        "Principal": {
            "AWS": "external-account-id"
        },
        "Action": "sts:AssumeRole"
    }
<details>