import { CustomResource, Token } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

import { CrossAccountSSMHandlerProps } from './CrossAccountSSM.handler';

type CrossAccountSSMProps = CrossAccountSSMHandlerProps;

export class CrossAccountSSM extends Construct {
  readonly values: string[];

  constructor(scope: Construct, id: string, handlerProps: CrossAccountSSMProps) {
    super(scope, id);

    // handlerProps.getParametersInput.WithDecryption ??= true;

    // eslint-disable-next-line no-param-reassign
    handlerProps.getParametersInput.WithDecryption = true;

    const onEventHandler = new NodejsFunction(this, 'handler');

    const policy = new PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [handlerProps.roleArn],
    });

    onEventHandler.addToRolePolicy(policy);

    const { serviceToken } = new Provider(this, 'Provider', { onEventHandler });

    const customResource = new CustomResource(this, 'CrossAccountSSM', {
      serviceToken,
      properties: handlerProps,
    });

    this.values = Token.asList(customResource.getAtt('values'));
  }
}
