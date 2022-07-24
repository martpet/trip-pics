import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { getUserPropsFromCognitoEvent } from '../getUserPropsFromCognitoEvent';
import { updateUserFromEvent } from '../postAuthentication/updateUserFromEvent';
import event from './__fixtures__/postAuthenticationEvent';

jest.mock('../getUserPropsFromCognitoEvent');
const ddbMock = mockClient(DynamoDBDocumentClient);
const getUserPropsFromCognitoEventMock = getUserPropsFromCognitoEvent as jest.Mock;

const tablName = 'myTableName';
const pKey = 'email';
const newUserProps = { [pKey]: 'name@email.com' };
const oldUserProps = { [pKey]: 'new-name@email.com' };
const getCommandInput = { TableName: tablName, Key: newUserProps };
const getCommandOutput = { Item: newUserProps };
const updateCommandInput = { TableName: tablName, Key: oldUserProps };
const updateCommandOutput = { Attributes: oldUserProps };

process.env.usersTableName = tablName;
process.env.usersParitionKey = pKey;

getUserPropsFromCognitoEventMock.mockReturnValue(newUserProps);
ddbMock.on(GetCommand).resolves(getCommandOutput);
ddbMock.on(UpdateCommand).resolves(updateCommandOutput);

describe('updateUserFromEvent', () => {
  test('Send GetCommand to DynamoDB with correct input', async () => {
    await updateUserFromEvent(event);
    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, getCommandInput);
  });

  describe('If user props in event are not new', () => {
    test('Resolve with undefined', async () => {
      return expect(updateUserFromEvent(event)).resolves.toBe(undefined);
    });
  });

  describe('If user props in event are new', () => {
    beforeEach(() => {
      getUserPropsFromCognitoEventMock.mockReturnValue(oldUserProps);
    });

    test('Send UpdateCommand to DynamoDB with correct input', async () => {
      await updateUserFromEvent(event);
      expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, updateCommandInput);
    });

    test('Resolve with output from UpdateCommand', () => {
      return expect(updateUserFromEvent(event)).resolves.toBe(updateCommandOutput);
    });
  });
});
