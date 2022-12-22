import * as A from 'fp-ts/lib/Array';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import type * as E from 'fp-ts/lib/Eq';
import {pipe} from 'fp-ts/lib/function';
import type * as S from 'fp-ts/lib/Show';

export type Point = [number, number];

export const Eq: E.Eq<Point> = {
	equals: ([xx, xy], [yx, yy]) => xx === yx && xy === yy,
};

export const Show: S.Show<Point> = {
	show: ([x, y]: Point): string => `${x}|${y}`,
};

export const range = ([x1, y1]: Point, [x2, y2]: Point): Point[] =>
	pipe(
		NEA.range(Math.min(x1, x2), Math.max(x1, x2)),
		A.chain((x) =>
			pipe(
				NEA.range(Math.min(y1, y2), Math.max(y1, y2)),
				A.map((y): Point => [x, y]),
			),
		),
	);

export const manhattan = ([x1, y1]: Point, [x2, y2]: Point): number =>
	Math.abs(x1 - x2) + Math.abs(y1 - y2);
