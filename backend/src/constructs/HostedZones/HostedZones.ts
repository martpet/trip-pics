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
  crossAccountZoneDelegationRoleArn?: string;
}

export class HostedZones extends Construct {
  readonly websiteDomain: string;

  constructor(
    scope: Construct,
    id: string,
    { appDomain, crossAccountZoneDelegationRoleArn, isStaging }: HostedZonesProps
  ) {
    super(scope, id);
    this.websiteDomain = appDomain;

    if (isStaging) {
      const zoneName = `staging.${appDomain}`;
      const staginZone = new PublicHostedZone(this, 'StagingZone', { zoneName });
      this.websiteDomain = zoneName;

      if (crossAccountZoneDelegationRoleArn) {
        new CrossAccountZoneDelegationRecord(this, 'DelegateStagingZone', {
          parentHostedZoneName: appDomain,
          delegatedZone: staginZone,
          delegationRole: Role.fromRoleArn(
            this,
            'DelegationRole',
            crossAccountZoneDelegationRoleArn
          ),
        });
      }
    }
  }
}
