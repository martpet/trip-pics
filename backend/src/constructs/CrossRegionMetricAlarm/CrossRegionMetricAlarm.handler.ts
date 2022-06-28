import {
  CloudWatchClient,
  DeleteAlarmsCommand,
  PutMetricAlarmCommand,
  PutMetricAlarmCommandInput,
} from '@aws-sdk/client-cloudwatch';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

export interface CrossRegionAlarmHandlerProps {
  region: string;
  input: PutMetricAlarmCommandInput & {
    AlarmName: string;
  };
}

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const props = event.ResourceProperties as unknown as CrossRegionAlarmHandlerProps;
  const { region, input } = props;
  const { AlarmName } = input;
  const client = new CloudWatchClient({ region });

  if (event.RequestType === 'Delete') {
    return client.send(new DeleteAlarmsCommand({ AlarmNames: [AlarmName] }));
  }

  await client.send(new PutMetricAlarmCommand(input));

  return {
    PhysicalResourceId: AlarmName,
  };
};
