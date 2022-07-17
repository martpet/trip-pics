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
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import { CrossAccountSSM } from '~/constructs';

interface AuthProps {
  envDomain: string;
  authSubdomain: string;
  certificate: ICertificate;
  hostedZone: IHostedZone;
  googleClientId: string;
  googleClientSecretParamName: string;
  appleTeamId: string;
  appleClientId: string;
  appleKeyId: string;
  applePrivateKeyParamName: string;
  authSecretsAssumeRoleArn?: string;
}

export class Auth extends Construct {
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
      googleClientId,
      googleClientSecretParamName,
      appleTeamId,
      appleClientId,
      appleKeyId,
      applePrivateKeyParamName,
      authSecretsAssumeRoleArn,
    }: AuthProps
  ) {
    super(scope, id);

    this.authDomain = `${authSubdomain}.${envDomain}`;

    let googleSecret: string;
    let applePrivateKey: string;

    const userPool = new UserPool(this, 'UserPool', {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolDomain = userPool.addDomain('UserPoolDomain', {
      customDomain: {
        domainName: this.authDomain,
        certificate,
      },
    });

    new ARecord(this, 'ARecord', {
      zone: hostedZone,
      recordName: authSubdomain,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
    });

    if (authSecretsAssumeRoleArn) {
      const { values } = new CrossAccountSSM(this, 'OAuthSecrets', {
        roleArn: authSecretsAssumeRoleArn,
        getParametersInput: {
          Names: [googleClientSecretParamName, applePrivateKeyParamName],
        },
      });
      [googleSecret, applePrivateKey] = values;
    } else {
      googleSecret = StringParameter.fromStringParameterAttributes(this, 'GoogleSecret', {
        parameterName: googleClientSecretParamName,
      }).stringValue;
      applePrivateKey = StringParameter.fromStringParameterAttributes(
        this,
        'ApplePrivateKey',
        {
          parameterName: applePrivateKeyParamName,
        }
      ).stringValue;
    }

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
        privateKey: applePrivateKey,
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
        callbackUrls: [`https://${envDomain}`, 'http://localhost:3000'],
      },
    });

    userPoolClient.node.addDependency(appleIdProvider);
    userPoolClient.node.addDependency(googleIdProvider);

    this.userPoolClientId = userPoolClient.userPoolClientId;
  }
}
