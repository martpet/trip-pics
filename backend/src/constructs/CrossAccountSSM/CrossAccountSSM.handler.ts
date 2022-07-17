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

  const paramsNames = getParametersInput.Names;

  const hasUndfinedParamsNames = (array: string[]) =>
    array.some((item) => item === undefined);

  if (!paramsNames || hasUndfinedParamsNames(paramsNames)) {
    throw Error('The list of parameters names cannot include undefined');
  }

  const credentials = await getCrossAccountCredentials(roleArn);
  const client = new SSMClient({ credentials });
  const command = new GetParametersCommand(getParametersInput);
  const { Parameters } = await client.send(command);

  if (!Parameters) {
    throw Error('Could not find the specified parameters');
  }

  Parameters.sort((a, b) => paramsNames.indexOf(a.Name!) - paramsNames.indexOf(b.Name!));

  const values = Parameters.map(({ Value }) => Value);

  return {
    Data: { values },
  };
};

async function getCrossAccountCredentials(roleArn: string) {
  const client = new STSClient({});

  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: `cross-account-ssm-${new Date().getTime()}`,
  });

  const { Credentials } = await client.send(command);

  if (!Credentials) {
    throw Error('Error getting assume role credentials');
  }

  return {
    accessKeyId: Credentials.AccessKeyId!,
    secretAccessKey: Credentials.SecretAccessKey!,
    sessionToken: Credentials.SessionToken!,
  };
}
