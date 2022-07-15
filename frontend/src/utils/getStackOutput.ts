import { stackName } from '~/consts';
import { CdkOutput } from '~/types';

const response = await fetch('/cdk-output.json');
const cdkOutput: CdkOutput = await response.json();

export const getStackOutput = () => cdkOutput[stackName];
