import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PostConfirmationTriggerEvent } from 'aws-lambda';

import { getUserPropsFromCognitoEvent } from '../getUserPropsFromCognitoEvent';

const marshallOptions = { removeUndefinedValues: true };
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, { marshallOptions });

export const createUserFromEvent = async (event: PostConfirmationTriggerEvent) => {
  const params = {
    TableName: process.env.usersTableName,
    Item: getUserPropsFromCognitoEvent(event),
  };
  return ddbDocClient.send(new PutCommand(params));
};
