/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable @typescript-eslint/no-redeclare */
import {type Foldable1} from 'fp-ts/lib/Foldable';
import {type Functor1} from 'fp-ts/lib/Functor';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as E from 'fp-ts/lib/Either';
import {type Monoid} from 'fp-ts/lib/Monoid';
import {type Predicate, not} from 'fp-ts/lib/Predicate';
import {type Chain1} from 'fp-ts/lib/Chain';
import {type Apply1} from 'fp-ts/lib/Apply';
import {type Applicative1} from 'fp-ts/lib/Applicative';
import {type Filterable1} from 'fp-ts/lib/Filterable';
import * as S from 'fp-ts/lib/Separated';
import {type Refinement} from 'fp-ts/lib/Refinement';
import {constFalse, pipe} from 'fp-ts/lib/function';
import {type Compactable1} from 'fp-ts/lib/Compactable';
import {type Unfoldable1} from 'fp-ts/lib/Unfoldable';

export const URI = 'Iterable';

export declare type URI = typeof URI;

declare module 'fp-ts/lib/HKT' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface URItoKind<A> {
		readonly [URI]: Iterable<A>;
	}
}

export const of = <A>(a: A): Iterable<A> => ({
	*[Symbol.iterator]() {
		yield a;
	},
});

export const from = <A>(as: Iterable<A>): Iterable<A> => ({
	*[Symbol.iterator]() {
		for (const a of as) {
			yield a;
		}
	},
});

export const map =
	<A, B>(f: (a: A) => B) =>
	(as: Iterable<A>): Iterable<B> => ({
		*[Symbol.iterator]() {
			for (const a of as) {
				yield f(a);
			}
		},
	});

export const Functor: Functor1<URI> = {
	URI,
	map: (fa, f) => map(f)(fa),
};

export const reduce: <A, B>(
	b: B,
	f: (b: B, a: A) => B,
) => (fa: Iterable<A>) => B = (b, f) => (fa) => {
	let out = b;

	for (const a of fa) {
		out = f(out, a);
	}

	return out;
};

export const foldMap =
	<M>(M: Monoid<M>) =>
	<A>(f: (a: A) => M) =>
	(fa: Iterable<A>): M => {
		let out = M.empty;

		for (const a of fa) {
			out = M.concat(out, f(a));
		}

		return out;
	};

export const Foldable: Foldable1<URI> = {
	URI,
	reduce: (fa, b, f) => reduce(b, f)(fa),
	foldMap: (M) => (fa, f) => foldMap(M)(f)(fa),
	reduceRight(fa, b, f) {
		const as = Array.from(fa);
		return A.reduceRight(b, f)(as);
	},
};

export const ap =
	<A>(fa: Iterable<A>) =>
	<B>(fab: Iterable<(a: A) => B>): Iterable<B> => ({
		*[Symbol.iterator]() {
			for (const a of fa) {
				for (const ab of fab) {
					yield ab(a);
				}
			}
		},
	});

export const Apply: Apply1<URI> = {
	...Functor,
	ap: (fab, fa) => ap(fa)(fab),
};

export const Applicative: Applicative1<URI> = {
	...Apply,
	of,
};

export const chain =
	<A, B>(f: (a: A) => Iterable<B>) =>
	(ma: Iterable<A>): Iterable<B> => ({
		*[Symbol.iterator]() {
			for (const a of ma) {
				yield* f(a);
			}
		},
	});

export const Chain: Chain1<URI> = {
	...Apply,
	chain: (fa, f) => chain(f)(fa),
};

export const findFirst =
	<T>(p: Predicate<T>) =>
	(i: Iterable<T>): O.Option<T> => {
		for (const j of i) {
			if (p(j)) return O.some(j);
		}

		return O.none;
	};

export const compact = <A>(fa: Iterable<O.Option<A>>): Iterable<A> =>
	pipe(
		fa,
		filter(O.isSome),
		map(({value}) => value),
	);

