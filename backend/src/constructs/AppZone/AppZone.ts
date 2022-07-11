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
  envDomain: string;
  hostedZoneId?: string;
  healthCheckAlarmEmails?: string[];
  crossAccountParentHostedZone?: {
    zoneId: string;
    roleArn: string;
  };
}

export class AppZone extends Construct {
  readonly hostedZone: IHostedZone;

  readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    {
      envDomain,
      hostedZoneId,
      crossAccountParentHostedZone,
      healthCheckAlarmEmails,
    }: AppZoneProps
  ) {
    super(scope, id);

    let hostedZone: IHostedZone;

    if (hostedZoneId) {
      hostedZone = PublicHostedZone.fromPublicHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId,
        zoneName: envDomain,
      });
    } else {
      hostedZone = new PublicHostedZone(this, 'HostedZone', {
        zoneName: envDomain,
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
      domainName: envDomain,
      alarmEmails: healthCheckAlarmEmails,
    });

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      hostedZone,
      domainName: envDomain,
      subjectAlternativeNames: [`*.${envDomain}`],
      region: 'us-east-1', // us-east-1 needed by CloudFront
      cleanupRoute53Records: true,
    });

    this.certificate = certificate;
    this.hostedZone = hostedZone;
  }
}
