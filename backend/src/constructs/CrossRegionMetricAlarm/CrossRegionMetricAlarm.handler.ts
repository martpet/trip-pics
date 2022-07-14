import {
  CloudWatchClient,
  DeleteAlarmsCommand,
  PutMetricAlarmCommand,
  PutMetricAlarmCommandInput,
} from '@aws-sdk/client-cloudwatch';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

export interface CrossRegionAlarmHandlerProps {
  region: string;
  putMetricAlarmInput: PutMetricAlarmCommandInput & {
    AlarmName: string;
  };
}

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const { region, putMetricAlarmInput } =
    event.ResourceProperties as unknown as CrossRegionAlarmHandlerProps;

  const { AlarmName } = putMetricAlarmInput;
  const client = new CloudWatchClient({ region });

  if (event.RequestType === 'Delete') {
    return client.send(new DeleteAlarmsCommand({ AlarmNames: [AlarmName] }));
  }

  await client.send(new PutMetricAlarmCommand(putMetricAlarmInput));

  return {
    PhysicalResourceId: AlarmName,
  };
};
