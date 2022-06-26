// TODO Add Route53 Health checks

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
  subDomain?: string;
  zoneDelegationRole?: string;
}

export class Domains extends Construct {
  readonly hostedZone: IHostedZone;

  readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    { isProd, rootDomain, rootHostedZoneId, subDomain, zoneDelegationRole }: DomainsProps
  ) {
    super(scope, id);

    if (!isProd && !subDomain) {
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
        zoneName: `${subDomain}.${rootDomain}`,
      });
      hostedZone.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: hostedZone.zoneName,
      hostedZone,
      region: 'us-east-1',
      cleanupRoute53Records: true,
    });

    if (zoneDelegationRole && !isProd) {
      new CrossAccountZoneDelegationRecord(this, 'ZoneDelegation', {
        parentHostedZoneName: rootDomain,
        delegatedZone: hostedZone,
        delegationRole: Role.fromRoleArn(this, 'DelegationRole', zoneDelegationRole),
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }

    this.hostedZone = hostedZone;
    this.certificate = certificate;
  }
}
