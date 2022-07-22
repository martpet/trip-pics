import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PostConfirmationTriggerEvent } from 'aws-lambda';

import { getUserPropsFromCognitoEvent } from '~/utils';

const ddbClient = new DynamoDBClient({});
const marshallOptions = { removeUndefinedValues: true };
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, { marshallOptions });
const { usersTableName } = process.env;

export async function handler(event: PostConfirmationTriggerEvent) {
  await createUser(event);
  return event;
}

async function createUser(event: PostConfirmationTriggerEvent) {
  const params = {
    TableName: usersTableName,
    Item: getUserPropsFromCognitoEvent(event),
  };
  return ddbDocClient.send(new PutCommand(params));
}
