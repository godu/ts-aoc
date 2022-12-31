import {constant, flow, pipe, constTrue} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as B from 'fp-ts/lib/boolean';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as O from 'fp-ts/lib/Option';
import * as S from 'fp-ts/lib/Set';
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
		) =>
		(initial: State): Iterable<StatesWithCost> =>
			pipe(
				I.unfold<O.Option<StatesWithCost>, [Set<State>, StatesWithCost[]]>(
					[new Set<State>(), [NEA.of([cMonoid.empty, initial])]],
					([visitedState, toExplore]) => {
						const bestState = pipe(
							toExplore,
							A.foldMap(
								O.getMonoid<StatesWithCost>({
									concat: (a, b) => (better(a, b) ? b : a),
								}),
							)(O.some),
						);

						if (O.isNone(bestState)) return O.none;

						const [[cost_, state]] = bestState.value;
						const resttoExplore = pipe(
							toExplore,
							A.filter((a) => a !== bestState.value),
						);

						return pipe(
							visitedState,
							S.elem(sEq)(state),
							B.match(() => {
								return O.some([
									O.some(bestState.value),
									[
										S.insert(sEq)(state)(visitedState),
										pipe(
											next(state),
											A.foldMap(A.getMonoid<StatesWithCost>())((neighbor) =>
												pipe(
													visitedState,
													S.elem(sEq)(neighbor),
													B.match(
														() => [
															[
																[
																	cMonoid.concat(cost_, cost(state, neighbor)),
																	neighbor,
																],
																...bestState.value,
															],
														],
														constant([]),
													),
												),
											),
											A.concat(resttoExplore),
										),
									],
								]);
							}, constant(O.some([O.some(bestState.value), [visitedState, resttoExplore]]))),
						);
					},
				),
				I.foldMap(I.getMonoid<StatesWithCost>())(
					O.match<StatesWithCost, Iterable<StatesWithCost>>(I.empty, I.of),
				),
			);
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
	): ((initial: State) => O.Option<[Cost, NEA.NonEmptyArray<State>]>) =>
		flow(
			generalizedSearch(sOrd, cMonoidOrd)(
				next,
				cost,
				(a, b) => statesWithCostOrd.compare(a, b) === 1,
			),
			I.findFirst(([[, s]]) => found(s)),
			O.map(([[cost, state], ...rest]) => [
				cost,
				pipe(rest, A.map(T.snd), A.prepend(state)),
			]),
		);
};

export const dfs = <State, Cost>(
	sEq: Eq<State>,
	cMonoidOrd: Monoid<Cost> & Ord.Ord<Cost>,
) => {
	return (
		next: (state: State) => State[],
		cost: (from: State, to: State) => Cost,
		found: (state: State) => boolean,
	): ((initial: State) => Iterable<NEA.NonEmptyArray<State>>) =>
		flow(
			generalizedSearch(sEq, cMonoidOrd)(next, cost, constTrue),
			I.filter(([[, s]]) => found(s)),
			I.map(NEA.map(T.snd)),
		);
};

export const dfs = <State, Cost>(
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
	): ((initial: State) => Iterable<NEA.NonEmptyArray<State>>) =>
		flow(
			generalizedSearch(sOrd, cMonoidOrd)(next, cost, (a, b) => {
				return statesWithCostOrd.compare(a, b) === 1;
			}),
			I.filter(([[, s]]) => found(s)),
			I.map(NEA.map(T.snd)),
		);
};
