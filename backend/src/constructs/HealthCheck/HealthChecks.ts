import { CfnHealthCheck } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { CrossRegionMetricAlarm, CrossRegionSNSTopic } from '~/constructs';

interface HealthChecksProps {
  domainName: string;
  alertEmails?: string[];
}

export class HealthChecks extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { domainName, alertEmails }: HealthChecksProps
  ) {
    super(scope, id);

    const healthCheck = new CfnHealthCheck(this, 'HealthCheck', {
      healthCheckConfig: {
        type: 'HTTPS',
        fullyQualifiedDomainName: domainName,
        requestInterval: 30,
        failureThreshold: 3,
      },
    });

    const healthCheckRegion = 'us-east-1';

    const topic = new CrossRegionSNSTopic(this, 'Topic', {
      region: healthCheckRegion,
      createTopicInput: { Name: 'Route53HealthCheck' },
      subscribeInputs: alertEmails?.map((Endpoint) => ({ Endpoint, Protocol: 'email' })),
    });

    new CrossRegionMetricAlarm(this, `Alarm`, {
      region: healthCheckRegion,
      putMetricAlarmInput: {
        AlarmName: 'Route53HealthCheck',
        Namespace: 'AWS/Route53',
        MetricName: 'HealthCheckStatus',
        Statistic: 'Minimum',
        ComparisonOperator: 'LessThanThreshold',
        Threshold: 1,
        Period: 60,
        EvaluationPeriods: 1,
        AlarmActions: [topic.arn],
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
