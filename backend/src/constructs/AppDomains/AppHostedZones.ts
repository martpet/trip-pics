import { RemovalPolicy } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
  CrossAccountZoneDelegationRecord,
  IHostedZone,
  PublicHostedZone,
} from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface AppHostedZonesProps {
  rootDomain: string;
  envSubdomain?: string;
  rootHostedZoneId: string;
  zoneDelegationRole?: string;
  isProd: boolean;
}

export class AppHostedZones extends Construct {
  readonly hostedZone: IHostedZone;

  constructor(
    scope: Construct,
    id: string,
    {
      rootDomain,
      envSubdomain,
      rootHostedZoneId,
      zoneDelegationRole,
      isProd,
    }: AppHostedZonesProps
  ) {
    super(scope, id);

    if (!isProd && !envSubdomain) {
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
        zoneName: `${envSubdomain}.${rootDomain}`,
      });

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

    this.hostedZone = zone;
  }
}
