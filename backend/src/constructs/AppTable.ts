import { BillingMode, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb';
import { IConstruct } from 'constructs';

import { UserProps } from '~/types';

interface AppTableProps extends Omit<TableProps, 'partitionKey'> {
  partitionKey: {
    name: keyof UserProps;
    type: TableProps['partitionKey']['type'];
  };
  billingMode?: TableProps['billingMode'];
}

export class AppTable extends Table {
  constructor(scope: IConstruct, id: string, props: AppTableProps) {
    super(scope, id, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      ...props,
    });
  }
}
