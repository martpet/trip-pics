import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { SchemaOptions } from 'aws-cdk-lib/aws-dynamodb';
import { PostAuthenticationTriggerEvent } from 'aws-lambda';

import { CognitoUserProps, MutableCognitoUsersProps } from './authTypes';
import { getCognitoUserProps } from './getCognitoUserProps';

type HandlerEvent = PostAuthenticationTriggerEvent;

export const handler = async (event: HandlerEvent) => {
  const props = getCognitoUserProps(event);

  if (props.provider === 'Google') {
    await updateUsersTable(props);
  }
  return event;
};

async function updateUsersTable(props: CognitoUserProps) {
  const { username, givenName, familyName, picture, email } = props;

  const mutableProps: MutableCognitoUsersProps = {
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

  return client.send(updateItemCommand);
}
