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

### Bootstrap the AWS account

AWS admin rights required.

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Deploy

AWS admin rights **not** required.

`npm run deploy -- --profile aws-rofile-name --require-approval never`

----

## *Prod*, *Staging* and *HostedZones* AWS environments

### Setup AWS Organizations
* Create `Dev` and `NonDev` units.
* Create `Production` and `Staging` accounts under the *Dev* unit.
* Create a `HostedZones` account in the root unit.

### Bootstrap
It is recommended to use separate AWS accounts for each environment (Production, Staging, Dev). It is also possible, but not recommended, to have all environments deployed to a single account, in which case you should adapt the workflows in *backend/.github*.

For *Prod* and *Staging* environment run with AWS admin rights:

`cd backend && npx cdk bootstrap --profile aws-profile-name`

### Setup hosted zones

Everything in this sections happens the *HostedZones* account.

#### Create the hosted zones

* Create the *root* public hosted with name `yourdomain.com`.
* Copy the *root* hosted zone id to a variable named `rootHostedZoneId` in *backend/consts/appConsts.ts*.
* Create the *dev* public hosted zone with name `dev.yourdmain.com`.
* Copy the *dev* hosted zone id to a variable named `devHostedZoneId` in *backend/consts/appConsts.ts*.
* Create a new record in the *root* zone with type *NS* and the same name and value as the NS record in the *dev* zone.

#### Register a domain

In the *HostedZones* account:

* Register a domain in Route53.
* Use the name servers from the `root` zone NS record.
* Copy the domain name to a variable named `rootDomain` in *backend/consts/appConsts.ts*

#### Create policies for the hosted zones

In the *HostedZones* account add 2 policies with names:

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
                "Resource": "arn:aws:route53:::hostedzone/id-of-the-hosted-zone-Root-or-Dev"
            },
            {
                "Effect": "Allow",
                "Action": "route53:ListHostedZonesByName",
                "Resource": "*"
            }
        ]
    }
</details>

#### Create roles for the hosted zones policies

In the Production account add 2 roles with names:

* `CrossAccountRootHostedZone`
* `CrossAccountDevHostedZone`

Add a custom trust policy to each role:

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
                        "aws:PrincipalOrgPaths": "aws-organizations-path-to-Dev-or-NonDev-unit/*"
                    }
                }
            }
        ]
    }
</details>

Add the corresponding hosted zones policy to each role.

(Example of *aws:PrincipalOrgPaths*: `o-dqkaknenun/r-weph/ou-weph-n389l0xd/ou-weph-cue5gslg*` )

Copy the ARNs of the 2 roles to variables named `crossAccountDevHostedZoneRole` and `crossAccountRootHostedZoneRole` in *backend/consts/appConsts.ts*.

### Creating personal accounts for developers

Developers need permissions to assume the *CrossAccountDevHostedZone* role.

There are two options:

* Create a personal account in the *Dev* unit of AWS Organizations.
* Allow an external account to assume the *CrossAccountDevHostedZone* role.

<details>
    <summary>Allowing an external account in CrossAccountDevHostedZone trust policy</summary>

     {
        "Effect": "Allow",
        "Principal": {
            "AWS": "external-account-id"
        },
        "Action": "sts:AssumeRole"
    }
<details>