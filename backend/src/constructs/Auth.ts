import { RemovalPolicy } from 'aws-cdk-lib';
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

interface AuthProps {
  envDomain: string;
  authSubdomain: string;
  certificate: ICertificate;
  hostedZone: IHostedZone;
  oauthScopes: string[];
}

export class Auth extends Construct {
  readonly userPoolClientId: string;

  readonly authDomain: string;

  constructor(
    scope: Construct,
    id: string,
    { envDomain, authSubdomain, certificate, hostedZone, oauthScopes }: AuthProps
  ) {
    super(scope, id);

    const authDomain = `${authSubdomain}.${envDomain}`;

    // TODO - move to secrets
    const clientId =
      '276806659709-6lap8v4ekmsqqrdaosb3tmiq6j24fvgv.apps.googleusercontent.com';
    const clientSecret = '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';

    const userPool = new UserPool(this, 'Pool', {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolDomain = userPool.addDomain('CognitoDomain', {
      customDomain: {
        domainName: authDomain,
        certificate,
      },
    });

    new ARecord(this, 'CognitoAliasRecord', {
      zone: hostedZone,
      recordName: authSubdomain,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
    });

    const identityProvider = new UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
      clientId,
      clientSecret,
      scopes: oauthScopes,
      userPool,
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        custom: {
          picture: ProviderAttribute.GOOGLE_PICTURE,
        },
      },
    });

    const client = new UserPoolClient(this, 'GooglePoolClient', {
      userPool,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
        callbackUrls: [`https://${envDomain}`, 'http://localhost:3000'],
      },
    });

    client.node.addDependency(identityProvider);

    this.userPoolClientId = client.userPoolClientId;
    this.authDomain = authDomain;
  }
}
