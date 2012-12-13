# python argparse tutorial

print = console.log
   
argparse = require('argparse', ) # or ../lib/argparse
parser = new argparse.ArgumentParser({debug: true})  # JS requires 'new'

try
  parser.parseArgs()  # note cammelcase
catch error
  print  error
###
coffee tutorial.coffee              - nothing
coffee tutorial.coffee --help       - show help
coffee tutorial.coffee --verbose    - error
coffee tutorial.coffee foo          - error
###

print "positional arguments"
parser.addArgument(["echo"]) # note brackets

parseArgs = (fun) ->
  # use debug:true and this function to catch errors at each step
  try
    args = parser.parseArgs()  # note cammelcase
    fun(args)
  catch error
    print  error

parseArgs((args)->
  print args.echo)
  
###
coffee tutorial.coffee              - error with usage note
coffee tutorial.coffee -h
coffee tutorial.coffee foo

###

actn = parser.addArgument(["square"], {help:"display a square of a given number"})
print parser.formatHelp()
parseArgs((args)->
  print args.square.constructor.name
  print "square(#{args.square})=", Math.pow(args.square,2))
# string, but JS coerces it to int for math
  
# refine to expect integer
parser = new argparse.ArgumentParser({debug: true})
parser.addArgument(["square"], {help:"display a square of a given number",type:"int"})
print parser.formatHelp()
parseArgs((args)->
  print args.square.constructor.name
  print "square(#{args.square})=", Math.pow(args.square,2))
  
parser = new argparse.ArgumentParser({debug: true}) 
parser.addArgument(["--verbosity"], {help:"increase output verbosity"})
print parser.formatHelp()
parseArgs((args)->
  print args
  if args.verbosity
    print "verbosity turned on"
  )
print ''
parser = new argparse.ArgumentParser({debug: true}) 
parser.addArgument(["--verbose"], {
  help:"increase output verbosity",
  action:"storeTrue"
  })
print parser.formatHelp()
parseArgs((args)->
  print args
  if args.verbose
    print "verbosity turned on"
  )
 
print '' 
print "Short options"

parser = new argparse.ArgumentParser({debug: true}) 
parser.addArgument(["-v","--verbose"], {
  help:"increase output verbosity",
  action:"storeTrue"
  })
print parser.formatHelp()
parseArgs((args)->
  print args
  if args.verbose
    print "verbosity turned on"
  )
  
print ''
print 'combined positional and optional'
parser = new argparse.ArgumentParser({debug: true}) 
parser.addArgument(["square"], {help:"display a square of a given number",type:"int"})
parser.addArgument(["-v","--verbose"], {
  help:"increase output verbosity",
  action:"storeTrue"
  })
print parser.formatHelp()
parseArgs((args)->
  answer = Math.pow(args.square,2)
  if args.verbose
    print "square(#{args.square})=#{answer}"
  else
    print answer 
  )
  
print ''
print 'choices'
parser = new argparse.ArgumentParser({debug: true}) 
parser.addArgument(["square"], {help:"display a square of a given number",type:"int"})
parser.addArgument(["-v","--verbosity"], {
  help:"increase output verbosity",
  type:"int",
  choices:[0,1,2]
  })
print parser.formatHelp()
parseArgs((args)->
  answer = Math.pow(args.square,2)
  if args.verbosity==2
    print "the suqare of #{args.square} equals #{answer}"
  else if args.verbosity==1
    print "#{args.square}^2=#{answer}"
  else
    print answer 
  )
 
print ''
print 'option count'
parser = new argparse.ArgumentParser({debug: true}) 
parser.addArgument(["square"], {
  help:"display a square of a given number",
  type:"int"
  defaultValue: 0,
  nargs:'?'
  })
parser.addArgument(["-v","--verbosity"], {
  help:"increase output verbosity",
  action: "count",
  defaultValue: 0   # otherwise default is null
  })
print parser.formatHelp()
parseArgs((args)->
  answer = Math.pow(args.square,2)
  if args.verbosity>=2
    print "the square of #{args.square} equals #{answer}"
  else if args.verbosity==1
    print "#{args.square}^2=#{answer}"
  else
    print answer 
  )

print ''
print 'little more advanced'
parser = new argparse.ArgumentParser({
  debug: true,
  description:"calculate X to the power of Y"
  }) 
parser.addArgument(["x"], {type:"int", help: "the base"})
parser.addArgument(["y"], {type:"int", help: "the exponent"})

parser.addArgument(["-v","--verbosity"], {
  help:"increase output verbosity",
  action: "count",
  defaultValue: 0   # otherwise default is null
  })
print parser.formatHelp()
parseArgs((args)->
  answer = Math.pow(args.x, args.y)
  print "verbosity: #{args.verbosity}"
  # in contrast to Python, 'null' verbosity does not mess up the comparison
  if args.verbosity>=2
    print "the power #{args.y} of #{args.x} equals #{answer}"
  else if args.verbosity==1
    print "#{args.x}^#{args.y}=#{answer}"
  else
    print answer 
  )
  
###
if args.verbosity >= 2
    print "Running '#{__file__}'"
if args.verbosity >= 1
    print "#{args.x}^#{args.y} =="
print answer
###

###
# conflicing options
# addMutuallyExclusiveGroup not implemented yet
# --quiet option
if args.quiet:
    print answer
elif args.verbose:
    print "{} to the power {} equals {}".format(args.x, args.y, answer)
else:
    print "{}^{} == {}".format(args.x, args.y, answer)
###
