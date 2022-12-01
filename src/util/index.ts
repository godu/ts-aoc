import {type parser} from 'parser-ts';
import {run} from 'parser-ts/lib/code-frame';

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
