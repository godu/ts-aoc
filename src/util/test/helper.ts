// eslint-disable-next-line ava/use-test
import {type ExecutionContext} from 'ava';

export const resolveInput = (
	t: ExecutionContext,
	part: (input: string) => string,
	input: string,
	expected: string,
) => {
	t.is(part(input), expected);
};
