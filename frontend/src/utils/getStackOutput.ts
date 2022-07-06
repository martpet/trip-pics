import { cdkCliOutput, stackName } from '~/consts';
import { StackOutput } from '~/types';

const outputKey = stackName;

type OutputEntry = { [outputKey]: StackOutput };

const fromFile = cdkCliOutput as OutputEntry;
const fromWindow = window as typeof window & OutputEntry;
const { DEV } = import.meta.env;
const data = (DEV ? fromFile : fromWindow)[outputKey];

export const getStackOutput = () => data;
