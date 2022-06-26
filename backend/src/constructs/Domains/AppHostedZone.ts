import { RemovalPolicy } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
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
    }: AppHostedZoneProps
  ) {
    super(scope, id);

    let hostedZone: IHostedZone;

    if (isProd) {
      hostedZone = PublicHostedZone.fromPublicHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: rootHostedZoneId,
        zoneName: rootDomain,
      });
    } else {
      if (!subDomain) {
        throw new Error('Subdomain is required');
      }

      hostedZone = new PublicHostedZone(this, 'HostedZone', {
        zoneName: `${subDomain}.${rootDomain}`,
      });

      if (zoneDelegationRole) {
        const delegationRole = Role.fromRoleArn(
          this,
          'DelegationRole',
          zoneDelegationRole
        );
        new CrossAccountZoneDelegationRecord(this, 'ZoneDelegation', {
          parentHostedZoneName: rootDomain,
          delegatedZone: hostedZone,
          delegationRole,
          removalPolicy: RemovalPolicy.DESTROY,
        });
      }

      hostedZone.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }

    this.hostedZone = hostedZone;
  }
}
