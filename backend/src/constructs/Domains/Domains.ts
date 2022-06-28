import {
  DnsValidatedCertificate,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { HealthChecks } from '~/constructs';

import { HostedZones } from './HostedZones';

interface DomainsProps {
  rootDomain: string;
  subDomain?: string;
  rootHostedZoneId: string;
  zoneDelegationRole?: string;
  isProd: boolean;
}

export class Domains extends Construct {
  readonly hostedZone: IHostedZone;

  readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    { rootDomain, rootHostedZoneId, subDomain, zoneDelegationRole, isProd }: DomainsProps
  ) {
    super(scope, id);

    const { hostedZone } = new HostedZones(this, 'HostedZones', {
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

    new HealthChecks(this, 'HealthChecks', {
      domainName: hostedZone.zoneName,
    });

    this.hostedZone = hostedZone;
    this.certificate = certificate;
  }
}
