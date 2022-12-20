import * as A from 'fp-ts/lib/Array';
import * as M from 'fp-ts/lib/Map';
import {pipe} from 'fp-ts/lib/function';
import {type Semigroup} from 'fp-ts/lib/Semigroup';
import {type Eq} from 'fp-ts/lib/Eq';

export const formatDay = (day: number | string) =>
	day.toString().padStart(2, '0');

export const tuple =
	<B>(b: B) =>
	<A>(a: A): [A, B] =>
		[a, b];

export const groupBy =
	<K, A>(E: Eq<K>, S: Semigroup<A>) =>
	(ak: (a: A) => K) =>
	(as: A[]): Map<K, A> =>
		pipe(
			as,
			A.foldMap(M.getMonoid(E, S))((a) => M.singleton(ak(a), a)),
		);
