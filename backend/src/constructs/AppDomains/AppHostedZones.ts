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
  devHostedZoneId: string;
  crossAccountHostedZoneRole?: string;
  isProd: boolean;
  isDev: boolean;
}

export class AppHostedZones extends Construct {
  readonly domainName: string;

  readonly hostedZone: IHostedZone;

  constructor(
    scope: Construct,
    id: string,
    {
      rootDomain,
      envSubdomain,
      rootHostedZoneId,
      devHostedZoneId,
      crossAccountHostedZoneRole,
      isProd,
      isDev,
    }: AppHostedZonesProps
  ) {
    super(scope, id);

    if (!isProd && !envSubdomain) {
      throw new Error('Subdomain is required');
    }

    if (isProd) {
      this.hostedZone = PublicHostedZone.fromPublicHostedZoneAttributes(
        this,
        'HostedZone',
        {
          hostedZoneId: rootHostedZoneId,
          zoneName: rootDomain,
        }
      );
    } else {
      this.hostedZone = new PublicHostedZone(this, 'HostedZone', {
        zoneName: `${envSubdomain}.${rootDomain}`,
      });
    }

    this.domainName = this.hostedZone.zoneName;

    if (!isProd && crossAccountHostedZoneRole) {
      const delegationRole = Role.fromRoleArn(
        this,
        'ZoneDelegationRole',
        crossAccountHostedZoneRole
      );

      new CrossAccountZoneDelegationRecord(this, 'ZoneDelegation', {
        parentHostedZoneId: isDev ? devHostedZoneId : rootHostedZoneId,
        delegatedZone: this.hostedZone,
        delegationRole,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }
}
