import {char, parser, string} from 'parser-ts';
import * as A from 'fp-ts/lib/Array';
import {run} from 'parser-ts/lib/code-frame';
import {pipe} from 'fp-ts/lib/function';

export const formatDay = (day: number | string) =>
	day.toString().padStart(2, '0');

export const trace =
	(message: string) =>
	<T>(value: T): T => {
		console.log(message, value);
		return value;
	};

export const parse =
	<A>(p: parser.Parser<string, A>) =>
	(source: string) =>
		run(p, source);

export const endOfLine = string.oneOf(A.array)(['\n', '\r\n']);

export const endOfFile = pipe(endOfLine, parser.apFirst(parser.eof<string>()));

export const tuple =
	<A>(a: A) =>
	<B>(b: B): [A, B] =>
		[a, b];
