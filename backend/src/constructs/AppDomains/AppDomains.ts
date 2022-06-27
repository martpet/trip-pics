import {
  DnsValidatedCertificate,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { HostedZones } from './HostedZones';

interface AppDomainsProps {
  rootDomain: string;
  subDomain?: string;
  rootHostedZoneId: string;
  zoneDelegationRole?: string;
  isProd: boolean;
  isStaging: boolean;
}

export class AppDomains extends Construct {
  readonly hostedZone: IHostedZone;

  readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    {
      rootDomain,
      rootHostedZoneId,
      subDomain,
      zoneDelegationRole,
      isProd,
      isStaging,
    }: AppDomainsProps
  ) {
    super(scope, id);

    const { hostedZone } = new HostedZones(this, 'HostedZones', {
      rootDomain,
      subDomain,
      rootHostedZoneId,
      zoneDelegationRole,
      isProd,
      isStaging,
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