export const separate = <A, B>(
	fa: Iterable<E.Either<A, B>>,
): S.Separated<Iterable<A>, Iterable<B>> =>
	S.separated(
		pipe(
			fa,
			filter(E.isLeft),
			map(({left}) => left),
		),
		pipe(
			fa,
			filter(E.isRight),
			map(({right}) => right),
		),
	);

export const Compactable: Compactable1<URI> = {
	URI,
	compact,
	separate,
};

export const filter: {
	<A, B extends A>(refinement: Refinement<A, B>): (
		as: Iterable<A>,
	) => Iterable<B>;
	<A>(predicate: Predicate<A>): <B extends A>(bs: Iterable<B>) => Iterable<B>;
	<A>(predicate: Predicate<A>): (as: Iterable<A>) => Iterable<A>;
} =
	<A>(predicate: Predicate<A>) =>
	(as: Iterable<A>) => ({
		*[Symbol.iterator]() {
			for (const a of as) {
				if (predicate(a)) yield a;
			}
		},
	});

export const filterMap =
	<A, B>(f: (a: A) => O.Option<B>) =>
	(fa: Iterable<A>): Iterable<B> => ({
		*[Symbol.iterator]() {
			for (const a of fa) {
				const ob = f(a);
				if (O.isSome(ob)) yield ob.value;
			}
		},
	});

export const partition: {
	<A, B extends A>(refinement: Refinement<A, B>): (
		as: Iterable<A>,
	) => S.Separated<Iterable<A>, Iterable<B>>;
	<A>(predicate: Predicate<A>): <B extends A>(
		bs: Iterable<B>,
	) => S.Separated<Iterable<B>, Iterable<B>>;
	<A>(predicate: Predicate<A>): (
		as: Iterable<A>,
	) => S.Separated<Iterable<A>, Iterable<A>>;
} =
	<A>(predicate: Predicate<A>) =>
	(as: Iterable<A>): S.Separated<Iterable<A>, Iterable<A>> => {
		return S.separated(filter(predicate)(as), filter(not(predicate))(as));
	};

export const partitionMap =
	<A, B, C>(f: (a: A) => E.Either<B, C>) =>
	(fa: Iterable<A>): S.Separated<Iterable<B>, Iterable<C>> => {
		return S.separated(
			pipe(
				fa,
				map(f),
				filter(E.isLeft),
				map(({left}) => left),
			),
			pipe(
				fa,
				map(f),
				filter(E.isRight),
				map(({right}) => right),
			),
		);
	};

export const Filterable: Filterable1<URI> = {
	...Functor,
	...Compactable,
	filter: <A>(fa: Iterable<A>, predicate: Predicate<A>) =>
		filter(predicate)(fa),
	filterMap: <A, B>(fa: Iterable<A>, f: (a: A) => O.Option<B>) =>
		filterMap(f)(fa),
	partition: <A>(fa: Iterable<A>, predicate: Predicate<A>) =>
		partition(predicate)(fa),
	partitionMap: <A, B, C>(fa: Iterable<A>, f: (a: A) => E.Either<B, C>) =>
		partitionMap(f)(fa),
};

export const concat =
	<A>(second: Iterable<A>) =>
	(first: Iterable<A>): Iterable<A> => ({
		*[Symbol.iterator]() {
			yield* first;
			yield* second;
		},
	});

export const getMonoid = <A>(): Monoid<Iterable<A>> => ({
	empty: from([]),
	concat: (x, y) => concat(y)(x),
});

export const take =
	(n: number) =>
	<T>(iter: Iterable<T>) => ({
		*[Symbol.iterator]() {
			if (n <= 0) return;
			let i = n;
			for (const o of iter) {
				yield o;
				i--;
				if (i <= 0) return;
			}
		},
	});

export const unfold = <A, B>(
	b: B,
	f: (b: B) => O.Option<readonly [A, B]>,
): Iterable<A> => ({
	*[Symbol.iterator]() {
		let bb = b;
		while (true) {
			const orn = f(b);

			if (O.isNone(orn)) return;

			const [r, n] = orn.value;
			yield r;
			bb = n;
		}
	},
});

export const Unfoldable: Unfoldable1<URI> = {
	URI,
	unfold,
};
