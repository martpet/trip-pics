# TripPics

## Setup deployment environments
### 1. Bootstrap CDK
It is **recommended** to use separate AWS accounts for each environment (Production, Staging, etc). It is also possible to have all environments deployed to a single account (in such case change the GitHub workflows to deploy to the same account).

For each deployment environment, using admin rights, run:

`cd backend && npx bootstrap --profile <aws-profile-for-the-account>`

### 2. Add an AWS hosted zone
Create a hosted zone for the app domain name in the account of the Production environment.


#### **If separate AWS accounts** are used for the enviroments:

##### 1. Create a policy in the Production account:

<details>
  <summary>Route53ChangeRootZoneRecordSets</summary>

  ```
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Action": "route53:ChangeResourceRecordSets",
              "Resource": "arn:aws:route53:::hostedzone/#####",
              "Effect": "Allow"
          }
      ]
  }
  ```
</details>

##### 2. Create a role, attach the above policy to it, and add the following trust policy:

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

##### 3. Pass the role ARN in AppStack to the HostedZones struct.
----

## Setup a personal deployment environment
### Bootstrap
`cd backend && npx bootstrap --profile <aws-profile>`
### Deploy
`cd backend && npx cdk deploy personal --profile <aws-profile>`

----

## Install npm dependencies
`npm install --force`

## Start frontend server
`npm start`
