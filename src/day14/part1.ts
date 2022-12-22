import {
	constant,
	constFalse,
	constTrue,
	flow,
	identity,
	pipe,
} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as N from 'fp-ts/lib/number';
import * as M from 'fp-ts/lib/Map';
import * as T from 'fp-ts/lib/Tuple';
import * as SS from 'fp-ts/lib/Set';
import * as SG from 'fp-ts/lib/Semigroup';
import {parser, string} from 'parser-ts';
import * as P from 'fp-ts/lib/Predicate';
import {stringify} from 'fp-ts/lib/Json';
import {type Monoid} from 'fp-ts/lib/Monoid';
import {type Solver} from '../type';
import * as PP from '../util/point';
import {add, endOfFile, endOfLine, parse} from '../util/parser';
import {pairs} from '../util';

export type Wall = Map<number, Set<number>>;
export type Cave = [Wall, Wall];

export const WallUnionMonoid: Monoid<Wall> = M.getUnionMonoid(
	N.Eq,
	SS.getUnionSemigroup(N.Eq),
);

export const wallFromList: (points: PP.Point[]) => Wall = A.reduce(
	new Map<number, Set<number>>(),
	(wall, point) => append(point)(wall),
);

const append =
	([x, y]: PP.Point) =>
	(wall: Wall): Wall =>
		WallUnionMonoid.concat(
			wall,
			new Map<number, Set<number>>([[y, new Set<number>([x])]]),
		);

const member =
	([x, y]: PP.Point) =>
	(as: Wall): boolean =>
		pipe(
			as,
			M.lookup(N.Eq)(y),
			O.map(SS.elem(N.Eq)(x)),
			O.getOrElse(constFalse),
		);

const pointParser: parser.Parser<string, PP.Point> = pipe(
	string.int,
	parser.apFirst(string.string(',')),
	add(string.int),
);

const wallParser: parser.Parser<string, Wall> = pipe(
	parser.sepBy1(string.string(' -> '), pointParser),
	parser.map((v) =>
		pipe(
			v,
			pairs,
			A.chain(([x, y]) => PP.range(x, y)),
			wallFromList,
		),
	),
);

const caveParser: parser.Parser<string, Cave> = pipe(
	parser.sepBy1(endOfLine, wallParser),
	parser.map(
		(walls): Cave => [
			pipe(walls, A.foldMap(WallUnionMonoid)(identity)),
			WallUnionMonoid.empty,
		],
	),
);

export const inputParser = pipe(caveParser, parser.apFirst(endOfFile));

const isFree = (point: PP.Point): P.Predicate<Cave> =>
	pipe(
		P.not<Cave>(flow(T.fst, member(point))),
		P.and(P.not(flow(T.snd, member(point)))),
	);

export const yFloor: (wall: Wall) => O.Option<number> = flow(
	M.keys(N.Ord),
	A.foldMap(O.getMonoid(SG.max(N.Ord)))(O.some),
);

const lowerThan =
	([, y]: PP.Point) =>
	(wall: Wall) =>
		pipe(
			wall,
			yFloor,
			O.fold(constTrue, (yy) => yy < y),
		);

export const gravity =
	(point: PP.Point) =>
	(cave: Cave): O.Option<Cave> => {
		const [walls, points] = cave;
		const [x, y] = point;

		if (!isFree(point)(cave)) return O.none;

		if (lowerThan(point)(walls)) return O.none;

		const down: PP.Point = [x, y + 1];
		if (isFree(down)(cave)) return gravity(down)(cave);

		const diagonalLeft: PP.Point = [x - 1, y + 1];
		if (isFree(diagonalLeft)(cave)) return gravity(diagonalLeft)(cave);

		const diagonalRight: PP.Point = [x + 1, y + 1];
		if (isFree(diagonalRight)(cave)) return gravity(diagonalRight)(cave);

		return O.some([walls, append(point)(points)]);
	};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			(cave) =>
				A.unfold(
					cave,
					flow(
						gravity([500, 0]),
						O.map((cave) => [cave, cave]),
					),
				),
			A.size,
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
