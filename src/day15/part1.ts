/* eslint-disable unicorn/no-array-reduce */
import {constant, flow, identity, increment, pipe} from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as N from 'fp-ts/lib/number';
import * as T from 'fp-ts/lib/Tuple';
import * as P from 'fp-ts/lib/Predicate';
import {parser, string} from 'parser-ts';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import * as PP from '../util/point';
import {add, endOfFile, endOfLine, parse} from '../util/parser';
import {inRange} from '../util';

const sensorParser = pipe(
	string.string('Sensor at x='),
	parser.apSecond(string.int),
	parser.apFirst(string.string(', y=')),
	add(string.int),
);

const beaconParser = pipe(
	string.string('closest beacon is at x='),
	parser.apSecond(string.int),
	parser.apFirst(string.string(', y=')),
	add(string.int),
);

const rowParser = pipe(
	sensorParser,
	parser.apFirst(string.string(': ')),
	add(beaconParser),
);

export const inputParser = pipe(
	parser.sepBy1(endOfLine, rowParser),
	parser.apFirst(endOfFile),
);

type Range = [number, number];

const rowY =
	([x, y]: PP.Point, m: number) =>
	(r: number): Range[] => {
		const dy = Math.abs(r - y);
		const dx = m - dy;

		if (dx < 0) return [];
		return [[x - dx, x + dx]];
	};

export const createSolver = (y: number): Solver =>
	flow(
		parse(inputParser),
		E.chain((rows) => {
			const sensors = pipe(
				rows,
				A.map(T.fst),
				A.filter(([, d]) => d === y),
				A.uniq(PP.Eq),
			);
			const beacons = pipe(
				rows,
				A.map(T.snd),
				A.filter(([, d]) => d === y),
				A.uniq(PP.Eq),
			);
			return pipe(
				rows,
				A.foldMap(A.getMonoid<PP.Point>())(([sensor, beacon]) => {
					const m = PP.manhattan(sensor, beacon);
					return rowY(sensor, m)(y);
				}),
				A.reduce<Range, Range[]>([], (ranges, range) => {
					const {left: toSplit, right: toKeep} = pipe(
						ranges,
						A.partition(([l, r]: Range) => range[0] > r || range[1] < l),
					);

					return A.append(
						pipe(
							toSplit,
							A.reduce<Range, Range>(range, ([l1, r1], [l2, r2]) => [
								Math.min(l1, l2),
								Math.max(r1, r2),
							]),
						),
					)(toKeep);
				}),
				(ranges: Range[]): number => {
					const beaconInRange = pipe(
						ranges,
						A.foldMap(P.getMonoidAny<PP.Point>())(
							(range): P.Predicate<PP.Point> => flow(T.fst, inRange(...range)),
						),
					);
					const foo = pipe(
						sensors,
						A.concat(beacons),
						A.filter(beaconInRange),
						A.size,
					);

					return pipe(
						ranges,
						A.foldMap(N.MonoidSum)(([l, r]) => r - l),
						increment,
						(v) => v - foo,
					);
				},
				stringify,
			);
		}),
		E.fold(constant(''), identity),
	);

export default createSolver(2_000_000);
