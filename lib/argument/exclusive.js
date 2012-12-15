/** internal
 * class ArgumentGroup
 *
 * Group arguments.
 * By default, ArgumentParser groups command-line arguments
 * into “positional arguments” and “optional arguments”
 * when displaying help messages. When there is a better
 * conceptual grouping of arguments than this default one,
 * appropriate groups can be created using the addArgumentGroup() method
 *
 * This class inherited from [[ArgumentContainer]]
 **/
'use strict';

var util = require('util');

var ArgumentGroup = require('./group');

/**
 * new MutuallyExclusiveGroup(container, required)
 * - container (object): main container
 * - required: true/false
 **/
var MutuallyExclusiveGroup = module.exports = function MutuallyExclusiveGroup(container, required) {

  required = required || false;
  ArgumentGroup.call(this, container);
  this.required = required;
  this.container = container;

};
util.inherits(MutuallyExclusiveGroup, ArgumentGroup);


MutuallyExclusiveGroup.prototype._addAction = function (action) {
  if (action.required) {
    msg = 'mutually exclusive arguments must be optional';
    throw new Error(msg);
  };
  action = this._container._addAction(action);
  this._groupActions.push(action);
  return action;
};


MutuallyExclusiveGroup.prototype._removeAction = function (action) {
  this._container._removeAction(action);
  this._groupActions.remove(action);
};

