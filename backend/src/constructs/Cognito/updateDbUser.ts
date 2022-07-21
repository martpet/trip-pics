import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { SchemaOptions } from 'aws-cdk-lib/aws-dynamodb';

import { MutableCognitoUserProps, UserPropsFromCognitoEvent } from './cognitoTypes';

export async function updateDbUser({
  username,
  givenName,
  familyName,
  picture,
  email,
}: UserPropsFromCognitoEvent) {
  const { usersTableName, usersTableSchemaJson } = process.env;
  const { partitionKey: pk } = JSON.parse(usersTableSchemaJson!) as SchemaOptions;
  const usersTableKey = {
    [pk.name]: { [pk.type]: username } as unknown as AttributeValue,
  };

  const mutableProps: MutableCognitoUserProps = {
    givenName,
    familyName,
    picture,
    email,
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
    if (newVal && newVal !== oldVal) {
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
