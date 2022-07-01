# TripPics

## Install
`npm install`

## Start frontend
`npm start`

----


## Personal AWS environment

### Permissions

Eather ask the administrator to create a new account for you in the *Dev* AWS Organizations unit, or to give permissions to your own AWS account.

### Choose a subdomain name

The full domain will look like *__john__.dev.domain.com*

* Create a `.env.local` file in the repo root folder.
* Copy the choosen name (*john*) to an env variable `PERSONAL_SUBDOMAIN` in *.env.local*.

### Bootstrap the AWS account

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Deploy

`npm run deploy -- --profile aws-rofile-name --require-approval never`

----

## *Production*, *Staging* and *HostedZones* AWS environments

### Setup AWS Organizations
* Create `Dev` and `NonDev` units.
* Create `Production` and `Staging` accounts in the *Dev* unit.
* Create a `HostedZones` account in the *Root* unit.

### Bootstrap

For Production and Staging environments run:

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Setup hosted zones

#### Create the hosted zones

In the *Production* account:
* Create the *root* public hosted with name `yourdomain.com`.
* Copy the *root* hosted zone id to a variable named `rootHostedZoneId` in *backend/consts/appConsts.ts*.

In the *Staging* account:
* Create the *test* public hosted zone with name `test.yourdomain.com`.
* Copy the *test* hosted zone id to a variable named `stagingHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the *test* zone into the *Production* account *root* zone.

In the *HostedZones* account:
* Create the *dev* public hosted zone with name `dev.yourdomain.com`.
* Copy the *dev* hosted zone id to a variable named `devHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the *dev* zone into the *Production* account *root* zone.

#### Create a policy

In the *HostedZones* account create a policy named `DevHostedZoneChangeRecords`.

<details>
    <summary>Policy content</summary>

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "route53:ChangeResourceRecordSets",
                "Resource": "arn:aws:route53:::hostedzone/dev-hosted-zone-id"
            },
            {
                "Effect": "Allow",
                "Action": "route53:ListHostedZonesByName",
                "Resource": "*"
            }
        ]
    }
</details>

#### Create a role

In the *HostedZones* account create a role named `DevCrossAccountZoneDelegation`.

Add a custom trust policy:

<details>
    <summary>Custom trust policy</summary>

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
                        "aws:PrincipalOrgPaths": "aws-organizations-path-to-dev-unit/*"
                    }
                }
            }
        ]
    }
</details>

(*PrincipalOrgPaths* is something like `o-dqkaknenun/r-weph/ou-weph-n389l0xd`)

Choose *DevHostedZoneChangeRecords* from the *Permissions policies* list.

Copy the ARN of *DevCrossAccountZoneDelegation* role to a variable named `devCrossAccountZoneDelegationRoleArn` in *backend/consts/appConsts.ts*.

#### Register a domain

In the *HostedZones* account:

* Register a domain in Route53.
* Use the name servers from the *root* zone NS record.
* Copy the domain name to a variable named `rootDomain` in *backend/consts/appConsts.ts*

### Creating personal accounts for developers

Developers need permissions to assume the *CrossAccountDevHostedZone* role.

There are two options:

* Create a personal account in the *Dev* unit of AWS Organizations.
* Add permissions for an external account in the *CrossAccountDevHostedZone* **trust policy**.

<details>
    <summary>Permissions for an external account in CrossAccountDevHostedZone trust policy</summary>

     {
        "Effect": "Allow",
        "Principal": {
            "AWS": "external-account-id"
        },
        "Action": "sts:AssumeRole"
    }
</details>