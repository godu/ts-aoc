import {constant, flow, tupled, identity} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import {type Solver} from '../type';
import {parse} from '../util/parser';
import {inputParser, type Range} from './part1';

const isOverlapping = ([a, b]: Range, [c, d]: Range) => !(b < c || a > d);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(A.filter(tupled(isOverlapping)), A.size, stringify)),
	E.fold(constant(''), identity),
);

export default solver;
