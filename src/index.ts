#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Ajv from 'ajv';
import fs from 'fs';
import chalk from 'chalk';

const ajv = new Ajv();

yargs(hideBin(process.argv))
  .command(
    'validate <file>',
    'Validate a HookMarked spec file',
    (yargs) => {
      return yargs.positional('file', {
        describe: 'Path to .hookspec.json or hooks.json',
        type: 'string',
      });
    },
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, 'utf8');
      const json = JSON.parse(raw);

      const schema = {
        type: 'object',
        properties: {
          version: { type: 'string' },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                event: { type: 'string' },
                schema: { type: 'string' },
                delivery: {
                  type: 'object',
                  properties: {
                    retry_policy: { type: 'string' },
                    max_attempts: { type: 'number' },
                  },
                  required: ['retry_policy'],
                },
              },
              required: ['event', 'schema'],
            },
          },
        },
        required: ['version', 'events'],
      };

      const validate = ajv.compile(schema);
      const valid = validate(json);

      if (valid) {
        console.log(chalk.green('✅ HookMarked spec is valid.'));
      } else {
        console.error(chalk.red('❌ Validation failed:'));
        console.error(validate.errors);
        process.exit(1);
      }
    }
  )
  .demandCommand()
  .help()
  .parse();
