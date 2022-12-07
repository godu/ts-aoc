import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Tuple';
import * as A from 'fp-ts/lib/Array';
import * as N from 'fp-ts/lib/number';
import {parser, string} from 'parser-ts';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse, space} from '../util';

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

export const inputParser: parser.Parser<string, Command[]> = pipe(
	parser.sepBy1(
		endOfLine,
		pipe(string.string('$ '), parser.apSecond(commandParser)),
	),
	parser.apFirst(endOfFile),
);

type FileFileSystem = ['file', Path, Size];
type DirFileSystem = ['dir', Path, Array<FileFileSystem | DirFileSystem>];
type FileSystem = FileFileSystem | DirFileSystem;

export const commandsToFileSystem = A.matchLeft<
	[FileSystem[], Command[]],
	Command
>(
	() => [[], []],
	(head, tail): [FileSystem[], Command[]] => {
		switch (head[0]) {
			case 'cd': {
				const [, path] = head;
				if (path === '..') return [[], tail];

				const [fss, tail_] = commandsToFileSystem(tail);
				const [fsss, tail__] = commandsToFileSystem(tail_);

				return [[['dir', path, fss], ...fsss], tail__];
			}

			default: {
				const [, children] = head;
				const files = pipe(
					children,
					A.filter((child): child is File => child[0] === 'file'),
				);
				const [fss, tail_] = commandsToFileSystem(tail);
				return [[...files, ...fss], tail_];
			}
		}
	},
);

export const directories = (fileSystem: FileSystem): DirFileSystem[] => {
	if (fileSystem[0] === 'file') return [];
	return [fileSystem, ...A.flatten(A.map(directories)(fileSystem[2]))];
};

export const size = (fileSystem: FileSystem): number => {
	if (fileSystem[0] === 'file') return fileSystem[2];
	return A.foldMap(N.MonoidSum)(size)(fileSystem[2]);
};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			commandsToFileSystem,
			T.fst,
			A.map(directories),
			A.flatten,
			A.map(size),
			A.filter((s) => s <= 100_000),
			A.foldMap(N.MonoidSum)(identity),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
