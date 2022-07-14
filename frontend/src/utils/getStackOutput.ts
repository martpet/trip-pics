import { cdkCliOutput, stackName } from '~/consts';
import { StackOutput } from '~/types';

type Entry = { [stackName]: StackOutput };

const fromFile = cdkCliOutput as Entry;
const fromWindow = window as typeof window & Entry;
const entry = import.meta.env.DEV ? fromFile : fromWindow;

export const getStackOutput = () => entry[stackName];
