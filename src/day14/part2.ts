import {constant, flow, identity, increment, pipe} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {parse} from '../util/parser';
import {pointRange} from '../util/matrix';
import {
	type Cave,
	gravity,
	inputParser,
	yFloor,
	WallUnionMonoid,
	wallFromList,
} from './part1';

const addFloor = ([walls, points]: Cave): O.Option<Cave> =>
	pipe(
		walls,
		yFloor,
		O.map(flow(increment, increment)),

		O.map(
			(yFloor): Cave => [
				WallUnionMonoid.concat(
					wallFromList(
						pointRange([500 - yFloor, yFloor], [500 + yFloor, yFloor]),
					),
					walls,
				),
				points,
			],
		),
	);

const solver: Solver = flow(
	parse(inputParser),
	E.chainOptionK(constant(''))(addFloor),
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
	E.fold(constant(''), identity),
);
export default solver;
