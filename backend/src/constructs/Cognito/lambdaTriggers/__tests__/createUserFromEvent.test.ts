import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { getUserPropsFromCognitoEvent } from '../getUserPropsFromCognitoEvent';
import { createUserFromEvent } from '../postConfirmation/createUserFromEvent';
import event from './__fixtures__/postConfirmationEvent';

jest.mock('../getUserPropsFromCognitoEvent');
const ddbMock = mockClient(DynamoDBDocumentClient);
const getUserPropsFromCognitoEventMock = getUserPropsFromCognitoEvent as jest.Mock;

const userProps = { email: 'name@email.com' };
const putCommandInput = { Item: userProps };
const putCommandOutput = { Attributes: userProps };

process.env.usersTableName = 'myTableName';

getUserPropsFromCognitoEventMock.mockReturnValue(userProps);
ddbMock.on(PutCommand).resolves(putCommandOutput);

describe('createUserFromEvent', () => {
  test('Send PutCommand to DynamoDB with correct input', async () => {
    await createUserFromEvent(event);
    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, putCommandInput);
  });

  test('Resolve with output from PutCommand', () => {
    return expect(createUserFromEvent(event)).resolves.toBe(putCommandOutput);
  });
});
