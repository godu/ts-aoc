import {constant, constFalse, flow, identity, pipe} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Tuple';
import * as N from 'fp-ts/lib/number';
import {stringify} from 'fp-ts/lib/Json';
import {parse} from '../util/parser';
import {type Solver} from '../type';
import * as M from '../util/matrix';
import * as P from '../util/point';
import {dijkstra} from '../util/search';
import {
	type HeightMap,
	inputParser,
	toHeight,
	neighbors,
	type Height,
} from './part1';

const end = M.findIndex<Height>(([, type]) => type === 'E');

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
					O.chain(O.fromPredicate((h) => h >= height - 1)),
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
			O.fold(constFalse, ([, type]) => type === 'a'),
		);

	return pipe(
		heightMap,
		end,
		O.chain(
			dijkstra<P.Point, number>(P.Ord, {...N.MonoidSum, ...N.Ord})(
				next,
				cost,
				found,
			),
		),
		O.map(T.fst),
	);
};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(fewestSteps, O.getOrElse(constant(0)), stringify)),
	E.fold(constant(''), identity),
);

export default solver;
