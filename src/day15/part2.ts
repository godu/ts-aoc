import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as P from 'fp-ts/lib/Predicate';
import * as O from 'fp-ts/lib/Option';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import {stringify} from 'fp-ts/lib/Json';
import * as I from '../util/iterable';
import {type Solver} from '../type';
import * as PP from '../util/point';
import {parse} from '../util/parser';
import {inputParser} from './part1';

const ligne = ([x1, y1]: PP.Point, [x2, y2]: PP.Point) =>
	pipe(
		x1 < x2 ? NEA.range(x1, x2) : pipe(NEA.range(x2, x1), NEA.reverse),
		NEA.zip(y1 < y2 ? NEA.range(y1, y2) : pipe(NEA.range(y2, y1), NEA.reverse)),
	);

export const manhattanCicle = (
	sensor: PP.Point,
	distance: number,
): PP.Point[] => {
	const [sx, sy] = sensor;

	return [
		...ligne([sx + distance, sy], [sx + 1, sy + distance - 1]),
		...ligne([sx, sy + distance], [sx - distance + 1, sy + 1]),
		...ligne([sx - distance, sy], [sx - 1, sy - distance + 1]),
		...ligne([sx, sy - distance], [sx + distance - 1, sy - 1]),
	];
};

const detected = (sensor: PP.Point, beacon: PP.Point) => {
	const distance = PP.manhattan(sensor, beacon);
	return (p: PP.Point): boolean => {
		return PP.manhattan(sensor, p) <= distance;
	};
};

export const createSolver = (maxY: number): Solver =>
	flow(
		parse(inputParser),
		E.chain((pairs) => {
			const detectedByAlmostOneSensor = pipe(
				pairs,
				NEA.foldMap(P.getMonoidAny<PP.Point>())(([sensor, beacon]) =>
					detected(sensor, beacon),
				),
			);
			return pipe(
				pairs,
				I.chain(([sensor, beacon]) => {
					const distance = PP.manhattan(sensor, beacon);
					return I.from(manhattanCicle(sensor, distance + 1));
				}),
				I.filter(PP.inRange([0, 0], [maxY, maxY])),
				I.findFirst(pipe(detectedByAlmostOneSensor, P.not)),
				O.fold(constant(0), ([x, y]) => x * 4_000_000 + y),
				stringify,
			);
		}),
		E.fold(constant(''), identity),
	);

export default createSolver(4_000_000);
