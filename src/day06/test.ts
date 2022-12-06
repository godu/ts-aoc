import test from 'ava';
import {resolveInput} from '../util/test/helper';
import part1 from './part1';
import part2 from './part2';

test('part1#1', resolveInput, part1, 'bvwbjplbgvbhsrlpgdmjqwftvncz', '5');
test('part1#2', resolveInput, part1, 'nppdvjthqldpwncqszvftbrmjlhg', '6');
test('part1#3', resolveInput, part1, 'nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', '10');
test('part1#4', resolveInput, part1, 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', '11');
test('part2#1', resolveInput, part2, 'mjqjpqmgbljsphdztnvjfqwrcgsmlb', '19');
test('part2#2', resolveInput, part2, 'bvwbjplbgvbhsrlpgdmjqwftvncz', '23');
test('part2#3', resolveInput, part2, 'nppdvjthqldpwncqszvftbrmjlhg', '23');
test('part2#4', resolveInput, part2, 'nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', '29');
test('part2#5', resolveInput, part2, 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', '26');
