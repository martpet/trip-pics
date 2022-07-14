# Setup *Production*, *Staging* and *DevService* accounts

## Setup AWS Organizations
* Create `Production`, `Staging` and `DevService` accounts.
* Create a `Dev` unit.

## Bootstrap

For *Production* and *Staging* environments run:

`cd backend && npx cdk bootstrap --profile aws-profile-name`

## Setup hosted zones

### Create the hosted zones

In the *Production* account:
* Create the *root* public hosted zone with name `<domain.com>`.
* Copy the *root* hosted zone id to a variable named `rootHostedZoneId` in *backend/consts/appConsts.ts*.

In the *Staging* account:
* Create the *test* public hosted zone with name `test.domain.com`.
* Copy the *test* hosted zone id to a variable named `stagingHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the *test* zone into the *Production* account *root* zone.

In the *DevService* account:
* Create the *dev* public hosted zone with name `dev.domain.com`.
* Copy the *dev* hosted zone id to a variable named `devHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the *dev* zone into the *Production* account *root* zone.

### Create a policy for editing the *Dev* hosted zone records

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
                "Resourcthee": "*"
            }
        ]
    }
</details>

### Register a domain

In the *HostedZones* account:

* Register a domain in Route53.
* Use the name servers from the *root* zone NS record.
* Copy the domain name to a variable named `rootDomain` in *backend/consts/appConsts.ts*

## Integrate Google Sign-In

### Create a OAuth client

For each environment (Dev, Staging and Production) create an OAuth client:

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials) in *Google Cloud*.
2. Click *Create credentials* > *OAuth client ID*.
3. Select the *Web application* type.
4. Add the application domain name to *Authorized JavaScript origins* (for *Dev* use `http://localhost:3000`).
5. Add `<application-domain>/oauth2/idpresponse` to *Authorized redirect URIs*.
6. Copy *Client ID* to variables named `googleClientIdDev`, `googleClientIdStaging` and `googleClientIdProd` in *backend/consts/appConsts.ts*.
7. In the coresponding AWS account (*DevService*, *Staging*, *Production) add a secure string parameter to *Parameter store* and put the *Client secret* in it.
8. Copy the name of the secure parameter to a variable named `googleClientSecretParamName` in *backend/consts/appConsts.ts*.

### Create a policy for reading the *Client Secret* parameter

In the *DevService* account add a policy named `SSMGetOauthClientSecret`.

<details>
    <summary>Policy content</summary>

    {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": "ssm:GetParameters",
              "Resource": "arn:aws:ssm:<THE-REGION>:<THE-ACCOUNT-ID>:parameter/auth/google/client-secret"
          }
      ]
    }
</details>

## Add a role to be assumed by the dev accounts

In the *DevService* account create a role named `DevAccountServiceRole`.

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

(*aws:PrincipalOrgPaths* is similar to `o-dqkaknenun/r-weph/ou-weph-n389l0xd`)

Attatch the *HostedZoneChangeRecords* and *SSMGetOauthClientSecret* policies.

Copy the ARN of *DevAccountServiceRole* role to a variable named `devAccountServiceRoleArn` in *backend/consts/appConsts.ts*.

---

# Creating developer accounts

Developers need permissions to assume the *DevAccountServiceRole* from the *DevService* account.

There are two options:

* Create a personal account in the *Dev* organizational unit.
* Add permissions for an existing account to assume the *DevAccountServiceRole*.

<details>
    <summary>Permissions for an existing account to asssume DevAccountServiceRole</summary>

     {
        "Effect": "Allow",
        "Principal": {
            "AWS": "ACCOUNT_ID"
        },
        "Action": "sts:AssumeRole"
    }
</details>

Don't forget to add the user's personal domain to Google Oauth Dev client *Authorized JavaScript origins* and *Authorized redirect URIs*.

----

Check also: [Setup personal dev account](README.md)