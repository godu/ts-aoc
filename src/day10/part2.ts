import {constant, flow, identity} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import type * as M from 'fp-ts/lib/Monoid';
import {type Solver} from '../type';
import {parse} from '../util/parser';
import {inRange} from '../util';
import {cycles, inputParser} from './part1';

const getMonoidJoin = (char: string): M.Monoid<string> => ({
	empty: '',
	concat: (a: string, b: string): string => `${a}${char}${b}`,
});

const display: (xs: boolean[]) => string = flow(
	A.map((x) => (x ? '#' : '.')),
	A.chunksOf(40),
	A.foldMap(getMonoidJoin('\n'))(A.foldMap(getMonoidJoin(''))(identity)),
);

const solver: Solver = flow(
	parse(inputParser),
	E.map(
		flow(
			cycles,
			A.zip(NEA.range(0, 239)),
			A.map(([registry, pixel]) =>
				inRange(registry - 1, registry + 1)(pixel % 40),
			),
			display,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
