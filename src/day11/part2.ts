import {constant, flow, identity} from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {parse} from '../util';
import {inputParser, solve} from './part1';

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(solve(identity, 10_000), stringify)),
	E.fold(constant(''), identity),
);

export default solver;
