import { CfnHealthCheck } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { CrossRegionMetricAlarm, CrossRegionSNSTopic } from '~/constructs';

interface HealthCheckProps {
  domainName: string;
  alarmEmails?: string[];
}

export class HealthCheck extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { domainName, alarmEmails }: HealthCheckProps
  ) {
    super(scope, id);

    const route53MetricsRegion = 'us-east-1';

    const healthCheck = new CfnHealthCheck(this, 'HealthCheck', {
      healthCheckConfig: {
        type: 'HTTPS',
        fullyQualifiedDomainName: domainName,
        requestInterval: 30,
        failureThreshold: 3,
      },
    });

    const topic = new CrossRegionSNSTopic(this, 'Topic', {
      region: route53MetricsRegion,
      createTopicInput: { Name: 'Route53HealthCheck' },
      subscribeInputs: alarmEmails?.map((Endpoint) => ({ Endpoint, Protocol: 'email' })),
    });

    new CrossRegionMetricAlarm(this, `Alarm`, {
      region: route53MetricsRegion,
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
