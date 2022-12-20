import {char, parser, string} from 'parser-ts';
import * as A from 'fp-ts/lib/Array';
import {run} from 'parser-ts/lib/code-frame';
import {pipe} from 'fp-ts/lib/function';

export const parse =
	<A>(p: parser.Parser<string, A>) =>
	(source: string) =>
		run(p, source);

export const endOfLine = string.oneOf({...A.Functor, ...A.Foldable})([
	'\n',
	'\r\n',
]);

export const endOfFile = pipe(endOfLine, parser.apFirst(parser.eof<string>()));

export const space = char.char(' ');

export const add =
	<A>(a: parser.Parser<string, A>) =>
	<B>(b: parser.Parser<string, B>): parser.Parser<string, [B, A]> =>
		parser.ap(a)(
			parser.map((b: B) => (a: A): [B, A] => [b, a])(b),
		);
