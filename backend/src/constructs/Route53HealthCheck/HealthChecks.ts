import { CfnHealthCheck } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { CrossRegionMetricAlarm } from '~/constructs';

interface HealthChecksProps {
  domainName: string;
}

export class HealthChecks extends Construct {
  constructor(scope: Construct, id: string, { domainName }: HealthChecksProps) {
    super(scope, id);

    const healthCheck = new CfnHealthCheck(this, 'HealthCheck', {
      healthCheckConfig: {
        type: 'HTTPS',
        fullyQualifiedDomainName: domainName,
        requestInterval: 30,
        failureThreshold: 3,
      },
    });

    new CrossRegionMetricAlarm(this, `HealthCheckAlarm`, {
      region: 'us-east-1',
      input: {
        AlarmName: 'Route53HealthCheck',
        Namespace: 'AWS/Route53',
        MetricName: 'HealthCheckStatus',
        Statistic: 'Minimum',
        ComparisonOperator: 'LessThanThreshold',
        Threshold: 1,
        Period: 60,
        EvaluationPeriods: 1,
        Dimensions: [
          {
            Name: 'HealthCheckId',
            Value: healthCheck.attrHealthCheckId,
          },
        ],
      },
    });
  }
}
