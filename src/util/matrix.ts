import * as A from 'fp-ts/lib/Array';
import {pipe} from 'fp-ts/lib/function';

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
