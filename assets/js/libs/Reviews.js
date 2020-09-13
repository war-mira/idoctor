class Reviews {
  constructor (instance) {
    this.review = instance;
  }

  init () {
    this.calculateHeight()
    this.listenSeeMore()
  }

  calculateHeight () {
    const review_item_body = this.review.querySelectorAll('.reviews--item__body')

    review_item_body.forEach(item => {
      const divHeight = item.offsetHeight
      const lineHeight = parseInt(window.getComputedStyle(item).lineHeight)
      let count_of_lines = divHeight / lineHeight
      if (count_of_lines > 3) {
        const parent_review = item.closest('.reviews--item')
        parent_review.classList.add('reviews--item__rolled')
      }
    })
  }
  listenSeeMore() {
    document.querySelectorAll('.reviews--item__see-more').forEach(item => {
      let review = item.closest('.reviews--item');
      item.addEventListener("click", function () {
        review.classList.remove('reviews--item__rolled');
        let updating = new UpdateReviewsHeight(review).init()
      })
    })
  }

}

document.querySelectorAll('.reviews--item').forEach(instance => {
  const review = new Reviews(instance)
  review.init()
})
