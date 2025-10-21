# Compatibility shim: define Object#tainted? for Ruby versions where it was removed
# Liquid (used by Jekyll) calls `obj.tainted?` in some places. On Ruby 3.4+ this method
# may not exist, causing a NoMethodError during rendering. Return false to emulate
# the old (non-tainted) behavior for static site generation.

unless Object.method_defined?(:tainted?)
  class Object
    # Return false (no object is tainted) which is safe for static site rendering
    # and prevents Liquid from raising `undefined method 'tainted?'`.
    def tainted?
      false
    end
  end
end
