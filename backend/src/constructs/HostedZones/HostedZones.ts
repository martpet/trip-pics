import { Stack } from 'aws-cdk-lib';
import { IRole, Role } from 'aws-cdk-lib/aws-iam';
import {
  CrossAccountZoneDelegationRecord,
  PublicHostedZone,
} from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface HostedZonesProps {
  appDomain: string;
  isStaging: boolean;
  separateRootZoneAccount?: string;
}

// TODO: Add Route 53 health checks.

export class HostedZones extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { appDomain, separateRootZoneAccount, isStaging }: HostedZonesProps
  ) {
    super(scope, id);

    let delegationRole!: IRole;

    if (separateRootZoneAccount) {
      const delegationRoleArn = Stack.of(this).formatArn({
        region: '',
        account: separateRootZoneAccount,
        service: 'iam',
        resource: 'role',
        resourceName: 'CrossAccountZoneDelegation',
      });

      delegationRole = Role.fromRoleArn(this, 'DelegationRole', delegationRoleArn);
    }

    if (isStaging) {
      const staginZone = new PublicHostedZone(this, 'StagingZone', {
        zoneName: `staging.${appDomain}`,
      });

      if (separateRootZoneAccount) {
        new CrossAccountZoneDelegationRecord(this, 'DelegateStaging', {
          delegatedZone: staginZone,
          parentHostedZoneName: appDomain,
          delegationRole,
        });
      }
    }
  }
}
