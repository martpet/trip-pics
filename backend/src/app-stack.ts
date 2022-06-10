import { Stack, StackProps } from 'aws-cdk-lib';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const func = new NodejsFunction(this, 'someFunc');

    func.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });
  }
}
