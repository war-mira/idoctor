/* eslint-disable prefer-const */
let swipers = {}
let default_options = {
  centeredSlides: false,
  keyboardControl: false,
  freeMode: false,
  preloadImages: false,
  // Enable lazy loading
  lazy: true
  // mousewheelForceToAxis:true,
}

if (document.querySelectorAll('.tabs').length) {
  swipers.tabs = new Swiper('.tabs .tabs--body .tabs-swiper-container', Object.assign({}, default_options, {
    slidesPerView: 1,
    autoHeight: true,
    spaceBetween: 10,
    thumbs: {
      swiper: {
        el: '.tabs .tabs--header .tabs-swiper-container',
        spaceBetween: 0,
        centeredSlides: false,
        slideToClickedSlide: true,
        slidesPerView: 'auto',
        touchRatio: 1
      }
    },
    on: {
      slideChange: function () {
        this.thumbs.swiper.slideTo(this.activeIndex)
      }
    }
  }))
  let container = document.querySelector('.tabs--body')
  document.querySelectorAll('.linkToReviews').forEach(item => {
    item.addEventListener('click', (e) => {
      setTimeout(function () {
        swipers.tabs.slideTo(0)
      }, 175)
      container.classList.remove('fullwidth')
    })
  })
}

if (document.querySelectorAll('.gallery').length) {
  swipers.gallery = new Swiper('.gallery .swiper-container', {
    cssMode: true,
    navigation: {
      nextEl: '.gallery .swiper-button-next',
      prevEl: '.gallery .swiper-button-prev'
    },
    pagination: {
      el: '.gallery .swiper-pagination'
    },
    mousewheel: true,
    keyboard: true
  })
}
if (document.querySelectorAll('.reviews').length) {
  swipers.reviews = new Swiper('.reviews .reviews--body .swiper-container', Object.assign({}, default_options, {
    slidesPerView: 1,
    autoHeight: true,
    spaceBetween: 10,
    thumbs: {
      swiper: {
        el: '.reviews .reviews--tabs .swiper-container',
        spaceBetween: 0,
        centeredSlides: false,
        slidesPerView: 'auto',
        touchRatio: 1
      }
    },
    on: {
      slideChange: function () {
        this.thumbs.swiper.slideTo(this.activeIndex)
      }
    }
  }))
}
if (document.querySelectorAll('.profile--info__jobs').length) {
  let options = {}
  if (document.querySelectorAll('.profile--info__jobs .swiper-container .swiper-slide').length > 1) {
    options = {
      pagination: {
        el: '.profile--info__jobs .swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.profile--info__jobs .swiper-button-next',
        prevEl: '.profile--info__jobs .swiper-button-prev'
      }
    }
  }
  swipers.jobs = new Swiper('.profile--info__jobs .swiper-container', Object.assign({}, default_options, options))
}

if (window.innerWidth <= 768) {
  if (document.querySelectorAll('.mainpage--cards').length) {
    swipers.mainpage_cards = new Swiper('.mainpage--cards .swiper-container', Object.assign({}, default_options, {
      spaceBetween: 0,
      centeredSlides: false,
      slideToClickedSlide: true,
      slidesPerView: 'auto',
      touchRatio: 1
    }))
    swipers.mainpage_skills = new Swiper('.mainpage--skills .swiper-container', Object.assign({}, default_options, {
      spaceBetween: 0,
      centeredSlides: false,
      slideToClickedSlide: true,
      slidesPerView: 'auto',
      touchRatio: 1,
      pagination: {
        el: '.mainpage--skills .swiper-pagination',
        clickable: true
      }
    }))
  }
  if (document.querySelectorAll('.mainpage--articles').length) {
    swipers.mainpage_articles = new Swiper('.mainpage--articles .swiper-container', Object.assign({}, default_options, {
      spaceBetween: 25,
      centeredSlides: false,
      slideToClickedSlide: true,
      slidesPerView: 'auto',
      touchRatio: 1,
      pagination: {
        el: '.mainpage--articles .swiper-pagination',
        clickable: true
      }
    }))
  }
}
if (document.querySelectorAll('.mainpage--online').length) {
  swipers.mainpage_online = new Swiper('.mainpage--online .swiper-container', Object.assign({}, default_options, {
    spaceBetween: 30,
    centeredSlides: false,
    slideToClickedSlide: true,
    slidesPerView: 1,
    breakpoints: {
      // when window width is <= 480px
      480: {
        slidesPerView: 2

      }
    },
    touchRatio: 1,
    pagination: {
      el: '.mainpage--online .swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  }))
}
if (document.querySelectorAll('.slider--similar').length) {
  swipers.similar = new Swiper('.slider--similar .swiper-container', Object.assign({}, default_options, {
    spaceBetween: 30,
    centeredSlides: false,
    slideToClickedSlide: true,
    slidesPerView: 4,
    lazy: true,
    breakpoints: {
      // when window width is <= 480px
      480: {
        slidesPerView: 1
      },
      1024: {
        slidesPerView: 2
      }
    },
    touchRatio: 1,
    pagination: {
      el: '.slider--similar .swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  }))
}

if (document.querySelectorAll('.promotional--catfish').length) {
  const heightFixed = false

  swipers.catfish = new Swiper('.promotional--catfish .swiper-container', Object.assign({}, default_options, {
    spaceBetween: 0,
    centeredSlides: true,
    slideToClickedSlide: true,
    slidesPerView: 1,
    loop: true,
    lazy: true,
    updateOnImagesReady: true,
    touchRatio: 1,
    autoplay: {
      delay: 4000
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  }))
}
if (document.querySelectorAll('.consultation--swiper').length) {
  let freeMode = isMobile() ? false : true;
  let centeredSlides = isMobile() ? false : false;

  swipers.consultation = new Swiper('.consultation--swiper .swiper-container', Object.assign({}, default_options, {
    spaceBetween: 15,
    centeredSlides: centeredSlides,
    centeredSlidesBounds: true,
    slidesPerView: 'auto',
    freeMode: freeMode,
    lazy: false,
    updateOnImagesReady: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  }))
}