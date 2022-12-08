import test from 'ava';
import {resolveInput} from '../util/test/helper';
import part1 from './part1';
import part2 from './part2';

test(
	'part1',
	resolveInput,
	part1,
	`30373
25512
65332
33549
35390
`,
	'21',
);
test(
	'part2',
	resolveInput,
	part2,
	`30373
25512
65332
33549
35390
`,
	'8',
);
