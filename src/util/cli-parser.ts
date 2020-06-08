#!/usr/bin/env node

interface CliOption {
  type: 'option' | 'positional' | 'array' | 'rest';
  name: string;
  shortName?: string;
  description: string;
  default?: string;
  required?: boolean;
}
type CliOptions = Record<string, CliOption>;

type CliArgRequiredKeys<T extends CliOptions> = {
  [K in keyof T]: T[K]['type'] extends 'array'
    ? K
    : T[K]['type'] extends 'rest'
    ? K
    : T[K]['required'] extends true
    ? K
    : T[K]['default'] extends undefined
    ? never
    : K;
}[keyof T];

type CliArgType<T extends CliOption> = T['type'] extends 'array'
  ? string[]
  : T['type'] extends 'rest'
  ? string[]
  : T['type'] extends 'positional'
  ? string
  : T['type'] extends 'option'
  ? string
  : never;

type CliArgs<T extends CliOptions> = { [K in keyof T]?: CliArgType<T[K]> } &
  { [K in CliArgRequiredKeys<T>]: CliArgType<T[K]> };

export const parseArgs = <T extends CliOptions>(opts: T, rawArgs: string[]) => {
  const fullNameMappings: Record<string, string> = {};
  const shortNameMappings: Record<string, string> = {};
  const positionalOpts: string[] = [];
  let positionalIdx = 0;
  let restOpt: string | undefined = undefined;

  const errors: string[] = [];
  const args: Record<string, string | string[] | undefined> = {};

  for (const [name, opt] of Object.entries(opts)) {
    fullNameMappings[opt.name] = name;
    if (opt.shortName) shortNameMappings[opt.shortName] = name;
    if (opt.default) args[name] = opt.default;
    if (opt.type === 'array' || opt.type === 'rest') args[name] = [];
    if (opt.type === 'positional') positionalOpts.push(name);
    if (opt.type === 'rest') {
      if (restOpt) throw new Error('CLI commands can only have one rest option');
      restOpt = name;
    }
  }

  const getOptName = (arg: string) => {
    if (arg.startsWith('--')) return fullNameMappings[arg.substr(2)];
    if (arg.startsWith('-')) return shortNameMappings[arg.substr(1)];
    return undefined;
  };

  let activeOpt: string | undefined = undefined;
  for (const arg of rawArgs) {
    if (arg === '--') {
      activeOpt = undefined;
    } else if (!activeOpt) {
      const name = getOptName(arg);
      if (!name) {
        const positionalOpt = positionalOpts[positionalIdx];
        if (positionalOpt) {
          args[positionalOpt] = arg;
          positionalIdx += 1;
          activeOpt = positionalOpts[positionalIdx] || restOpt;
        } else if (restOpt) {
          (args[restOpt] as string[]).push(arg);
          activeOpt = restOpt;
        } else {
          errors.push(`Unknown argument: ${arg}`);
        }
      } else if (opts[name].type === 'array' || opts[name].type === 'option') {
        activeOpt = name;
      } else {
        errors.push(`Unknown argument: ${arg}`);
      }
    } else {
      const opt = opts[activeOpt];
      if (opt.type === 'array' || opt.type === 'rest') {
        (args[activeOpt] as string[]).push(arg);
      } else if (opt.type === 'positional') {
        args[activeOpt] = arg;
        positionalIdx += 1;
        activeOpt = positionalOpts[positionalIdx] || restOpt;
      } else {
        args[activeOpt] = arg;
        activeOpt = undefined;
      }
    }
  }

  for (const [name, opt] of Object.entries(opts)) {
    if (opt.required && args[name] === undefined) {
      errors.push(`Missing argument: ${opt.name}`);
    }
  }

  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  return args as CliArgs<T>;
};

// export const getYargs = (args: string[]) =>
//   yargs
//     .epilogue('Typescript dev loop in a box.')
//     .command(
//       '$0 <entry-file> [entry-file-args..]',
//       'Run a Typescript file by compiling its project and watching for changes',
//       yargs =>
//         yargs
//           .options({
//             c: {
//               alias: 'compiler',
//               describe: 'Name of compiler module with Typescript-compatible API to use',
//               type: 'string',
//               default: 'typescript',
//             },
//             'ts-flags': {
//               describe:
//                 'CLI flags to pass to the Typescript compiler. List flags followed by `--` like: ts-dev --ts-flags --esModuleInterop --module commonjs -- ./my/file.ts',
//               type: 'array',
//             },
//             'node-flags': {
//               describe:
//                 'CLI flags to pass to the node binary. List flags followed by `--` like: ts-dev --node-flags --inspect -- ./my/file.ts',
//               type: 'array',
//             },
//           })
//           .positional('entry-file', {
//             describe: 'File to run',
//             type: 'string',
//           })
//           .positional('entry-file-args', {
//             describe: 'File to run',
//           })
//           .demandOption(['entry-file']),
//     )
//     .parse(args);
