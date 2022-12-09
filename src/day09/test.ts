import test from 'ava';
import {resolveInput} from '../util/test/helper';
import part1 from './part1';
import part2 from './part2';

test(
	'part1',
	resolveInput,
	part1,
	`R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2
`,
	'13',
);
test(
	'part2',
	resolveInput,
	part2,
	`R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20
`,
	'36',
);
