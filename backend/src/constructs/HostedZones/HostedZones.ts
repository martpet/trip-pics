// TODO: Add Route 53 health checks.

import { Role } from 'aws-cdk-lib/aws-iam';
import {
  CrossAccountZoneDelegationRecord,
  PublicHostedZone,
} from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface HostedZonesProps {
  appDomain: string;
  isStaging: boolean;
  delegationRoleArn?: string;
}

export class HostedZones extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { appDomain, delegationRoleArn, isStaging }: HostedZonesProps
  ) {
    super(scope, id);

    if (isStaging) {
      const staginZone = new PublicHostedZone(this, 'StagingZone', {
        zoneName: `staging.${appDomain}`,
      });

      if (delegationRoleArn) {
        new CrossAccountZoneDelegationRecord(this, 'DelegateStagingZone', {
          parentHostedZoneName: appDomain,
          delegatedZone: staginZone,
          delegationRole: Role.fromRoleArn(this, 'DelegationRole', delegationRoleArn),
        });
      }
    }
  }
}
