import {char, parser, string} from 'parser-ts';
import * as A from 'fp-ts/lib/Array';
import * as M from 'fp-ts/lib/Map';
import {run} from 'parser-ts/lib/code-frame';
import {pipe} from 'fp-ts/lib/function';
import {type Semigroup} from 'fp-ts/lib/Semigroup';
import {type Eq} from 'fp-ts/lib/Eq';

export const formatDay = (day: number | string) =>
	day.toString().padStart(2, '0');

export const trace =
	(message: string) =>
	<T>(value: T): T => {
		console.log(
			message,
			typeof value === 'string' ? value : JSON.stringify(value, null, 4),
		);
		return value;
	};

export const parse =
	<A>(p: parser.Parser<string, A>) =>
	(source: string) =>
		run(p, source);

export const endOfLine = string.oneOf(A.array)(['\n', '\r\n']);

export const endOfFile = pipe(endOfLine, parser.apFirst(parser.eof<string>()));

export const space = char.char(' ');

export const add =
	<A>(a: parser.Parser<string, A>) =>
	<B>(b: parser.Parser<string, B>): parser.Parser<string, [B, A]> =>
		parser.ap(a)(
			parser.map((b: B) => (a: A): [B, A] => [b, a])(b),
		);

export const tuple =
	<B>(b: B) =>
	<A>(a: A): [A, B] =>
		[a, b];

const combine = <A>(y: A, h: A[], ys: A[], t: A[][]) => [
	[y, ...h],
	...transpose([ys, ...t]),
];
export const transpose = <A>(_: A[][]): A[][] =>
	A.matchLeft<A[][], A[]>(
		() => [],
		(x, xss) =>
			A.matchLeft<A[][], A>(
				() => transpose(xss),
				(x, xs) => {
					const [hds, tls] = pipe(
						xss,
						A.map<A[], [A, A[]]>(
							A.matchLeft<[A, A[]], A>(
								() => {
									throw new TypeError('Lists must be the same length');
								},
								(hd, tl) => [hd, tl],
							),
						),
						A.unzip,
					);
					return combine<A>(x, hds, xs, tls);
				},
			)(x),
	)(_);

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

export const groupBy =
	<K, A>(E: Eq<K>, S: Semigroup<A>) =>
	(ak: (a: A) => K) =>
	(as: A[]): Map<K, A> =>
		pipe(
			as,
			A.foldMap(M.getMonoid(E, S))((a) => M.singleton(ak(a), a)),
		);
