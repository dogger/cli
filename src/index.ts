#!/usr/bin/env node

import 'array-flat-polyfill';

import yargs = require('yargs');
import plan = require('./commands/plan');
import metadata = require('./metadata.json');
import cluster = require('./commands/cluster');
import login = require('./commands/login');

var command = yargs
  .command(login)
  .command(plan)
  .command(cluster)
  .option('token', {
    describe: 'The Dogger access token to use with the request. If not specified, will fetch a new token automatically.'
  })
  .option('verbose', {
    describe: 'If set, the Dogger CLI will output every request and response that is received or sent to/from the server.'
  })
  .version(metadata.version);

export = command;