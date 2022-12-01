import {constant, identity, flow} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as A from 'fp-ts/lib/NonEmptyArray';
import * as E from 'fp-ts/lib/Either';
import * as N from 'fp-ts/lib/number';
import * as O from 'fp-ts/lib/Ord';
import * as T from 'fp-ts/lib/Tuple';
import {type Solver} from '../type';
import {parse} from '../util';
import {inputParser} from './part1';

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			A.map(A.concatAll(N.MonoidSum)),
			A.sort(O.reverse(N.Ord)),
			A.splitAt(3),
			T.fst,
			A.concatAll(N.MonoidSum),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
