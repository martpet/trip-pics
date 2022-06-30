import { CustomResource, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

import { CrossRegionSNSTopicHandlerProps } from './CrossRegionSNSTopic.handler';

type CrossRegionSNSTopicProps = CrossRegionSNSTopicHandlerProps;

export class CrossRegionSNSTopic extends Construct {
  readonly arn: string;

  constructor(scope: Construct, id: string, props: CrossRegionSNSTopicProps) {
    super(scope, id);

    const { stackName } = Stack.of(this);

    // eslint-disable-next-line no-param-reassign
    props.createTopicInput.Name = `${stackName}-${props.createTopicInput.Name}`;

    const onEventHandler = new NodejsFunction(this, 'handler');

    const policy = new PolicyStatement({
      actions: ['sns:CreateTopic', 'sns:DeleteTopic', 'sns:Subscribe'],
      resources: ['*'],
    });

    onEventHandler.addToRolePolicy(policy);

    const provider = new Provider(this, 'Provider', { onEventHandler });

    const topic = new CustomResource(this, 'CrossRegionSNSTopic', {
      serviceToken: provider.serviceToken,
      properties: props,
    });

    this.arn = topic.getAttString('TopicArn');
  }
}
