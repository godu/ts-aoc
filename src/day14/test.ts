import test from 'ava';
import {resolveInput} from '../util/test/helper';
import part1 from './part1';
import part2 from './part2';

test(
	'part1',
	resolveInput,
	part1,
	`498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`,
	'24',
);
test(
	'part2',
	resolveInput,
	part2,
	`498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`,
	'93',
);
