$stdin.sync = true
$stdout.sync = true
$stderr.sync = true

def main
  loop do
    $stderr.puts "I need coffee!"
    puts gets
    $stderr.puts "I need beer!"
    puts gets
  end
end

main