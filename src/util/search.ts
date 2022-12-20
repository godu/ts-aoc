/* eslint-disable @typescript-eslint/no-loop-func */
import {constant, flow, pipe, constVoid} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import type * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as O from 'fp-ts/lib/Option';
import * as Ord from 'fp-ts/lib/Ord';
import * as T from 'fp-ts/lib/Tuple';
import * as N from 'fp-ts/lib/number';
import * as M from 'fp-ts/lib/Map';
import {type Eq} from 'fp-ts/lib/Eq';
import * as I from './iterable';

const dijkstra_ =
	<S>(sEq: Eq<S>) =>
	(next: (state: S) => S[], cost: (from: S, to: S) => number) => {
		type SC = [number, NEA.NonEmptyArray<S>];

		const byCost = pipe(
			N.Ord,
			Ord.contramap<number, [S, SC]>(flow(T.snd, T.fst)),
		);

		return (initial: S) => ({
			*[Symbol.iterator](): Generator<SC> {
				const visitedState = new Map<S, SC>();
				let statesToExplore: Array<[S, SC]> = [[initial, [0, [initial]]]];

				while (statesToExplore.length > 0) {
					const stateToExplore = statesToExplore.shift();
					if (stateToExplore === undefined) return;
					const [s, [c, ss]] = stateToExplore;

					const as = pipe(
						visitedState,
						M.lookup(sEq)(s),
						O.fold<SC, Iterable<SC>>(() => {
							visitedState.set(s, [c, ss]);

							for (const neighbor of next(s)) {
								pipe(
									visitedState,
									M.lookup(sEq)(neighbor),
									O.fold(() => {
										statesToExplore = A.sort(byCost)([
											...statesToExplore,
											[neighbor, [c + cost(s, neighbor), [neighbor, ...ss]]],
										]);
									}, constVoid),
								);
							}

							return I.from([[c, ss]]);
						}, constant(I.from([]))),
					);

					for (const a of as) {
						yield a;
					}
				}
			},
		});
	};

export const dijkstra =
	<S>(sEq: Eq<S>) =>
	(
		next: (state: S) => S[],
		cost: (from: S, to: S) => number,
		found: (state: S) => boolean,
	) =>
		flow(
			dijkstra_(sEq)(next, cost),
			I.findFirst(([c, [s, ...ss]]) => found(s)),
		);
