import { CustomResource, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

import { CrossRegionAlarmHandlerProps } from './CrossRegionMetricAlarm.handler';

export class CrossRegionMetricAlarm extends Construct {
  constructor(scope: Construct, id: string, handlerProps: CrossRegionAlarmHandlerProps) {
    super(scope, id);

    const { stackName } = Stack.of(this);

    // eslint-disable-next-line no-param-reassign
    handlerProps.putMetricAlarmInput.AlarmName = `${stackName}-${handlerProps.putMetricAlarmInput.AlarmName}`;

    const onEventHandler = new NodejsFunction(this, 'handler');

    const policy = new PolicyStatement({
      actions: ['cloudwatch:PutMetricAlarm', 'cloudwatch:DeleteAlarms'],
      resources: ['*'],
    });

    onEventHandler.addToRolePolicy(policy);

    const { serviceToken } = new Provider(this, 'Provider', { onEventHandler });

    new CustomResource(this, 'CrossRegionAlarm', {
      serviceToken,
      properties: handlerProps,
    });
  }
}
