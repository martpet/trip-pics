import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue, PostAuthenticationTriggerEvent } from 'aws-lambda';

import { UserProps } from '~/types';
import { filterChangedProps } from '~/utils';

import { getUserPropsFromCognitoEvent } from '../getUserPropsFromCognitoEvent';

const marshallOptions = { removeUndefinedValues: true };
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, { marshallOptions });

export const updateUserFromEvent = async (event: PostAuthenticationTriggerEvent) => {
  const newProps = getUserPropsFromCognitoEvent(event);
  const oldProps = await fetchUser(newProps);
  const changedProps = filterChangedProps(newProps, oldProps);
  if (!changedProps) return undefined;
  return updateUser(changedProps);
};

async function fetchUser(props: UserProps) {
  const params = makeUserTableParams(props);
  const { Item } = await ddbDocClient.send(new GetCommand(params));
  return Item as UserProps;
}

function updateUser(props: UserProps) {
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
  const { usersTableName, usersParitionKey } = process.env!;
  const pKey = usersParitionKey as keyof UserProps;
  return {
    TableName: usersTableName,
    Key: { [pKey]: props[pKey] },
  };
}
