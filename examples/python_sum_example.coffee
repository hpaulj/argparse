#!/usr/bin/env coffee

ArgumentParser = require('../lib/argparse').ArgumentParser
parser = new ArgumentParser({
    debug: true,  # give error traceback
    description: 'Argparse example: Python 16.4.1 example'
    })

assert = require('assert')
add = (a,b) -> a+b
sum = (a) -> a.reduce(add,0)
sum._name = 'sum'
assert.equal(sum([1,2,3]), 6)

#max = (a) -> Math.max.apply(Math, a)
max = (a) -> Math.max(a...)
max._name = 'max'
min = (a) -> Math.min(a...)

parser.addArgument(['integers'], 
    {metavar: 'N', nargs: '*', type: 'int', help: 'an integer for the accumulator'})
# function argument values
parser.addArgument(['--sum'], 
    {dest:'accumulate', action:'storeConst', constant:sum, defaultValue:max,\
        help:'sum the integers (default: find the max)'})
console.log process.argv
console.log parser.parseKnownArgs()
args = parser.parseArgs()
console.log(args)

console.log "#{args.accumulate._name}(#{args.integers})=", args.accumulate(args.integers)
if args.integers.length==0
    console.log parser.formatHelp()
    
args = parser.parseArgs(['--sum', '-7', '1', '42'])
assert.equal(args.accumulate(args.integers),36)

