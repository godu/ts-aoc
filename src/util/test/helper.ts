/* eslint-disable ava/use-test */
import {type ExecutionContext} from 'ava';
import {timingIO} from '../debug';

export const resolveInput = (
	t: ExecutionContext,
	part: (input: string) => string,
	input: string,
	expected: string,
) => {
	t.is(timingIO(t.log)('Duration: ')(part)(input), expected);
};
