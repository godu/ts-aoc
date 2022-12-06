import {constant, flow, identity, increment, pipe} from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/string';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as ROA from 'fp-ts/lib/ReadonlyArray';
import * as E from 'fp-ts/lib/Either';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';

export const inits = <A>(as: A[]): A[][] =>
	pipe(
		as,
		A.scanLeft<A, A[]>([], (bs, a) => [...bs, a]),
		A.dropLeft(1),
	);

export const detectFirstStartOfPacket = (n: number) => (buffer: string[]) =>
	pipe(
		buffer,
		inits,
		A.map(A.takeRight(n)),
		A.findIndex(
			flow(
				A.takeRight(n),

				A.uniq(S.Eq),
				A.size,
				(s) => s === n,
			),
		),
		O.map(increment),
	);

const solver: Solver = flow(
	S.trim,
	S.split(''),
	ROA.toArray,
	detectFirstStartOfPacket(4),
	O.toNullable,
	stringify,
	E.fold(constant(''), identity),
);

export default solver;
