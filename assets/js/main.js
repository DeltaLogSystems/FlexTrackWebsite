/**
* Template Name: FlexStart
* Template URL: https://bootstrapmade.com/flexstart-bootstrap-startup-template/
* Updated: Nov 01 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    alert('Mobile nav toggle clicked');
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  document.addEventListener('DOMContentLoaded', () => {
    fetch('/navbar.html')
      .then(response => response.text())
      .then(data => {
        const navmenu = document.getElementById('navmenu');
        if (navmenu) {
          navmenu.innerHTML = data;

          // Initialize mobile nav toggle after navbar is loaded
          const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
          if (mobileNavToggleBtn) {
            mobileNavToggleBtn.addEventListener('click', () => {
              document.querySelector('body').classList.toggle('mobile-nav-active');
              mobileNavToggleBtn.classList.toggle('bi-list');
              mobileNavToggleBtn.classList.toggle('bi-x');
            });
          }

          // Reinitialize dropdown toggles
          document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
            navmenu.addEventListener('click', function (e) {
              e.preventDefault();
              this.parentNode.classList.toggle('active');
              this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
              e.stopImmediatePropagation();
            });
          });

          // Active link highlighting (keep your existing code)
          const currentPath = window.location.pathname;
          const links = navmenu.querySelectorAll('a[href]');
          links.forEach(link => link.classList.remove('active'));
          links.forEach(link => {
            let href = link.getAttribute('href');
            if (href === './' || href === '/') {
              href = '/index.html';
            } else if (href.startsWith('./')) {
              href = href.substring(1);
            }
            let normalizedCurrentPath = currentPath;
            if (normalizedCurrentPath === '' || normalizedCurrentPath === '/') {
              normalizedCurrentPath = '/index.html';
            }
            if (href === normalizedCurrentPath || href === currentPath) {
              link.classList.add('active');
              let parent = link.closest('.dropdown');
              while (parent) {
                const parentLink = parent.querySelector('a');
                if (parentLink) {
                  parentLink.classList.add('active');
                }
                parent = parent.parentElement.closest('.dropdown');
              }
            }
          });
        }
      })
      .catch(error => console.error('Error loading navbar:', error));

    // Get Started button scroll handling
    const getStartedBtn = document.getElementById('get-started-btn');
    const heroSection = document.getElementById('hero-section');

    if (getStartedBtn && heroSection) {
      // Handle button click to scroll to next section
      getStartedBtn.addEventListener('click', () => {
        const nextSections = document.getElementsByClassName('next-section');
        if (nextSections.length > 0) {
          nextSections[0].scrollIntoView({ behavior: 'smooth' });
        }
      });

      // Toggle button visibility based on scroll position
      window.addEventListener('scroll', () => {
        const heroRect = heroSection.getBoundingClientRect();
        // Hide button when the hero section is scrolled past (top is above viewport)
        const isHeroOutOfView = heroRect.top < 0;
        if (isMobile) {
          getStartedBtn.style.display = isHeroOutOfView ? 'none' : 'block';
        }
      });
    }

  });

})();

