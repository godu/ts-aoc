import {type Show} from 'fp-ts/lib/Show';
import * as S from 'fp-ts/lib/string';

const unknownShow: Show<unknown> = {
	show: (v) => JSON.stringify(v, null, 4),
};

export const traceShowId =
	<T>({show}: Show<T>) =>
	(message: string) =>
	(value: T): T => {
		console.log(message, show(value));
		return value;
	};

export const traceId =
	(message: string) =>
	<A>(value: A): A => {
		return traceShowId<A>(unknownShow)(message)(value);
	};

export const traceStringId = traceShowId(S.Show);
