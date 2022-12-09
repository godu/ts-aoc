import {constant, flow, identity} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {parse} from '../util';
import {inputParser, moveRope, pointEq} from './part1';

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			moveRope(A.replicate(10, [0, 0])),
			A.map(A.last),
			A.sequence(O.Applicative),
			O.map(flow(A.uniq(pointEq), A.size)),
			E.fromOption(constant('')),
			E.chain(stringify),
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
