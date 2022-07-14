import {
  GetParametersCommand,
  GetParametersCommandInput,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

export interface CrossAccountSSMHandlerProps {
  roleArn: string;
  getParametersInput: GetParametersCommandInput;
}

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const { roleArn, getParametersInput } =
    event.ResourceProperties as unknown as CrossAccountSSMHandlerProps;

  const credentials = await getCrossAccountCredentials(roleArn);
  const client = new SSMClient({ credentials });
  const command = new GetParametersCommand(getParametersInput);
  const { Parameters } = await client.send(command);
  const values = Parameters?.map(({ Value }) => Value);

  return {
    Data: { values },
  };
};

async function getCrossAccountCredentials(roleArn: string) {
  const client = new STSClient({});
  const params = {
    RoleArn: roleArn,
    RoleSessionName: `cross-account-ssm-${new Date().getTime()}`,
  };

  const { Credentials } = await client.send(new AssumeRoleCommand(params));

  if (!Credentials) {
    throw Error('Error getting assume role credentials');
  }

  return {
    accessKeyId: Credentials.AccessKeyId!,
    secretAccessKey: Credentials.SecretAccessKey!,
    sessionToken: Credentials.SessionToken!,
  };
}
