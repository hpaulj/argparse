#!/usr/bin/env node
'use strict';

/**
* fileType example
* creates a user type equivalient to the argparse.py FileType
* and uses it in a UNIX <cat> like script
**/

var fs = require('fs');
var util = require('util');
var argparse = require('argparse');
var _ = require('underscore');

var ArgumentTypeError;
/*
function ArgumentTypeError(msg) {
  Error.captureStackTrace(this, this);
  this.message = msg || 'Argument Error';
  this.name = 'ArgumentTypeError';
}
util.inherits(ArgumentTypeError, Error);
*/

ArgumentTypeError = require('../lib/argument/error_types').ArgumentTypeError;

/**
* Equivalent to the argparse.py FileType class
*
* The Python class __init__ takes mode (r/w) and bufsize arguments,
* and creates a callable which takes a string argument (the filename).
*
* This JS equivalent is a function that takes an options object, and
* returns a function that takes the `filename` string argument.
*   - options -- object that is passed to fs.create*Stream.  Its
*          attributes are anything the Stream function can take.
*          A change along this lines will appear in Python3.4.
*   - options.flags -- 'r' or 'w', flag used to distingish between
*          opening a file as a read (default) or write stream.
*   - filename -- argument string from parser; if '-' return stdin/out.
*
* It returns a `stream`, which has `path` and `fd` properties,
* which can used with the stream events, or `fs` methods using `fd`.
**/

var fileType = function (options) {
  console.log('FILETYPE', options);
  var fs = require('fs');
  options = options || {flags: 'r'};
  var flags = (_.isString(options)) ? options : options.flags;
  var std, createStream;
  if (flags === 'r') {
    std = process.stdin;
    createStream = fs.createReadStream;
  } else if (flags === 'w') {
    std = process.stdout;
    createStream = fs.createWriteStream;
  } else {
    throw new Error("Unknown flag type: " + flags);
  }

  // function to handle argument string
  var fn = function (filename) {
    console.log('filetype', filename);
    var fd, stream;
    if (filename === '-') {
      stream = std;
    } else {
      try {
        fd = fs.openSync(filename, flags);
      } catch (err) {
        // check error type?
        var message = "can't open " + filename + ": " + err.message;
        throw new ArgumentTypeError(message);
      }
      options.fd = fd;
      stream = createStream(filename, options);
    }
    return stream;
  };
  // fn.displayName = 'FileType';
  return fn;
};

/*
 * argparse.py _get_value() treats a ArgumentTypeError different from
 * a TypeError.  Currently js ArgumentParser._getValue returns a
 * standardized error message for registered and named types, and
 * gives added information for anonymous types.
*/


/**
* Example use with a UNIX `cat` like behavior
*
**/

// use this file as the default
// var meStream = fileType({flags: 'r', encoding: 'utf8'})(process.argv[1]);
var deffile = process.argv[1];
var helpstr = 'Functionality is roughly that of <cat>';

var parser = new argparse.ArgumentParser({
  debug: true,
  epilog: helpstr
});

parser.addArgument(['-i', '--infile'], {
  type: fileType({
    flags: 'r',
    encoding: 'utf8'
  }),
  defaultValue: deffile, //meStream,
  help: 'Input filename or `-` (default is itself)'
});

parser.addArgument(['-o', '--outfile'], {
  type: fileType({
    flags: 'w'
  }),
  help: 'Output filename or `-`'
});

parser.addArgument(['-s', '--sync'], {
  type: 'int',
  metavar: 'NN',
  nargs: '*',
  help: 'use readSync(fd, [length, [position]])'
});

var group = parser.addMutuallyExclusiveGroup({required: false});
group.addArgument(['-v', '--verbose'], {
  action: 'storeTrue',
  help: 'show more information'
});

group.addArgument(['-d', '--debug'], {
  action: 'storeTrue',
  help: 'like verbose but with util.debug'
});

group.addArgument(['-q', '--quiet'], {
  action: 'storeTrue',
  help: 'show no extra information'
});

var args = parser.parseArgs();

var print;
if (args.quiet) {
  print = function () {};
} else {
  if (args.debug) {
    print = util.debug;
  } else {
    print = console.error;
  }
}

if (args.verbose || args.debug) {
  print(parser.formatHelp());

  print('-------------------------');
  print('parseArgs NameSpace:');
  print(util.inspect(args));
  print('');
}
var readStream = args.infile;
var writeStream = args.outfile;

// the stream can be used directly
if (args.sync !== null) {
  // more generally we could pass readSync: [fd, buffer, offset, length, position]
  // if 2nd arg isn't a buffer, it expects [fd, length, position, encoding]
  // using buffer = new Buffer(length);
  var results;
  var fd = readStream.fd;
  var par = args.sync;
  if (par.length === 1) {
    results = fs.readSync(fd, par[0]);
  } else {
    // allowable # of par, 1,2?
    // encoding has to be string like 'utf8' (default)
    // for now slice that off
    par = [fd].concat(par.slice(0, 2));
    print('par ' + par);
    results = fs.readSync.apply(null, par);
  }
  console.log(results[0]);
  fs.closeSync(fd);
  process.exit();
}

if (readStream) {
  readStream.on('error', function (error) {
    return print(error);
  });
}

if (writeStream) {
  print('pipe the readStream to the writeStream');
  // stream already open, so this does nothing
  writeStream.on('open', function () {
    return print("wrote to " + writeStream.path);
  });
  writeStream.on('error', function (error) {
    return print(error);
  });
  readStream.on('end', function () {
    return print('pipe END');
  });
  readStream.resume();
  readStream.pipe(writeStream, {
    end: false
  });
} else {
  print('print the readStream');
  // readStream already open, so this does nothing
  readStream.on('open', function () {
    return print(readStream.path);
  });
  readStream.on('data', function (data) {
    return console.log(data);
  });
  readStream.on('end', function () {
    return print('Stream END');
  });
}

print('after setup');
