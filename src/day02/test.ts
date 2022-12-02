import test from 'ava';
import {resolveInput} from '../util/test/helper';
import part1 from './part1';
import part2 from './part2';

test(
	'part1',
	resolveInput,
	part1,
	`A Y
B X
C Z
`,
	'15',
);

test(
	'part1 extra',
	resolveInput,
	part1,
	`B Y
B Z
A Z
C Y
`,
	'19',
);

test(
	'part2',
	resolveInput,
	part2,
	`A Y
B X
C Z
`,
	'12',
);

test(
	'part2 extra',
	resolveInput,
	part2,
	`A Z
B Z
A X
C X
B Y
C Y
`,
	'33',
);
