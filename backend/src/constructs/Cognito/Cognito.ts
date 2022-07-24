import { RemovalPolicy } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderApple,
  UserPoolIdentityProviderGoogle,
} from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

import { getIdentityProviderSecrets } from './getIdentityProviderSecrets';

interface CognitoProps {
  envDomain: string;
  authSubdomain: string;
  localhostPort: number;
  certificate: ICertificate;
  hostedZone: IHostedZone;
  usersTable: Table;
  googleClientId: string;
  googleClientSecretParamName: string;
  appleTeamId: string;
  appleClientId: string;
  appleKeyId: string;
  applePrivateKeyParamName: string;
  authSecretsAssumeRoleArn?: string;
}

export class Cognito extends Construct {
  readonly userPoolClientId: string;

  readonly authDomain: string;

  constructor(
    scope: Construct,
    id: string,
    {
      envDomain,
      authSubdomain,
      certificate,
      hostedZone,
      localhostPort,
      usersTable,
      googleClientId,
      googleClientSecretParamName,
      appleTeamId,
      appleClientId,
      appleKeyId,
      applePrivateKeyParamName,
      authSecretsAssumeRoleArn,
    }: CognitoProps
  ) {
    super(scope, id);

    const authDomain = `${authSubdomain}.${envDomain}`;

    const { googleSecret, appleSecret } = getIdentityProviderSecrets(this, {
      googleParam: googleClientSecretParamName,
      appleParam: applePrivateKeyParamName,
      roleArn: authSecretsAssumeRoleArn,
    });

    const lambdaTriggersProps = {
      environment: {
        usersTableName: usersTable.tableName,
        usersParitionKey: usersTable.schema().partitionKey.name,
      },
    };

    const postConfirmation = new NodejsFunction(this, 'PostConfirmation', {
      ...lambdaTriggersProps,
      entry: `${__dirname}/lambdaTriggers/postConfirmation/postConfirmation.ts`,
    });

    const postAuthentication = new NodejsFunction(this, 'PostAuthentication', {
      ...lambdaTriggersProps,
      entry: `${__dirname}/lambdaTriggers/postAuthentication/postAuthentication.ts`,
    });

    usersTable.grantReadWriteData(postConfirmation);
    usersTable.grantReadWriteData(postAuthentication);

    const userPool = new UserPool(this, 'UserPool', {
      removalPolicy: RemovalPolicy.DESTROY,
      lambdaTriggers: {
        postConfirmation,
        postAuthentication,
      },
    });

    const userPoolDomain = userPool.addDomain('UserPoolDomain', {
      customDomain: {
        domainName: authDomain,
        certificate,
      },
    });

    new ARecord(this, 'ARecord', {
      zone: hostedZone,
      recordName: authSubdomain,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
    });

    const googleIdentityProvider = new UserPoolIdentityProviderGoogle(
      this,
      'GoogleIdentityProvider',
      {
        userPool,
        clientId: googleClientId,
        clientSecret: googleSecret,
        scopes: ['email', 'profile'],
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
          givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
          profilePicture: ProviderAttribute.GOOGLE_PICTURE,
        },
      }
    );

    const appleIdentityProvider = new UserPoolIdentityProviderApple(
      this,
      'AppleIdentityProvider',
      {
        userPool,
        teamId: appleTeamId,
        clientId: appleClientId,
        keyId: appleKeyId,
        privateKey: appleSecret,
        scopes: ['email', 'name'],
        attributeMapping: {
          email: ProviderAttribute.APPLE_EMAIL,
          givenName: ProviderAttribute.APPLE_FIRST_NAME,
          familyName: ProviderAttribute.APPLE_LAST_NAME,
        },
      }
    );

    const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool,
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.APPLE,
        UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        callbackUrls: [`https://${envDomain}`, `http://localhost:${localhostPort}`],
      },
    });

    userPoolClient.node.addDependency(appleIdentityProvider);
    userPoolClient.node.addDependency(googleIdentityProvider);

    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.authDomain = authDomain;
  }
}
