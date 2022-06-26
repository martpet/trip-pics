import {
  DnsValidatedCertificate,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { AppHostedZone } from './AppHostedZone';

interface DomainsProps {
  isProd: boolean;
  rootDomain: string;
  subDomain?: string;
  rootHostedZoneId: string;
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

    const { hostedZone } = new AppHostedZone(this, 'HostedZone', {
      rootDomain,
      subDomain,
      rootHostedZoneId,
      zoneDelegationRole,
      isProd,
    });

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: hostedZone.zoneName,
      hostedZone,
      region: 'us-east-1',
      cleanupRoute53Records: true,
    });

    this.hostedZone = hostedZone;
    this.certificate = certificate;
  }
}
