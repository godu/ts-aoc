import {constant, constFalse, flow, identity, pipe} from 'fp-ts/lib/function';
import type * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import {parser, string} from 'parser-ts';
import {not} from 'fp-ts/lib/Predicate';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {pointEq, type Point} from '../util/matrix';
import {add, endOfFile, endOfLine, parse} from '../util/parser';
import {inRange} from '../day09/part1';
import {traceId} from '../util/debug';

type Wall = NEA.NonEmptyArray<Point>;
type Cave = [Wall[], Point[]];

const pointParser: parser.Parser<string, Point> = pipe(
	string.int,
	parser.apFirst(string.string(',')),
	add(string.int),
);

const wallParser: parser.Parser<
	string,
	NEA.NonEmptyArray<Point>
> = parser.sepBy1(string.string(' -> '), pointParser);

const caveParser: parser.Parser<string, Cave> = pipe(
	parser.sepBy1(endOfLine, wallParser),
	parser.map((walls) => [walls, []]),
);

const inputParser = pipe(caveParser, parser.apFirst(endOfFile));

const inWall =
	(point: Point) =>
	(wall: Wall): boolean => {
		const [x, y] = point;
		const [h, ...tail] = wall;

		return pipe(
			tail,
			A.matchLeft(constFalse, (hh, tail) => {
				const [x1, y1] = h;
				const [x2, y2] = hh;

				return (
					((x1 <= x2 ? inRange(x1, x2)(x) : inRange(x2, x1)(x)) &&
						(y1 <= y2 ? inRange(y1, y2)(y) : inRange(y2, y1)(y))) ||
					inWall(point)([hh, ...tail])
				);
			}),
		);
	};

const isFree = (point: Point) => (cave: Cave) => {
	const [walls, points] = cave;
	return (
		pipe(walls, A.every(pipe(inWall(point), not))) &&
		!A.elem(pointEq)(point)(points)
	);
};

const lowerThan = ([, y]: Point) => A.every<Point>(([, yw]) => y > yw);

const gravity =
	(point: Point) =>
	(cave: Cave): O.Option<Cave> => {
		const [walls, points] = cave;
		const [x, y] = point;

		if (A.every(lowerThan(point))(walls)) return O.none;

		const down: Point = [x, y + 1];
		if (isFree(down)(cave)) return gravity(down)(cave);

		const diagonalLeft: Point = [x - 1, y + 1];
		if (isFree(diagonalLeft)(cave)) return gravity(diagonalLeft)(cave);

		const diagonalRight: Point = [x + 1, y + 1];
		if (isFree(diagonalRight)(cave)) return gravity(diagonalRight)(cave);

		return O.some([walls, [point, ...points]]);
	};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			(cave) => {
				return A.unfold(
					cave,
					flow(
						gravity([500, 0]),
						O.map((cave) => [cave, cave]),
					),
				);
			},
			A.size,
			stringify,
		),
	),
	E.bimap(traceId('error\n'), traceId('result\n')),
	E.fold(constant(''), identity),
);

export default solver;
