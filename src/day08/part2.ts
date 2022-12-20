import {constant, flow, identity, increment, pipe} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as N from 'fp-ts/lib/number';
import {stringify} from 'fp-ts/lib/Json';
import * as M from 'fp-ts/lib/Monoid';
import {type Solver} from '../type';
import {transpose} from '../util/matrix';
import {parse} from '../util/parser';
import {foldMap, inputParser, zipzipWith} from './part1';

const scenicScore: (as: number[]) => number[] = A.matchLeft(
	constant([]),
	(head: number, tail: number[]) => [
		A.match(constant(0), (tail: number[]) =>
			pipe(
				[...tail],
				A.findIndex((x: number) => x >= head),
				O.fold(constant(A.size(tail)), increment),
			),
		)(tail),
		...scenicScore(tail),
	],
);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			(as) =>
				zipzipWith(
					zipzipWith(
						pipe(as, transpose, A.map(scenicScore), transpose),
						pipe(
							as,
							transpose,
							A.map(flow(A.reverse, scenicScore, A.reverse)),
							transpose,
						),
						N.MonoidProduct.concat,
					),
					zipzipWith(
						pipe(as, A.map(scenicScore)),
						pipe(as, A.map(flow(A.reverse, scenicScore, A.reverse))),
						N.MonoidProduct.concat,
					),
					N.MonoidProduct.concat,
				),
			foldMap(M.max(N.Bounded))(identity),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
