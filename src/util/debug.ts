import {type Show} from 'fp-ts/lib/Show';
import * as S from 'fp-ts/lib/string';

const unknownShow: Show<unknown> = {
	show: (v) => JSON.stringify(v, null, 4),
};

export const traceShowId =
	<T>({show}: Show<T> = unknownShow) =>
	(message: string) =>
	(value: T): T => {
		console.log(message, show(value));
		return value;
	};

export const traceId = traceShowId(S.Show);
