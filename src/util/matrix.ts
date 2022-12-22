import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import {pipe} from 'fp-ts/lib/function';
import {type Predicate} from 'fp-ts/lib/Predicate';
import {type Point} from './point';

export type Matrix<A> = A[][];

const combine = <A>(y: A, h: A[], ys: A[], t: Matrix<A>) => [
	[y, ...h],
	...transpose([ys, ...t]),
];

export const transpose = <A>(_: Matrix<A>): Matrix<A> =>
	A.matchLeft<Matrix<A>, A[]>(
		() => [],
		(x, xss) =>
			A.matchLeft<Matrix<A>, A>(
				() => transpose(xss),
				(x, xs) => {
					const [hds, tls] = pipe(
						xss,
						A.map<A[], [A, A[]]>(
							A.matchLeft<[A, A[]], A>(
								() => {
									throw new TypeError('Lists must be the same length');
								},
								(hd, tl) => [hd, tl],
							),
						),
						A.unzip,
					);
					return combine<A>(x, hds, xs, tls);
				},
			)(x),
	)(_);

export const lookup =
	([i, j]: Point) =>
	<A>(xss: Matrix<A>) =>
		pipe(xss, A.lookup(i), O.chain(A.lookup(j)));

export const findIndex =
	<A>(p: Predicate<A>) =>
	(xss: Matrix<A>): O.Option<Point> => {
		for (const [i, xs] of xss.entries()) {
			for (const [j, x] of xs.entries()) {
				if (p(x)) return O.some([i, j]);
			}
		}

		return O.none;
	};
