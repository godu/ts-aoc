/* eslint-disable ava/no-ignored-test-files */
import test from 'ava';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';
import * as O from 'fp-ts/lib/Option';
import {dijkstra} from '../search';

test('dijkstra', (t) => {
	type Vertice = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

	const next = (vertice: Vertice): Vertice[] => {
		switch (vertice) {
			case 'A': {
				return ['B', 'C', 'F'];
			}

			case 'B': {
				return ['C', 'D'];
			}

			case 'C': {
				return ['D', 'F'];
			}

			case 'D': {
				return ['E'];
			}

			case 'E': {
				return ['F'];
			}

			default: {
				return [];
			}
		}
	};

	const cost = (from: Vertice, to: Vertice): number => {
		if (from === 'A') {
			if (to === 'B') return 7;
			if (to === 'C') return 9;
			if (to === 'F') return 14;
		}

		if (from === 'B') {
			if (to === 'C') return 10;
			if (to === 'D') return 15;
		}

		if (from === 'C') {
			if (to === 'D') return 11;
			if (to === 'F') return 2;
		}

		if (from === 'D' && to === 'E') return 6;
		if (from === 'E' && to === 'F') return 9;

		return 0;
	};

	const found = (vertice: Vertice) => vertice === 'F';

	t.deepEqual(
		dijkstra<Vertice, number>(S.Ord, {...N.Ord, ...N.MonoidSum})(
			next,
			cost,
			found,
		)('A'),
		O.some([11, ['F', 'C', 'A']]),
	);
});
