import { AttributeValue } from '@aws-sdk/client-dynamodb';

export type TableItem<T> = {
  [P in keyof T]: T[P] extends string
    ? AttributeValue.SMember
    : T[P] extends number
    ? AttributeValue.NMember
    : T[P] extends boolean
    ? AttributeValue.BOOLMember
    : T[P] extends string[]
    ? AttributeValue.SSMember
    : T[P] extends number[]
    ? AttributeValue.NSMember
    : T[P] extends Record<string, string>
    ? AttributeValue.MMember
    : T[P] extends Array<Record<string, string>>
    ? AttributeValue.LMember
    : never;
};
