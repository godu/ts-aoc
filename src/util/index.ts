/* eslint-disable @typescript-eslint/no-redeclare */
import * as A from 'fp-ts/lib/Array';
import * as M from 'fp-ts/lib/Map';
import {type Semigroup} from 'fp-ts/lib/Semigroup';
import {type Eq} from 'fp-ts/lib/Eq';
import {type Foldable1} from 'fp-ts/lib/Foldable';
import {type URIS, type Kind} from 'fp-ts/lib/HKT';

export const formatDay = (day: number | string) =>
	day.toString().padStart(2, '0');

export const tuple =
	<B>(b: B) =>
	<A>(a: A): [A, B] =>
		[a, b];

export const groupBy =
	<K, F extends URIS, A>(E: Eq<K>, F: Foldable1<F>, S: Semigroup<A>) =>
	(ak: (a: A) => K) =>
	(as: Kind<F, A>): Map<K, A> =>
		F.foldMap(M.getMonoid(E, S))<A>(as, (a) => M.singleton(ak(a), a));

export const pairs = <A>(a: A[]) => A.zip(a, A.dropLeft(1)(a));
