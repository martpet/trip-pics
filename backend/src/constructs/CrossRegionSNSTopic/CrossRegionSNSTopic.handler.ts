import {
  CreateTopicCommand,
  CreateTopicCommandInput,
  DeleteTopicCommand,
  SNSClient,
  SubscribeCommand,
  SubscribeCommandInput,
} from '@aws-sdk/client-sns';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

export interface CrossRegionSNSTopicHandlerProps {
  region: string;
  createTopicInput: CreateTopicCommandInput & {
    Name: string;
  };
  subscribeInputs?: Array<Omit<SubscribeCommandInput, 'TopicArn'>>;
}

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const props = event.ResourceProperties as unknown as CrossRegionSNSTopicHandlerProps;
  const { region, createTopicInput, subscribeInputs } = props;
  const client = new SNSClient({ region });

  if (event.RequestType === 'Delete') {
    const TopicArn = event.PhysicalResourceId;
    return client.send(new DeleteTopicCommand({ TopicArn }));
  }

  const { TopicArn } = await client.send(new CreateTopicCommand(createTopicInput));

  if (subscribeInputs) {
    const promises = subscribeInputs.map((input) =>
      client.send(new SubscribeCommand({ ...input, TopicArn }))
    );
    await Promise.all(promises);
  }

  return {
    PhysicalResourceId: TopicArn,
    Data: { TopicArn },
  };
};
