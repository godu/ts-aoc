/* eslint-disable unicorn/prefer-code-point */
import {constant, flow, identity, pipe, constFalse} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Tuple';
import {char, parser} from 'parser-ts';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse} from '../util/parser';
import * as M from '../util/matrix';
import * as P from '../util/point';
import {dijkstra} from '../util/search';

export type Height = [number, string];
export type HeightMap = M.Matrix<Height>;

const height =
	(n: number) =>
	(c: string): Height =>
		[n, c];
const heightParser: parser.Parser<string, Height> = pipe(
	char.char('S'),
	parser.map(height(1)),
	parser.alt(constant(pipe(char.char('E'), parser.map(height(26))))),
	parser.alt(
		constant(
			pipe(
				char.lower,
				parser.map((c) => [c.charCodeAt(0) - 96, c]),
			),
		),
	),
);

const heightMapParser = pipe(
	parser.sepBy1(endOfLine, pipe(parser.many1(heightParser))),
);

export const inputParser = pipe(heightMapParser, parser.apFirst(endOfFile));

const start = M.findIndex<Height>(([, type]) => type === 'S');
export const neighbors = ([i, j]: P.Point): P.Point[] => [
	[i - 1, j],
	[i, j - 1],
	[i, j + 1],
	[i + 1, j],
];

export const toHeight =
	(heightMap: HeightMap) =>
	(point: P.Point): O.Option<number> =>
		pipe(heightMap, M.lookup(point), O.map(T.fst));

const fewestSteps = (heightMap: HeightMap) => {
	const next = (point: P.Point): P.Point[] => {
		const height = pipe(point, toHeight(heightMap), O.getOrElse(constant(0)));
		return pipe(
			point,
			neighbors,
			A.filter((point) =>
				pipe(
					point,
					toHeight(heightMap),
					O.chain(O.fromPredicate((h) => h <= height + 1)),
					O.isSome,
				),
			),
		);
	};

	const cost = constant(1);

	const found = (point: P.Point): boolean =>
		pipe(
			heightMap,
			M.lookup(point),
			O.fold(constFalse, ([, type]) => type === 'E'),
		);

	return pipe(
		heightMap,
		start,
		O.chain(dijkstra<P.Point>(P.Eq)(next, cost, found)),
		O.map(T.fst),
	);
};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(fewestSteps, O.getOrElse(constant(0)), stringify)),
	E.fold(constant(''), identity),
);

export default solver;
