/* eslint-disable @typescript-eslint/naming-convention */
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PostConfirmationTriggerEvent } from 'aws-lambda';

import { CognitoUserProps, TableItem } from '~/types';

import { getCognitoUserProps } from './getCognitoUserProps';

export const handler = async (event: PostConfirmationTriggerEvent) => {
  const client = new DynamoDBClient({});

  const props = getCognitoUserProps(event);

  const usersTableItem: TableItem<CognitoUserProps> = {
    username: { S: props.username },
    sub: { S: props.sub },
    provider: { S: props.provider },
    givenName: { S: props.givenName },
    familyName: { S: props.familyName },
    picture: { S: props.picture },
    email: { S: props.email },
    dateCreated: { N: String(props.dateCreated) },
  };

  const putItemCommand = new PutItemCommand({
    TableName: process.env.usersTableName,
    Item: usersTableItem,
  });

  const response = await client.send(putItemCommand);

  console.log(response);

  return event;
};
