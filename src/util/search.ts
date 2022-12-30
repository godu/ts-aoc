/* eslint-disable @typescript-eslint/no-loop-func */
import {constant, flow, pipe, constVoid} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as O from 'fp-ts/lib/Option';
import * as M from 'fp-ts/lib/Map';
import * as T from 'fp-ts/lib/Tuple';
import {type Eq} from 'fp-ts/lib/Eq';
import {type Monoid} from 'fp-ts/lib/Monoid';
import * as Ord from 'fp-ts/lib/Ord';
import * as I from './iterable';

const generalizedSearch = <State, Cost>(
	sEq: Eq<State>,
	cMonoid: Monoid<Cost>,
) => {
	type StatesWithCost = NEA.NonEmptyArray<[Cost, State]>;
	return (
		next: (state: State) => State[],
		cost: (from: State, to: State) => Cost,
		better: (a: StatesWithCost, b: StatesWithCost) => boolean,
	) => {
		return (initial: State): Iterable<StatesWithCost> => ({
			*[Symbol.iterator](): Generator<StatesWithCost> {
				const visitedState = new Map<State, StatesWithCost>();
				let toExplore: StatesWithCost[] = [NEA.of([cMonoid.empty, initial])];

				while (toExplore.length > 0) {
					const bestState = pipe(
						toExplore,
						A.foldMap(
							O.getMonoid<StatesWithCost>({
								concat: (a, b) => (better(a, b) ? b : a),
							}),
						)(O.some),
					);

					if (O.isNone(bestState)) return;
					const [[cost_, state], ...statesWithCost] = bestState.value;
					toExplore = pipe(
						toExplore,
						A.filter((a) => a !== bestState.value),
					);

					const as = pipe(
						visitedState,
						M.lookup(sEq)(state),
						O.fold<StatesWithCost, Iterable<StatesWithCost>>(() => {
							visitedState.set(state, [[cost_, state], ...statesWithCost]);

							for (const neighbor of next(state)) {
								pipe(
									visitedState,
									M.lookup(sEq)(neighbor),
									O.fold(() => {
										toExplore.push([
											[cMonoid.concat(cost_, cost(state, neighbor)), neighbor],
											...bestState.value,
										]);
									}, constVoid),
								);
							}

							return I.of(bestState.value);
						}, constant(I.empty())),
					);

					for (const a of as) {
						yield a;
					}
				}
			},
		});
	};
};

export const dijkstra = <State, Cost>(
	sOrd: Ord.Ord<State>,
	cMonoidOrd: Monoid<Cost> & Ord.Ord<Cost>,
) => {
	type StatesWithCost = NEA.NonEmptyArray<[Cost, State]>;
	const statesWithCostOrd: Ord.Ord<StatesWithCost> =
		Ord.getSemigroup<StatesWithCost>().concat(
			pipe(cMonoidOrd, Ord.contramap(flow(NEA.head, T.fst))),
			pipe(sOrd, Ord.contramap(flow(NEA.head, T.snd))),
		);
	return (
		next: (state: State) => State[],
		cost: (from: State, to: State) => Cost,
		found: (state: State) => boolean,
	) =>
		flow(
			generalizedSearch(sOrd, cMonoidOrd)(next, cost, (a, b) => {
				return statesWithCostOrd.compare(a, b) === 1;
			}),
			I.findFirst(([[, s]]) => found(s)),
			O.map<StatesWithCost, [Cost, NEA.NonEmptyArray<State>]>(
				([[cost, state], ...rest]): [Cost, NEA.NonEmptyArray<State>] => [
					cost,
					pipe(rest, A.map(T.snd), A.prepend(state)),
				],
			),
		);
};
