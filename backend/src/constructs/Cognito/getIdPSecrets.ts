import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import { CrossAccountSSM } from '~/constructs';

interface Props {
  googleParam: string;
  appleParam: string;
  roleArn?: string;
}

export const getIdPSecrets = (
  scope: Construct,
  { googleParam, appleParam, roleArn }: Props
) => {
  let googleSecret: string;
  let appleSecret: string;

  if (roleArn) {
    const { values } = new CrossAccountSSM(scope, 'OAuthSecrets', {
      roleArn,
      getParametersInput: {
        Names: [googleParam, appleParam],
      },
    });

    [googleSecret, appleSecret] = values;
  } else {
    googleSecret = StringParameter.fromStringParameterAttributes(scope, 'GoogleSecret', {
      parameterName: googleParam,
    }).stringValue;

    appleSecret = StringParameter.fromStringParameterAttributes(
      scope,
      'ApplePrivateKey',
      {
        parameterName: appleParam,
      }
    ).stringValue;
  }

  return {
    googleSecret,
    appleSecret,
  };
};
