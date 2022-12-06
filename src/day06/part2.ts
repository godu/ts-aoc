import {constant, flow, identity, increment, pipe} from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/string';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as ROA from 'fp-ts/lib/ReadonlyArray';
import * as E from 'fp-ts/lib/Either';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {detectFirstStartOfPacket, inits} from './part1';

const solver: Solver = flow(
	S.trim,
	S.split(''),
	ROA.toArray,
	detectFirstStartOfPacket(14),
	O.toNullable,
	stringify,
	E.fold(constant(''), identity),
);

export default solver;
