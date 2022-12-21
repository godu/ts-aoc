import {hrtime} from 'node:process';
import {identity} from 'fp-ts/lib/function';
import {type Show} from 'fp-ts/lib/Show';

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

export const traceStringId = traceShowId<string>({
	show: identity,
});

export const timingIO =
	(log: (...args: unknown[]) => void) =>
	(message: string) =>
	<A extends readonly unknown[], B>(f: (...args: A) => B) =>
	(...args: A): B => {
		const [startS, startN] = hrtime();
		const b = f(...args);
		const [endS, endN] = hrtime();

		const dS = endS - startS;
		const dN = endN - startN;

		const duration = `${dS > 0 ? `${dS}s` : ''}${`${dN}`.padStart(
			9,
			'0',
		)}ns`.replace(/^0+/, '');

		log(message, duration);
		return b;
	};

export const timing = timingIO(console.log);
