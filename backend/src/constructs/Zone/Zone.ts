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

interface ZoneProps {
  envDomain: string;
  hostedZoneId?: string;
  parentHostedZoneId?: string;
  delegationRoleArn?: string;
  healthCheckAlarmEmails?: string[];
}

export class Zone extends Construct {
  readonly hostedZone: IHostedZone;

  readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    {
      envDomain,
      hostedZoneId,
      parentHostedZoneId,
      delegationRoleArn,
      healthCheckAlarmEmails,
    }: ZoneProps
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

    if (parentHostedZoneId && delegationRoleArn) {
      const delegationRole = Role.fromRoleArn(this, 'DelegationRole', delegationRoleArn);
      new CrossAccountZoneDelegationRecord(this, 'ZoneDelegation', {
        delegationRole,
        delegatedZone: hostedZone,
        parentHostedZoneId,
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
      region: 'us-east-1',
      cleanupRoute53Records: true,
    });

    certificate.node.addDependency(hostedZone); // try if cleanupRoute53Records will work

    this.certificate = certificate;
    this.hostedZone = hostedZone;
  }
}
