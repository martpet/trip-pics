import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue, PostAuthenticationTriggerEvent } from 'aws-lambda';

import { UserProps } from '~/types';
import { getChangedProps, getUserPropsFromCognitoEvent } from '~/utils';

const ddbClient = new DynamoDBClient({});
const marshallOptions = { removeUndefinedValues: true };
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, { marshallOptions });
const { usersTableName, usersParitionKey } = process.env;
const usersPKey = usersParitionKey as keyof UserProps;

export async function handler(event: PostAuthenticationTriggerEvent) {
  await updateUserIfNeeded(event);
  return event;
}

async function updateUserIfNeeded(event: PostAuthenticationTriggerEvent) {
  const newProps = getUserPropsFromCognitoEvent(event);
  const oldProps = await fetchUser(newProps);
  const changedProps = getChangedProps(newProps, oldProps);
  if (!changedProps) return undefined;
  return updateUser(changedProps);
}

async function fetchUser(props: UserProps) {
  const params = makeUserTableParams(props);
  const { Item } = await ddbDocClient.send(new GetCommand(params));
  return Item as UserProps;
}

async function updateUser(props: UserProps) {
  const actions: string[] = [];
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, AttributeValue> = {};
  Object.entries(props).forEach(([k, val]) => {
    actions.push(`#${k} = :${k}`);
    ExpressionAttributeNames[`#${k}`] = k;
    ExpressionAttributeValues[`:${k}`] = marshall({ [k]: val });
  });
  const params = {
    ...makeUserTableParams(props),
    UpdateExpression: `set ${actions.join(',')}`,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
  return ddbDocClient.send(new UpdateCommand(params));
}

function makeUserTableParams(props: UserProps) {
  return {
    TableName: usersTableName,
    Key: { [usersPKey]: props[usersPKey] },
  };
}
