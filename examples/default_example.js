// Generated by CoffeeScript 1.3.3
var argparse, args, getDefault, parseArgs, parser, print;

print = console.log;

try {
  argparse = require('../lib/argparse');
} catch (error) {
  argparse = require('argparse');
}

parseArgs = function(fun, dummy) {
  var args;
  if (dummy == null) {
    dummy = null;
  }
  try {
    args = parser.parseArgs();
    return fun(args);
  } catch (error) {
    return print(error);
  }
};

getDefault = function(parser, dest) {
  var result, _ref;
  result = (_ref = parser._defaults[dest]) != null ? _ref : null;
  parser._actions.forEach(function(action) {
    if (action.dest === dest && action.defaultValue !== null) {
      result = action.defaultValue;
    }
  });
  return result;
};

print('default values test');

parser = new argparse.ArgumentParser({
  debug: true
});

parser.setDefaults({
  help: 'testing',
  zcnt: 0
});

parser.addArgument(["square"], {
  help: "the base",
  type: "int",
  defaultValue: 0,
  nargs: '?'
});

parser.addArgument(["power"], {
  help: "the exponent",
  type: "int",
  defaultValue: 2,
  nargs: '?'
});

parser.addArgument(["-v", "--verbosity"], {
  help: "increase output verbosity",
  action: "count",
  defaultValue: 0
});

parser.addArgument(["-z"], {
  dest: "zcnt",
  action: "count"
});

parser.addArgument(["-t"], {
  dest: "tf",
  action: "storeTrue"
});

print(parser.formatHelp());

parseArgs(function(args) {
  var action, answer;
  print('defaults using parser.getDefault');
  print((function() {
    var _i, _len, _ref, _results;
    _ref = parser._actions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      action = _ref[_i];
      _results.push("" + action.dest + ": " + (parser.getDefault(action.dest)));
    }
    return _results;
  })());
  print('defaults using custom getDefault');
  print((function() {
    var _i, _len, _ref, _results;
    _ref = parser._actions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      action = _ref[_i];
      _results.push("" + action.dest + ": " + (getDefault(parser, action.dest)));
    }
    return _results;
  })());
  print("args");
  print(args);
  if (args.square === void 0) {
    print('DEFAULT error');
  }
  if (args.verbosity === null) {
    print('DEFAULT error');
  }
  answer = Math.pow(args.square, args.power);
  print("verbosity: " + args.verbosity);
  if (args.verbosity >= 2) {
    return print("the " + args.power + " power of " + args.square + " equals " + answer);
  } else if (args.verbosity === 1) {
    return print("" + args.square + "^" + args.power + "=" + answer);
  } else {
    return print(answer);
  }
});

print("");

print("argumentDefault");

parser = new argparse.ArgumentParser({
  debug: true,
  argumentDefault: "None"
});

parser.addArgument(['--foo']);

parser.addArgument(['bar'], {
  nargs: '?'
});

args = parser.parseArgs(['--foo', '1', 'BAR']);

print("expect: Namespace(bar='BAR', foo='1')");

print(args);

args = parser.parseArgs([]);

print(args);

/*
bug report:
`addArgument([...],{defaultValue:0}]` does not work

Trying to set the Action `defaultValue` to a falsie via `addArgument` does not work.
The problem is with the `if (!options.defaultValue) {` test.  It is supposed to detect
when this option is not defined, but instead it rejects all falsies, including `0`.
A better translation of the Python block is:
```javascript
  // closer Python translation
  if (_.isUndefined(options.defaultValue)) {
    var dest = options.dest;
    if (_.has(this._defaults, dest)) {
      options.defaultValue = this._defaults[dest];
    } else if (!_.isUndefined(this.argumentDefault)) {
      options.defaultValue = this.argumentDefault;
    }
  }

```
`(options.defaultValue == null)` would also work, due to how `==` is defined.

On a related note, the `getDefault` function does not work, returning `null` all the time
It is not called by other `argparse` code, but can be called by the user.  Part of the problem is the test on `action.defaultValue`.  But also the `return action.defaultValue` only returns from the inner function, not outer one.

```javascript
// corrected version, based on a Coffeescript implementation
ActionContainer.prototype.getDefault = function (dest) {
  var result, _ref;
  // Python: self._defaults.get(dest, None)
  // coffee: result = this._defaults[dest] ? null
  result = (_ref = this._defaults[dest]) != null ? _ref : null;
  this._actions.forEach(function (action) {
    if (action.dest === dest && action.defaultValue !== null) {
      result = action.defaultValue;
    }
  });
  return result;
};
```

In looking for other uses of `defaultValue`, I found an error in `ActionContainer._registryGet`.  It incorrectly translates the Python `default=None` optional argument.  The `defaultValue` argument in this case is not connected with the previously one.  The simplest correction is to simply omit the test, since the function is always called with 3 arguments.
```javascript
ActionContainer.prototype._registryGet = function (registryName, value, defaultValue) {
  // defaultValue = defaultValue || null; // does not implement "default=None"
  return this._registries[registryName][value] || defaultValue;
};
```
*/

