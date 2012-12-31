# usage
# use test_argparse_convert.py to json serialize as many python tests as it can
# use this program to test an argparse implementation

# coffee test_argparse.coffee   # to see results
# coffee test_argparse.coffee|grep TODO   # to see if any tests need attention
# coffee test_argparse.coffee|grep > test_argparse_results.txt  # to collect in file
# 
# change 'COFFEE' to change which parser it uses (could be based on process.argv)

json_file =  './testpy' # file with JSON converted from python

if (COFFEE = false)
  argparse = require('argcoffee')
else
  argparse = require('argparse')
  
ArgumentParser = argparse.ArgumentParser
Namespace = argparse.Namespace
NS = Namespace
assert = require('assert')

_ = require('underscore')
_.str = require('underscore.string')

camelize = (obj) ->
  # camelize the keys of an object (e.g. parser arguments)
  for key of obj
    key1 = _.str.camelize(key)
    if key1=='const' then key1 = 'constant'
    if key1=='default' then key1 = 'defaultValue'
    value = obj[key]
    if not COFFEE
      if key1=='action' 
        #console.log 'Value', value
        value = _.str.camelize(value)
    obj[key1] = value
  obj

if not ArgumentParser.prototype.parse_args?
  #header 'adding method aliases'
  ArgumentParser::add_argument =  (args..., options) ->
          # Python like arguments; 
          # options still needs to be specified, even if only {}
          @addArgument(args, options)
  ArgumentParser::parse_args = (args, namespace) ->
          @parseArgs(args, namespace)
  ArgumentParser::print_help = (args) ->
          @printHelp(args)
  ArgumentParser::add_subparsers = (args) ->
          @addSubparsers(args)
  ArgumentParser::parse_known_args = (args) ->
          @parseKnownArgs(args)

psplit = (astring) ->
  # split that is closer the python split()
  # psplit('') produces [], not ['']
  if astring.split?
    result = astring.split(' ')
    result = (r for r in result when r) # remove ''
    return result
  return astring # probably is a list already
  

objlist = require(json_file)
console.log objlist.length, 'test cases'
#console.log objlist

casecnt = 0
for obj in objlist
  # each of these should be separate test
  casecnt += 1
  console.log '\n', casecnt, "====================="
  console.log obj.name
  if obj.parser_signature?
    options = obj.parser_signature[1]
    options = camelize(options)
    console.log 'camelized:', options
  else
    options = {}
  options.debug = true
  options.prog = obj.name
  options.description = obj.doc
  argsigs = [_.clone(options)]  # collect info for error display
  parser = new ArgumentParser(options)
  err = false
  for sig in obj.argument_signatures
    sig[1] = camelize(sig[1])
    argsigs.push(_.clone(sig))  # for error display
    parser.addArgument(sig[0], sig[1])
  
  cnt = 0
  for testcase in obj.successes
    [argv, ns] = testcase
    argv = psplit(argv)
    args = parser.parse_args(argv)
    console.log 'expected:',ns,'got',args
    try
      assert.deepEqual(args,ns)
    catch error
      console.log error
      cnt -= 1
      err = true
    cnt += 1
  astr = if cnt<obj.successes.length then 'TODO: SUCCESSES TESTS:' else 'successes tests:'
  console.log "#{astr} #{cnt} of #{obj.successes.length}"
  cnt = 0
  for testcase in obj.failures
    try
      args = parser.parse_args(psplit(testcase))
      console.log 'OOPS, no error', testcase
      cnt -= 1
      err = true
    catch error
      console.log "[#{testcase}]", error.message
    ###
    assert.throws(
      () -> 
        args = parser.parse_args(psplit(testcase))
    ) # expected error not specified in py orginal
    ###
    cnt += 1
  astr = if cnt<obj.failures.length then 'TODO: FAILURE TESTS:' else 'failure tests:'
  console.log "#{astr} #{cnt} of #{obj.failures.length}"
  if err
    console.log 'ARGUMENTS:'
    console.log argsigs


