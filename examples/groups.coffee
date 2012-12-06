#!/usr/bin/env coffee
# Python 15.4.5.3 Argument Groups
try
    ArgumentParser = require('../lib/argparse').ArgumentParser
catch error
    ArgumentParser = require('argparse').ArgumentParser
    
parser = new ArgumentParser({prog:'PROG', addHelp:false})
group = parser.addArgumentGroup({title:'group'})
group.addArgument(['--foo'], {help:'foo help'})
group.addArgument(['bar'], {help:'bar help'})
console.log parser.formatHelp()

console.log "########################"
parser = new ArgumentParser({prog:'PROG', addHelp:false})
group1 = parser.addArgumentGroup({title:'group1', description:'group1 description'})
group1.addArgument(['foo'], {help:'foo help'})
group2 = parser.addArgumentGroup({title:'group2', description:'group2 description'})
group2.addArgument(['--bar'], {help:'bar help'})
console.log parser.formatHelp()


    
