import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { TableItem, UserPropsFromCognito } from './cognitoTypes';

export const createDbUser = async (props: UserPropsFromCognito) => {
  const client = new DynamoDBClient({});

  const item: TableItem<typeof props> = {
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
    Item: item,
  });

  return client.send(putItemCommand);
};
