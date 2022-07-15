import { Fn, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderGoogle,
} from 'aws-cdk-lib/aws-cognito';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

import { CrossAccountSSM } from '~/constructs';

interface AuthProps {
  envDomain: string;
  authSubdomain: string;
  certificate: ICertificate;
  hostedZone: IHostedZone;
  oauthScopes: string[];
  googleClientId: string;
  googleClientSecretParamName: string;
  oauthSecretsAssumeRoleArn?: string;
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
      oauthScopes,
      googleClientId,
      googleClientSecretParamName,
      oauthSecretsAssumeRoleArn,
    }: AuthProps
  ) {
    super(scope, id);

    this.authDomain = `${authSubdomain}.${envDomain}`;

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

    let googleSecret: string;

    if (oauthSecretsAssumeRoleArn) {
      const { values } = new CrossAccountSSM(this, 'OAuthSecrets', {
        roleArn: oauthSecretsAssumeRoleArn,
        getParametersInput: { Names: [googleClientSecretParamName] },
      });
      googleSecret = Fn.select(0, values);
    } else {
      googleSecret = SecretValue.ssmSecure(googleClientSecretParamName).unsafeUnwrap();
    }

    const googleIdentityProvider = new UserPoolIdentityProviderGoogle(
      this,
      'GoogleIdentityProvider',
      {
        userPool,
        clientId: googleClientId,
        clientSecret: googleSecret,
        scopes: oauthScopes,
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
          custom: {
            picture: ProviderAttribute.GOOGLE_PICTURE,
          },
        },
      }
    );

    const client = new UserPoolClient(this, 'UserPoolClient', {
      userPool,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
        callbackUrls: [`https://${envDomain}`, 'http://localhost:3000'],
      },
    });

    client.node.addDependency(googleIdentityProvider);

    this.userPoolClientId = client.userPoolClientId;
  }
}
