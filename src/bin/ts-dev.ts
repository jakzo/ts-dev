#!/usr/bin/env node

import optionator from 'optionator';
import '../types';

import { parseArgs } from '../util/cli-parser';

const getArgsOptionator = () => {
  const argv = [...process.argv.slice(0, 2), 'x', '-c', 'ttsc', 'y'];
  console.log(argv);
  const cli = optionator({
    options: [
      {
        option: 'compiler',
        alias: 'c',
        type: 'String',
        required: true,
      },
      {
        heading: 'asdf'
      },
      {
        option: 'ts-flags',
        type: '[String]',
      },
      {
        option: 'node-flags',
        type: '[String]',
      },
    ],

  });
  const args = cli.parseArgv(argv);
  return args;
};

export const getArgs = () =>
  parseArgs(
    {
      entryFile: {
        name: 'entry-file',
        type: 'positional',
        description: 'File to run',
        required: true,
      },
      entryFileArgs: {
        name: 'entry-file-args',
        type: 'rest',
        description: 'Arguments to provide to the entry file',
      },
      tsFlags: {
        name: 'ts-flags',
        type: 'array',
        description:
          'CLI flags to pass to the Typescript compiler. List flags followed by `--` like: ts-dev --ts-flags --esModuleInterop --module commonjs -- ./my/file.ts',
      },
      nodeFlags: {
        name: 'node-flags',
        type: 'array',
        description:
          'CLI flags to pass to the node binary. List flags followed by `--` like: ts-dev --node-flags --inspect -- ./my/file.ts',
      },
      compiler: {
        name: 'compiler',
        shortName: 'c',
        type: 'option',
        description: 'Name of compiler module with Typescript-compatible API to use',
        default: 'typescript',
      },
    },
    process.argv.slice(2),
  );

export const main = async () => {
  try {
    const args = getArgsOptionator();
    console.log(args);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (require.main === module) void main();
