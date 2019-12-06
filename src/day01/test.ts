import test from 'ava';
import {resolveInput} from '../util/test/helper';
import part1 from './part1';
import part2 from './part2';

test('part1', resolveInput, part1, 'part1', 'part1');
test('part2', resolveInput, part2, 'part2', 'part2');
