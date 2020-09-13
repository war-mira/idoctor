class BlogIndex {
    constructor(instance) {
        this.instance = instance;
        this.swiper = null;
        this.popular = null;
    }

    init() {
        this.initSwiper();
        this.initPopular();
    }

    initSwiper() {
        let self = this;
        this.swiper = new Swiper('.blog-articles__secondary .swiper-container', {
            spaceBetween: 0,
            slidesPerView: 1,
            lazy: false,
            updateOnImagesReady: true,
            autoplay: {
                delay: 4000,
            },
            navigation: {
                nextEl: '.swiper-buttons .next',
                prevEl: '.swiper-buttons .prev',
            },
        });

    }

    initPopular() {
        let self = this;
        let spaceBetween = isMobile() ? 10 : 20;
        this.popular = new Swiper('.blog-articles__popular .swiper-container', {
            spaceBetween: spaceBetween,
            slidesPerView: 'auto',
            lazy: false,
            updateOnImagesReady: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

    }

}


if (document.querySelector('.blog-articles')) {
    let page = new BlogIndex(document.querySelector('blog-articles'));
    page.init();
}