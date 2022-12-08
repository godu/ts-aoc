import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as E from 'fp-ts/lib/Either';
import type * as M from 'fp-ts/lib/Monoid';
import * as N from 'fp-ts/lib/number';
import {stringify} from 'fp-ts/lib/Json';
import {char, parser} from 'parser-ts';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse, transpose} from '../util';

export const inputParser: parser.Parser<string, number[][]> = pipe(
	parser.sepBy1(
		endOfLine,
		pipe(parser.many1(pipe(char.digit, parser.map(Number.parseInt)))),
	),
	parser.apFirst(endOfFile),
);

export const zipzipWith = <A, B, C>(
	fa: A[][],
	fb: B[][],
	f: (a: A, b: B) => C,
) => A.zipWith(fa, fb, (a, b) => A.zipWith(a, b, f));

const isVisible_ = (n: number): ((as: number[]) => Array<O.Option<number>>) =>
	A.matchLeft<Array<O.Option<number>>, number>(constant([]), (head, tail) =>
		head <= n
			? [O.none, ...isVisible_(n)(tail)]
			: [O.some(head), ...isVisible_(head)(tail)],
	);
export const isVisible = (as: number[]) => pipe(as, isVisible_(-1));

export const foldMap =
	<B>(m: M.Monoid<B>) =>
	<A>(f: (a: A) => B) =>
	(fa: A[][]): B =>
		A.foldMap(m)(A.foldMap(m)(f))(fa);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			(as) =>
				zipzipWith(
					zipzipWith(
						pipe(as, transpose, A.map(isVisible), transpose),
						pipe(
							as,
							transpose,
							A.map(flow(A.reverse, isVisible, A.reverse)),
							transpose,
						),
						(north, south) => pipe(north, O.altW(constant(south))),
					),
					zipzipWith(
						pipe(as, A.map(isVisible)),
						pipe(as, A.map(flow(A.reverse, isVisible, A.reverse))),
						(east, west) => pipe(east, O.altW(constant(west))),
					),
					(northSouth, eastWest) =>
						pipe(northSouth, O.altW(constant(eastWest))),
				),
			foldMap(N.MonoidSum)(flow(O.fold(constant(0), constant(1)))),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
