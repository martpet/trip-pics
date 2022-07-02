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

import { HealthCheck } from './HealthCheck';

interface AppZoneProps {
  isProd: boolean;
  rootDomain: string;
  envSubdomain?: string;
  hostedZoneId?: string;
  healthCheckAlarmEmails?: string[];
  crossAccountParentHostedZone?: {
    zoneId: string;
    roleArn: string;
  };
}

export class AppZone extends Construct {
  readonly hostedZone: IHostedZone;

  readonly domainName: string;

  readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    {
      isProd,
      rootDomain,
      envSubdomain,
      hostedZoneId,
      crossAccountParentHostedZone,
      healthCheckAlarmEmails,
    }: AppZoneProps
  ) {
    super(scope, id);

    const domainName = envSubdomain ? `${envSubdomain}.${rootDomain}` : rootDomain;

    let hostedZone: IHostedZone;

    if (!isProd && !envSubdomain) {
      throw new Error('Subdomain for Non-Production environments is required');
    }

    if (isProd && envSubdomain) {
      throw new Error('Subdomain should not be added to Production environment');
    }

    if (hostedZoneId) {
      hostedZone = PublicHostedZone.fromPublicHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId,
        zoneName: domainName,
      });
    } else {
      hostedZone = new PublicHostedZone(this, 'HostedZone', {
        zoneName: domainName,
      });
    }

    if (crossAccountParentHostedZone) {
      const { zoneId, roleArn } = crossAccountParentHostedZone;
      const delegationRole = Role.fromRoleArn(this, 'DelegationRole', roleArn);

      new CrossAccountZoneDelegationRecord(this, 'ZoneDelegation', {
        delegationRole,
        delegatedZone: hostedZone,
        parentHostedZoneId: zoneId,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }

    new HealthCheck(this, 'HealthChecks', {
      domainName,
      alarmEmails: healthCheckAlarmEmails,
    });

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      hostedZone,
      domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      region: 'us-east-1', // us-east-1 needed by CloudFront
      cleanupRoute53Records: true,
    });

    this.domainName = domainName;
    this.certificate = certificate;
    this.hostedZone = hostedZone;
  }
}
