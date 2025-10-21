# Ruby 3.4 compatibility patch for liquid gem
# The untaint method was removed in Ruby 3.4, but liquid 4.0.x still uses it
# This monkey patch adds the method back as a no-op to maintain compatibility

if RUBY_VERSION >= "3.4.0"
  class String
    def untaint
      self
    end
  end
end