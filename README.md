# ThiagoCruzRJ's Cloud Computing Blog

Welcome to my personal blog on [GitHub Pages](https://thiagocruzrj.github.io/), where I share insights, tutorials, and best practices on Cloud Computing. This blog focuses on topics such as Azure, AWS, Kubernetes, DevOps, and Infrastructure as Code (IaC).

## 📚 Table of Contents
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Creating New Posts](#creating-new-posts)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🛠️ Technology Stack

This blog is built with the following technologies:

### Core Framework
- **Jekyll** (>= 4.3.0) - Static site generator written in Ruby
- **Ruby** - Programming language required for Jekyll
- **Bundler** - Dependency management for Ruby gems

### Jekyll Plugins
- **jekyll-paginate** - Pagination support for blog posts
- **jekyll-sitemap** - Automatic sitemap.xml generation for SEO
- **jekyll-toc** - Table of contents generation for posts

### Frontend Technologies
- **HTML5** - Page structure
- **SCSS/Sass** - Styling with modular architecture
- **JavaScript** - Interactive features and search functionality
- **Ionicons v4** - Icon library for social links

### Additional Dependencies
- **csv** - CSV file handling
- **base64** - Base64 encoding/decoding
- **bigdecimal** - Arbitrary precision decimal arithmetic

### Hosting
- **GitHub Pages** - Free static site hosting at https://thiagocruzrj.github.io

## 📋 Prerequisites

Before running this project locally, ensure you have the following installed:

### 1. Ruby
- **Version**: Ruby 2.7 or higher (3.x recommended)
- **Download**: [Ruby Official Website](https://www.ruby-lang.org/en/downloads/)
- **Windows Users**: Use [RubyInstaller](https://rubyinstaller.org/)

To check if Ruby is installed:
```bash
ruby --version
```

### 2. Bundler
Bundler is usually installed with Ruby, but you can install it separately:
```bash
gem install bundler
```

### 3. Git (Optional)
Required for version control and deployment:
```bash
git --version
```

## 🚀 Installation

Follow these steps to set up the project on your local machine:

### Step 1: Clone the Repository
```bash
git clone https://github.com/thiagocruzrj/thiagocruzrj.github.io.git
cd thiagocruzrj.github.io
```

### Step 2: Install Dependencies
Install all required Ruby gems using Bundler:
```bash
bundle install
```

This will install:
- Jekyll and all its dependencies
- All plugins listed in the Gemfile
- Any other required gems

### Step 3: Verify Installation
Check that Jekyll was installed successfully:
```bash
bundle exec jekyll --version
```

## 💻 Running Locally

### Start the Development Server
To run the site locally with live reload:

```bash
bundle exec jekyll serve
```

**Alternative with detailed options:**
```bash
bundle exec jekyll serve --watch --livereload
```

Options explained:
- `--watch` - Automatically regenerate the site when files are modified
- `--livereload` - Refresh the browser automatically when changes are detected

### Access the Site
Once the server is running, open your browser and navigate to:
```
http://localhost:4000
```

or
```
http://127.0.0.1:4000
```

### Stop the Server
Press `Ctrl + C` in the terminal to stop the server.

### Build for Production
To generate the production-ready static files:
```bash
bundle exec jekyll build
```

The generated site will be in the `_site/` directory.

## 📁 Project Structure

```
thiagocruzrj.github.io/
├── _config.yml              # Main Jekyll configuration
├── Gemfile                  # Ruby dependencies
├── index.html               # Homepage
├── 404.html                 # Custom 404 error page
├── search.json              # Search index for site search
├── README.md                # Project overview
├── SETUP.md                 # This file
│
├── _posts/                  # Blog posts (Markdown files)
│   ├── 2024-10-08-demystifying-azure-virtual-networks.markdown
│   ├── 2024-10-31-azure-openai-deployment-with-terraform.markdown
│   ├── 2024-11-05-azure-waf.markdown
│   └── ...
│
├── _layouts/                # HTML templates
│   ├── default.html         # Base layout
│   ├── post.html            # Blog post layout
│   ├── page.html            # Static page layout
│   └── tag_page.html        # Tag archive layout
│
├── _includes/               # Reusable HTML components
│   ├── header.html          # Site header
│   ├── footer.html          # Site footer
│   ├── navigation.html      # Navigation menu
│   ├── pagination.html      # Post pagination
│   ├── search.html          # Search functionality
│   └── ...
│
├── _pages/                  # Static pages
│   ├── about.md             # About page
│   └── contact.html         # Contact form
│
├── _sass/                   # SCSS stylesheets
│   ├── 0-settings/          # Variables, mixins, helpers
│   ├── 1-tools/             # Resets, grids, animations
│   ├── 2-base/              # Base styles
│   ├── 3-modules/           # Component styles
│   └── 4-layouts/           # Page layout styles
│
├── _plugins/                # Custom Jekyll plugins
│   ├── jekyll-tagging.rb    # Tag functionality
│   └── ...
│
├── images/                  # Image assets
├── js/                      # JavaScript files
└── _site/                   # Generated static site (excluded from Git)
```

## ✍️ Creating New Posts

### Post File Naming Convention
Posts must be named following this pattern:
```
YYYY-MM-DD-title-of-post.markdown
```

Example: `2026-01-21-my-new-post.markdown`

### Post Front Matter Template
Create a new file in the `_posts/` directory with this front matter:

```yaml
---
layout: post
title: "Your Post Title"
date: 2026-01-21 10:00:00 +0000
description: "A brief description of your post"
image: '/images/your-image.jpg'
tags: [azure, kubernetes, devops]
---

Your post content here in Markdown format...
```

### Writing Content
- Use Markdown syntax for formatting
- Add images to the `images/` directory
- Reference images using: `![Alt text](/images/your-image.jpg)`
- Use tags to categorize posts

### Preview Changes
After creating or editing a post, the development server will automatically rebuild:
```bash
bundle exec jekyll serve --livereload
```

Navigate to your post at: `http://localhost:4000/YYYY-MM-DD-title-of-post/`

## 🚢 Deployment

### GitHub Pages Deployment
The site automatically deploys to GitHub Pages when you push to the main branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Pages will automatically build and deploy the site to:
```
https://thiagocruzrj.github.io
```

### Manual Deployment
If you need to deploy elsewhere:

1. Build the site:
   ```bash
   bundle exec jekyll build
   ```

2. Upload the contents of `_site/` to your hosting provider

## 🔧 Troubleshooting

### Common Issues

#### Issue: `bundle install` fails
**Solution**: Update Bundler and retry:
```bash
gem update bundler
bundle install
```

#### Issue: Jekyll command not found
**Solution**: Run Jekyll through Bundler:
```bash
bundle exec jekyll serve
```

#### Issue: Port 4000 already in use
**Solution**: Use a different port:
```bash
bundle exec jekyll serve --port 4001
```

#### Issue: Changes not reflecting in browser
**Solution**: 
1. Clear browser cache
2. Use incognito/private mode
3. Ensure `--livereload` flag is used
4. Restart the Jekyll server

#### Issue: Ruby version incompatibility
**Solution**: Update Ruby to version 2.7 or higher:
- Windows: Download from [RubyInstaller](https://rubyinstaller.org/)
- macOS: Use `rbenv` or `rvm`
- Linux: Use your package manager

#### Issue: Native extensions fail to build
**Solution** (Windows): Install Ruby DevKit:
```bash
ridk install
# Select option 3: MSYS2 and MINGW development toolchain
```

### Getting Help
If you encounter issues:
1. Check the [Jekyll documentation](https://jekyllrb.com/docs/)
2. Review the [GitHub Pages documentation](https://docs.github.com/en/pages)
3. Open an issue on the [repository](https://github.com/thiagocruzrj/thiagocruzrj.github.io/issues)

## 📝 Configuration

### Customizing the Site
Edit `_config.yml` to customize:
- Site title and description
- Author information
- Social media links
- Contact email
- Google Analytics tracking ID
- Disqus comments

**Note**: After editing `_config.yml`, restart the Jekyll server for changes to take effect.

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is hosted on GitHub Pages. Content and code are available for reference and learning purposes.

## 📧 Contact

- **Author**: Thiago Cruz
- **Email**: thagocruz@gmail.com
- **GitHub**: [@thiagocruzrj](https://github.com/thiagocruzrj)
- **LinkedIn**: [Thiago Cruz](https://www.linkedin.com/in/thiago-cruz-rj/)

---
