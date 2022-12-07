import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Tuple';
import {parser, string} from 'parser-ts';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse, space, trace} from '../util';

type Path = string;
type Size = number;
type File = ['file', Path, Size];
type Dir = ['dir', Path];

type Cd = ['cd', Path];
type Ls = ['ls', Array<File | Dir>];

type Command = Cd | Ls;

const cdParser: parser.Parser<string, Cd> = pipe(
	string.string('cd '),
	parser.apSecond(string.notSpaces1),
	parser.map((path) => ['cd', path]),
);

const fileParser: parser.Parser<string, File> = pipe(
	string.int,
	parser.apFirst(space),
	add(string.notSpaces1),
	parser.map(([size, path]) => ['file', path, size]),
);

const dirParser: parser.Parser<string, Dir> = pipe(
	string.string('dir '),
	parser.apSecond(string.notSpaces1),
	parser.map((path) => ['dir', path]),
);

const lsParser: parser.Parser<string, Ls> = pipe(
	string.string('ls'),
	parser.apFirst(endOfLine),
	parser.apSecond(
		parser.sepBy(
			endOfLine,
			pipe(fileParser, parser.alt<string, Dir | File>(constant(dirParser))),
		),
	),
	parser.map((files) => ['ls', files]),
);

const commandParser: parser.Parser<string, Command> = pipe(
	cdParser,
	parser.alt<string, Command>(constant(lsParser)),
);

const inputParser: parser.Parser<string, Command[]> = pipe(
	parser.sepBy1(
		endOfLine,
		pipe(string.string('$ '), parser.apSecond(commandParser)),
	),
	parser.apFirst(endOfFile),
);

const solver: Solver = flow(
	parse(inputParser),
	E.bimap(trace('error\n'), trace('input\n')),
	E.fold(constant(''), constant('')),
);

export default solver;
