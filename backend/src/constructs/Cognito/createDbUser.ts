import { AttributeValue, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { UsersTable } from './cognitoTypes';

export const createDbUser = async (props: UsersTable) => {
  const client = new DynamoDBClient({});

  const ddbTypesMap: Record<string, string> = {
    string: 'S',
    number: 'N',
  };

  const tableItem = {} as Record<string, AttributeValue>;

  Object.entries(props).forEach(([key, val]) => {
    const ddbType = ddbTypesMap[typeof val];
    if (!ddbType) return;

    tableItem[key] = {
      [ddbType]: String(val),
    } as unknown as AttributeValue;
  });

  const putItemCommand = new PutItemCommand({
    TableName: process.env.usersTableName,
    Item: tableItem,
  });

  return client.send(putItemCommand);
};
