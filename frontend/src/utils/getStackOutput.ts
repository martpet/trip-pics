import { stackName } from '~/consts';
import { StackOutput } from '~/types';

const response = await fetch('/stack-output.json');
const outputEntries = await response.json();

export const getStackOutput = () => outputEntries[stackName] as StackOutput;
