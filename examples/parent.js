#!/usr/bin/env node
'use strict';

var ArgumentParser = require('../lib/argparse').ArgumentParser;
var parentParser = new ArgumentParser({
  version: '0.0.1',
  addHelp: false,  // to prevent duplicate arguments
  description: 'Argparse examples: parents',
});

parentParser.addArgument([ '--x' ]);

var childParser = new ArgumentParser({
  description: 'child',
  parents: [parentParser]
});
childParser.addArgument(['--y']);

console.log(childParser.formatHelp());

console.log('====================\nPython example');

var parentParser = new ArgumentParser({
  addHelp: false,
  debug: true
});
parentParser.addArgument(
  ['--parent'],
  {type: 'int', description: 'parent'}
);

var fooParser = new ArgumentParser({
  parents: [parentParser],
  description: 'child1'
});
fooParser.addArgument(['foo']);
console.log(fooParser.formatHelp());

var args = fooParser.parseArgs(['--parent', '2', 'XXX']);
console.log(args);
console.log("Python: Namespace(foo='XXX', parent=2)");

var barParser = new ArgumentParser({
  parents: [parentParser],
  description: 'child2'
});
barParser.addArgument(['--bar']);
var args = barParser.parseArgs(['--bar', 'YYY']);
console.log(args);
console.log("Python: Namespace(bar='YYY', parent=None)");


