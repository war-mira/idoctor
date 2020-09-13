class BlogArticle {
    constructor(instance) {
        this.instance = instance;
        this.swiper = null;
        this.photoSwipe = null;
    }

    init() {
        this.initSwiper();
        window.blogArticle = this;
    }

    initPhotoSwipe() {
        let selectors = '.blog-article__image,.swiper-wrapper';
        this.photoSwipe = new initPhotoSwipeFromDomClass(selectors, true);
        this.photoSwipe.init();
    }

    initSwiper() {
        let self = this;
        let sliders = document.querySelectorAll('.blog-article__slider');
        if (sliders.length) {
            let spaceBetween = isMobile() ? 10 : 20;
            let freeMode = isMobile() ? false : true;
            let centeredSlides = isMobile() ? false : false;
            this.swiper = new Swiper('.blog-article__slider .swiper-container', {
                spaceBetween: spaceBetween,
                centeredSlides: centeredSlides,
                centeredSlidesBounds: true,
                slidesPerView: 'auto',
                freeMode: freeMode,
                lazy: false,
                updateOnImagesReady: true,
                on: {
                    imagesReady: function () {
                        self.fixGalleryImages(this);
                    },
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        }
        this.initPhotoSwipe();

    }

    fixGalleryImages(swiper) {
        let items = Object.values(swiper.imagesToLoad);

        let minHeight = items.map((item) => {
            return item.offsetHeight;
        })
            .filter((i) => i)
            .sort().shift();
        if (minHeight < 100) {
            minHeight = 100;
        }
        swiper.imagesToLoad.each((k, item) => {
            item.style.maxHeight = minHeight + 'px';
        });
        swiper.slides.each((k, item) => {
            item.style.width = 'auto';
        });

        swiper.update();
    }
}


if (document.querySelector('article.blog-article')) {
    let article = new BlogArticle(document.querySelector('article.blog-article'));
    article.init();
}