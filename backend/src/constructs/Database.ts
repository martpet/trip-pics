import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct, IConstruct } from 'constructs';

import { AppTable } from '~/constructs';

export class Database extends Construct {
  public usersTable: Table;

  constructor(scope: IConstruct, id: string) {
    super(scope, id);

    this.usersTable = new AppTable(this, 'UsersTable', {
      partitionKey: {
        name: 'username',
        type: AttributeType.STRING,
      },
    });
  }
}
