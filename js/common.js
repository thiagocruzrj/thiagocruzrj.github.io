// Global flag to prevent duplicate initialization
var copyButtonsInitialized = false;

$(document).ready(function() {
  'use strict';

  var menuOpenIcon = $(".nav__icon-menu"),
    menuCloseIcon = $(".nav__icon-close"),
    menuList = $(".menu-overlay"),
    searchOpenIcon = $(".search-button"),
    searchCloseIcon = $(".search__close"),
    searchInput = $(".search__text"),
    searchBox = $(".search");


  /* =======================
  // Menu and Search
  ======================= */
  menuOpenIcon.click(function () {
    menuOpen();
  })

  menuCloseIcon.click(function () {
    menuClose();
  })

  searchOpenIcon.click(function () {
    searchOpen();
  });

  searchCloseIcon.click(function () {
    searchClose();
  });

  function menuOpen() {
    menuList.addClass("is-open");
  }

  function menuClose() {
    menuList.removeClass("is-open");
  }

  function searchOpen() {
    searchBox.addClass("is-visible");
    setTimeout(function () {
      searchInput.focus();
    }, 300);
  }

  function searchClose() {
    searchBox.removeClass("is-visible");
  }

  $('.search, .search__box').on('click keyup', function (event) {
    if (event.target == this || event.keyCode == 27) {
      $('.search').removeClass('is-visible');
    }
  });


  /* =======================
  // Animation Load Page
  ======================= */
  setTimeout(function(){
    $('body').addClass('is-in');
  },150)


  // =====================
  // Simple Jekyll Search
  // =====================
  SimpleJekyllSearch({
    searchInput: document.getElementById("js-search-input"),
    resultsContainer: document.getElementById("js-results-container"),
    json: "/search.json",
    searchResultTemplate: '{article}',
    noResultsText: '<li class="no-results"><h3>No results found</h3></li>'
  });


  /* =======================
  // LazyLoad Images
  ======================= */
  var lazyLoadInstance = new LazyLoad({
    elements_selector: '.lazy'
  })


  // =====================
  // Ajax Load More
  // =====================
  var $load_posts_button = $('.load-more-posts');

  $load_posts_button.click(function(e) {
    e.preventDefault();
    var loadMore = $('.load-more-section');
    var request_next_link = pagination_next_url.split('/page')[0] + '/page/' + pagination_next_page_number + '/';

    $.ajax({
      url: request_next_link,
      beforeSend: function() {
        $load_posts_button.text('Loading...');
      }
    }).done(function(data) {
      var posts = $('.grid__post', data);
      $('.grid').append(posts);

      var lazyLoadInstance = new LazyLoad({
        elements_selector: '.lazy'
      })

      $load_posts_button.text('Load more');
      pagination_next_page_number++;

      if (pagination_next_page_number > pagination_available_pages_number) {
        loadMore.addClass('hide');
      }
    });
  });


  /* =======================
  // Responsive Videos
  ======================= */
  $(".post__content, .page__content").fitVids({
    customSelector: ['iframe[src*="ted.com"]', 'iframe[src*="player.twitch.tv"]', 'iframe[src*="facebook.com"]']
  });


  /* =======================
  // Zoom Image
  ======================= */
  $(".page img, .post img").attr("data-action", "zoom");
  $(".page a img, .post a img").removeAttr("data-action", "zoom");


  /* =======================
  // Scroll Top Button
  ======================= */
  $(".top").click(function() {
    $("html, body")
      .stop()
      .animate({ scrollTop: 0 }, "slow", "swing");
  });
  $(window).scroll(function() {
    if ($(this).scrollTop() > $(window).height()) {
      $(".top").addClass("is-active");
    } else {
      $(".top").removeClass("is-active");
    }
  });


  /* =======================
  // Copy Code Button & Expand/Collapse
  ======================= */
  function addCopyButtons() {
    // Prevent running multiple times using global flag
    if (window.copyButtonsInitialized) {
      return;
    }
    window.copyButtonsInitialized = true;
    
    // Find only the top-level containers - either .highlighter-rouge or standalone pre
    var highlighterBlocks = document.querySelectorAll('.highlighter-rouge');
    var standalonePres = Array.from(document.querySelectorAll('pre')).filter(function(pre) {
      // Only include pre if it's NOT inside a .highlighter-rouge
      return !pre.closest('.highlighter-rouge');
    });
    
    // Combine both sets
    var allBlocks = Array.from(highlighterBlocks).concat(standalonePres);
    
    allBlocks.forEach(function(block) {
      // Skip if already wrapped
      if (block.parentElement && block.parentElement.classList.contains('code-block-wrapper')) {
        return;
      }
      
      // For syntax highlighted blocks, find the actual pre element
      var preElement = block.tagName === 'PRE' ? block : block.querySelector('pre');
      if (!preElement) return;
      
      // Count lines in the code block
      var codeLines = preElement.textContent.split('\n').length;
      var shouldCollapse = codeLines > 15; // Collapse if more than 15 lines
      
      // Get the container to wrap (either the highlighter-rouge div or the pre)
      var containerToWrap = block.classList.contains('highlighter-rouge') ? block : preElement;
      
      // Create wrapper div
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      if (shouldCollapse) {
        wrapper.classList.add('collapsed');
      }
      
      // Wrap the container
      containerToWrap.parentNode.insertBefore(wrapper, containerToWrap);
      wrapper.appendChild(containerToWrap);
      
      // Create button container
      var buttonContainer = document.createElement('div');
      buttonContainer.className = 'code-block-buttons';
      
      // Create copy button
      var copyButton = document.createElement('button');
      copyButton.className = 'copy-code-button';
      copyButton.textContent = 'Copy';
      copyButton.title = 'Copy code';
      
      // Add copy button to container
      buttonContainer.appendChild(copyButton);
      
      // Create expand/collapse button if needed
      if (shouldCollapse) {
        var expandButton = document.createElement('button');
        expandButton.className = 'expand-code-button';
        expandButton.textContent = 'Expand';
        expandButton.title = 'Expand code';
        
        // Add expand button click event
        expandButton.addEventListener('click', function() {
          var isCollapsed = wrapper.classList.contains('collapsed');
          
          if (isCollapsed) {
            // Simply remove the collapsed class - CSS will handle the rest
            wrapper.classList.remove('collapsed');
            expandButton.textContent = 'Collapse';
            expandButton.title = 'Collapse code';
          } else {
            // Add collapsed class back
            wrapper.classList.add('collapsed');
            expandButton.textContent = 'Expand';
            expandButton.title = 'Expand code';
          }
        });
        
        buttonContainer.appendChild(expandButton);
      }
      
      // Insert button container
      wrapper.insertBefore(buttonContainer, containerToWrap);
      
      // Add copy button click event
      copyButton.addEventListener('click', function() {
        var code = preElement.textContent;
        
        // Use Clipboard API
        navigator.clipboard.writeText(code).then(function() {
          // Show success feedback
          copyButton.classList.add('copied');
          copyButton.textContent = 'Copied!';
          
          setTimeout(function() {
            copyButton.classList.remove('copied');
            copyButton.textContent = 'Copy';
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy: ', err);
        });
      });
    });
  }
  
  // Initialize copy buttons after a short delay to ensure DOM is ready
  setTimeout(function() {
    addCopyButtons();
  }, 100);

});