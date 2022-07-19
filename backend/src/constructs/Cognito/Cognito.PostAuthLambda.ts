import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { SchemaOptions } from 'aws-cdk-lib/aws-dynamodb';
import { PostAuthenticationTriggerEvent } from 'aws-lambda';

import { MutableCognitoUserProps } from './cognitoTypes';
import { getCognitoUserProps } from './getCognitoUserProps';

export const handler = async (event: PostAuthenticationTriggerEvent) => {
  const props = getCognitoUserProps(event);
  const { provider } = props;

  if (provider === 'Google') {
    await updateUsersTable(event);
  }
  return event;
};

async function updateUsersTable(event: PostAuthenticationTriggerEvent) {
  const { username, givenName, familyName, picture, email } = getCognitoUserProps(event);

  const mutableProps: MutableCognitoUserProps = {
    givenName,
    familyName,
    picture,
    email,
  };

  const { usersTableName, usersTableSchemaJson } = process.env;
  const { partitionKey } = JSON.parse(usersTableSchemaJson!) as SchemaOptions;
  const usersTableKey = {
    [partitionKey.name]: {
      [partitionKey.type]: username,
    } as unknown as AttributeValue,
  };

  const getItemCommand = new GetItemCommand({
    TableName: usersTableName,
    Key: usersTableKey,
    AttributesToGet: Object.keys(mutableProps),
  });

  const client = new DynamoDBClient({});
  const { Item } = await client.send(getItemCommand);

  if (!Item) {
    return undefined;
  }

  const expressionActions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, AttributeValue> = {};

  Object.entries(mutableProps).forEach(([propName, newVal]) => {
    const [dataType, oldVal] = Object.entries(Item[propName])[0];
    if (newVal !== oldVal) {
      expressionActions.push(`#${propName} = :${propName}`);
      expressionAttributeNames[`#${propName}`] = propName;
      expressionAttributeValues[`:${propName}`] = {
        [dataType]: newVal,
      } as unknown as AttributeValue;
    }
  });

  if (!expressionActions.length) {
    return undefined;
  }

  const updateItemCommand = new UpdateItemCommand({
    TableName: usersTableName,
    Key: usersTableKey,
    UpdateExpression: `set ${expressionActions.join(',')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  const response = await client.send(updateItemCommand);

  console.log(response);

  return event;
}
