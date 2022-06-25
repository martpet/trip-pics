import { RemovalPolicy } from 'aws-cdk-lib';
import {
  DnsValidatedCertificate,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
  CrossAccountZoneDelegationRecord,
  IHostedZone,
  PublicHostedZone,
} from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface DomainsProps {
  isProd: boolean;
  rootDomain: string;
  rootHostedZoneId: string;
  envSubDomain?: string;
  zoneDelegationRole?: string;
}

export class Domains extends Construct {
  readonly appDomain: string;

  readonly appDomainCertificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    {
      isProd,
      rootDomain,
      rootHostedZoneId,
      envSubDomain,
      zoneDelegationRole,
    }: DomainsProps
  ) {
    super(scope, id);

    if (!isProd && !envSubDomain) {
      throw new Error('Subdomain is required');
    }

    let hostedZone: IHostedZone;

    if (isProd) {
      hostedZone = PublicHostedZone.fromPublicHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: rootHostedZoneId,
        zoneName: rootDomain,
      });
    } else {
      hostedZone = new PublicHostedZone(this, 'HostedZone', {
        zoneName: `${envSubDomain}.${rootDomain}`,
      });
    }

    if (!isProd && zoneDelegationRole) {
      new CrossAccountZoneDelegationRecord(this, 'ZoneDelegation', {
        parentHostedZoneName: rootDomain,
        delegatedZone: hostedZone,
        delegationRole: Role.fromRoleArn(this, 'DelegationRole', zoneDelegationRole),
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: hostedZone.zoneName,
      hostedZone,
      region: 'us-east-1',
      cleanupRoute53Records: true,
    });

    this.appDomain = hostedZone.zoneName;

    this.appDomainCertificate = certificate;
  }
}
