'use strict';

var _ = require('underscore');
_.str = require('underscore.string');

/*:nodoc:*
 * ArgumentTypeError(message)
 * - message (String): error message
 *
 * An error from trying to convert a command line string to a type.
 *
 * ArgumentError(argument, message)
 * - argument (Object): action with broken argument
 * - message (String): error message
 *
 * An error from creating or using an argument (optional or positional).
 * The string value of this exception is the message, augmented
 * with information about the argument that caused it.
 *
*/

var util = require('util');

function ArgumentTypeError(msg) {
  Error.captureStackTrace(this, this);
  this.message = msg || 'Argument Error';
  this.name = 'ArgumentTypeError';
};
util.inherits(ArgumentTypeError, Error);
module.exports.ArgumentTypeError = ArgumentTypeError;

function ArgumentError(argument, message) {
  this.argument = argument || null;
  this.message = message || "";
  this.name = "ArgumentError";
  Error.captureStackTrace(this, this);
  try {
    this.argumentName = this.argument.getName();
  } catch (err) {
    this.argumentName = _getActionName(this.argument);
  }
};
util.inherits(ArgumentError, Error);
module.exports.ArgumentError = ArgumentError;

ArgumentError.prototype.toString = function() {
  var astr;
  if (this.argumentName) {
    astr = "argument \"" + this.argumentName + "\": " + this.message;
  } else {
    astr = "" + this.message;
  }
  return this.name + ": " + astr;
};
// err.message does not include the argumentName
// to get that, use ""+err or err.toString()


var _getActionName = function (argument) {
  if (argument === null) {
    return null;
  } else if (argument.isOptional()) {
    return argument.optionStrings.join('/');
  } else if ((argument.metavar) !== null && argument.metavar !== $$.SUPPRESS) {
    return argument.metavar;
  } else if ((argument.dest) !== null && argument.dest !== $$.SUPPRESS) {
    return argument.dest;
  } else {
    return null;
  }
};
