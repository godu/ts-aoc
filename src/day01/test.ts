import test from 'ava';
import {resolveInput} from '../util/test/helper';
import part1 from './part1';
import part2 from './part2';

test(
	'part1',
	resolveInput,
	part1,
	`1000
2000
3000

4000

5000
6000

7000
8000
9000

10000
`,
	'24000',
);
test(
	'part2',
	resolveInput,
	part2,
	`1000
2000
3000

4000

5000
6000

7000
8000
9000

10000
`,
	'45000',
);
