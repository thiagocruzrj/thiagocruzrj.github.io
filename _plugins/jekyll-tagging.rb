module Jekyll
  class TagPageGenerator < Generator
    safe true

    def generate(site)
      if site.layouts.key? 'tag_page'
        site.tags.each_key do |tag|
          site.pages << TagPage.new(site, site.source, File.join('tag', tag.downcase), tag)
        end
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, dir, tag)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag_page.html')
      self.data['tag'] = tag
      self.data['title'] = "Tag: #{tag}"
      self.data['posts'] = site.tags[tag].sort_by { |post| -post.date.to_i }
    end
  end
end

