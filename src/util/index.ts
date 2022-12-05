import {char, parser, string} from 'parser-ts';
import * as A from 'fp-ts/lib/Array';
import {run} from 'parser-ts/lib/code-frame';
import {pipe} from 'fp-ts/lib/function';

export const formatDay = (day: number | string) =>
	day.toString().padStart(2, '0');

export const trace =
	(message: string) =>
	<T>(value: T): T => {
		console.log(message, JSON.stringify(value, null, 4));
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
