# TripPics

To start developing you need a personal AWS account.

## Development setup

Ask the administrator for an AWS account.

### Bootstrap your AWS account for CDK

If not previously done.

`npx cdk bootstrap --profile your-aws-profile`

### Choose a subdomain for your dev environment

The full domain will look like *__someName__.dev.domain.com*

* Create a `.env.local` file in the repo root folder.
* In *.env.local* write the choosen name (*someName*) to an env variable `PERSONAL_SUBDOMAIN`.

### Install dependencies

`npm install`

### Deploy to your account

`npm run deploy -- --profile your-aws-profile`

### Start frontend server

`npm start`

----

## *Production*, *Staging* and *DevSevice* accounts

### Setup AWS Organizations
* Create `Production`, `Staging` and `DevService` accounts.
* Create `Dev` unit.

### Bootstrap

For *Production* and *Staging* environments run:

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Setup hosted zones

#### Create the hosted zones

In the *Production* account:
* Create the *root* public hosted zone with name `yourdomain.com`.
* Copy the *root* hosted zone id to a variable named `rootHostedZoneId` in *backend/consts/appConsts.ts*.

In the *Staging* account:
* Create the *test* public hosted zone with name `test.yourdomain.com`.
* Copy the *test* hosted zone id to a variable named `stagingHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the *test* zone into the *Production* account *root* zone.

In the *DevService* account:
* Create the *dev* public hosted zone with name `dev.yourdomain.com`.
* Copy the *dev* hosted zone id to a variable named `devHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the *dev* zone into the *Production* account *root* zone.

#### Create a policy

In the *DevService* account create a policy named `HostedZoneChangeRecords`.

<details>
    <summary>Policy content</summary>

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "route53:ChangeResourceRecordSets",
                "Resource": "arn:aws:route53:::hostedzone/DEV_HOSTED_ZONE_ID"
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

In the *DevService* account create a role named `ZoneDelegation`.

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
                        "aws:PrincipalOrgPaths": "ORGANIZATIONS_PATH_TO_DEV_UNIT/*"
                    }
                }
            }
        ]
    }
</details>

(*PrincipalOrgPaths* is something like `o-dqkaknenun/r-weph/ou-weph-n389l0xd`)

Choose *HostedZoneChangeRecords* from the *Permissions policies* list.

Copy the ARN of *ZoneDelegation* role to a variable named `devHostedZoneDelegationRoleArn` in *backend/consts/appConsts.ts*.

#### Register a domain

In the *HostedZones* account:

* Register a domain in Route53.
* Use the name servers from the *root* zone NS record.
* Copy the domain name to a variable named `rootDomain` in *backend/consts/appConsts.ts*

### Creating personal accounts for developers

Developers need permissions to assume the *ZoneDelegation* role in the *DevService* account.

There are two options:

* Create new personal accounts for developers in the *Dev* unit.
* Add permissions for existing accounts to the the *ZoneDelegation* role's **trust policy**.

<details>
    <summary>Permissions for an existing account in ZoneDelegation trust policy</summary>

     {
        "Effect": "Allow",
        "Principal": {
            "AWS": "ACCOUNT_ID"
        },
        "Action": "sts:AssumeRole"
    }
</details>