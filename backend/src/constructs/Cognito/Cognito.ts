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

import { getIdPSecrets } from './getIdPSecrets';

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

    const { googleSecret, appleSecret } = getIdPSecrets(this, {
      googleParam: googleClientSecretParamName,
      appleParam: applePrivateKeyParamName,
      roleArn: authSecretsAssumeRoleArn,
    });

    const userPoolLambdasProps = {
      environment: {
        usersTableName: usersTable.tableName,
        usersTableSchemaJson: JSON.stringify(usersTable.schema()),
      },
    };

    const postConfirmationLambda = new NodejsFunction(
      this,
      'PostConfirmLambda',
      userPoolLambdasProps
    );

    const postAuthenticationLambda = new NodejsFunction(
      this,
      'PostAuthLambda',
      userPoolLambdasProps
    );

    usersTable.grantReadWriteData(postConfirmationLambda);
    usersTable.grantReadWriteData(postAuthenticationLambda);

    const userPool = new UserPool(this, 'UserPool', {
      removalPolicy: RemovalPolicy.DESTROY,
      // todo: why the lambda triggers are not created?
      lambdaTriggers: {
        postConfirmationLambda,
        postAuthenticationLambda,
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

    const googleIdProvider = new UserPoolIdentityProviderGoogle(
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

    const appleIdProvider = new UserPoolIdentityProviderApple(
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

    userPoolClient.node.addDependency(appleIdProvider);
    userPoolClient.node.addDependency(googleIdProvider);

    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.authDomain = authDomain;
  }
}
