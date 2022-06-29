import {
  DnsValidatedCertificate,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { HealthChecks } from '~/constructs';

import { AppHostedZones } from './AppHostedZones';

interface AppDomainsProps {
  rootDomain: string;
  envSubdomain?: string;
  rootHostedZoneId: string;
  zoneDelegationRole?: string;
  healthCheckAlertEmails?: string[];
  isProd: boolean;
}

export class AppDomains extends Construct {
  public readonly hostedZone: IHostedZone;

  public readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    {
      rootDomain,
      envSubdomain,
      rootHostedZoneId,
      zoneDelegationRole,
      healthCheckAlertEmails,
      isProd,
    }: AppDomainsProps
  ) {
    super(scope, id);

    const { hostedZone } = new AppHostedZones(this, 'HostedZones', {
      rootDomain,
      envSubdomain,
      rootHostedZoneId,
      zoneDelegationRole,
      isProd,
    });

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      domainName: hostedZone.zoneName,
      hostedZone,
      region: 'us-east-1', // CloudFront must request the certificate in US East
      cleanupRoute53Records: true,
    });

    new HealthChecks(this, 'HealthChecks', {
      domainName: hostedZone.zoneName,
      alertEmails: healthCheckAlertEmails,
    });

    this.hostedZone = hostedZone;
    this.certificate = certificate;
  }
}
