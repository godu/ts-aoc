// eslint-disable-next-line ava/no-ignored-test-files
import test from 'ava';
import * as S from 'fp-ts/lib/string';
import * as N from 'fp-ts/lib/number';
import {gaussJordanFloydWarshallMcNaughtonYamada} from '../floyd-warshall';

test('gaussJordanFloydWarshallMcNaughtonYamada', (t) => {
	const graph = new Map([
		[
			'A',
			new Map([
				['B', 1],
				['C', 1],
			]),
		],
		['B', new Map([['C', 1]])],
		[
			'C',
			new Map([
				['A', 2],
				['D', 5],
			]),
		],
		[
			'E',
			new Map([
				['B', 3],
				['A', -2],
			]),
		],
	]);

	t.deepEqual(
		gaussJordanFloydWarshallMcNaughtonYamada(S.Ord, {
			...N.Ord,
			...N.SemigroupSum,
		})(graph),
		{},
	);
});
