import { RemovalPolicy } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
  CfnHealthCheck,
  CrossAccountZoneDelegationRecord,
  IHostedZone,
  PublicHostedZone,
} from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface AppHostedZoneProps {
  rootDomain: string;
  subDomain?: string;
  rootHostedZoneId: string;
  zoneDelegationRole?: string;
  isProd: boolean;
  isStaging: boolean;
}

export class AppHostedZone extends Construct {
  readonly hostedZone: IHostedZone;

  constructor(
    scope: Construct,
    id: string,
    {
      rootDomain,
      subDomain,
      rootHostedZoneId,
      zoneDelegationRole,
      isProd,
      isStaging,
    }: AppHostedZoneProps
  ) {
    super(scope, id);

    if (!isProd && !subDomain) {
      throw new Error('Subdomain is required');
    }

    let zone: IHostedZone;

    if (isProd) {
      zone = PublicHostedZone.fromPublicHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: rootHostedZoneId,
        zoneName: rootDomain,
      });
    } else {
      zone = new PublicHostedZone(this, 'HostedZone', {
        zoneName: `${subDomain}.${rootDomain}`,
      });

      zone.applyRemovalPolicy(RemovalPolicy.DESTROY);

      if (zoneDelegationRole) {
        const delegationRole = Role.fromRoleArn(
          this,
          'DelegationRole',
          zoneDelegationRole
        );
        new CrossAccountZoneDelegationRecord(this, 'ZoneDelegation', {
          parentHostedZoneName: rootDomain,
          delegatedZone: zone,
          delegationRole,
          removalPolicy: RemovalPolicy.DESTROY,
        });
      }
    }

    if (isProd || isStaging) {
      new CfnHealthCheck(this, 'HealthCheck', {
        healthCheckConfig: {
          type: 'HTTPS',
          fullyQualifiedDomainName: zone.zoneName,
        },
      });
    }

    this.hostedZone = zone;
  }
}
