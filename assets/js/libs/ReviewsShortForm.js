/* eslint-disable camelcase */
/* eslint-disable no-undef */
class ReviewsShortForm {
  constructor (container) {
    this.container = container
    this.instance = container.querySelector('form')
    this.rating = this.instance.querySelector('.rating-set')
    this.tags = []
  }

  setStage (id) {
    this.container.querySelectorAll('.reviews--form__stage').forEach(i => {
      i.classList.remove('show')
    })
    this.container
      .querySelector(`.reviews--form__stage[data-id="${id}"]`)
      .classList.add('show')
  }

  toggleTag (tag) {
    tag.classList.toggle('active')
    const tag_id = tag.getAttribute('data-id')
    if (!this.tags.includes(tag_id)) {
      this.tags.push(tag_id)
    } else {
      this.tags = this.tags.filter(item => item !== tag_id)
    }
  }

  setTags () {
    this.container.querySelectorAll('.reviews--form__tags .tag').forEach(tag => {
      tag.addEventListener('click', evt => {
        this.toggleTag(evt.currentTarget)
      })
    })
  }

  checkVerify () {
    if (!review_sender_phone) {
      document.querySelectorAll('.reviews--form__unverified').forEach(field => {
        field.style.display = 'block'
        field.required = true
        field.disabled = false
      })
    }
  }

  init () {
    this.setTags()
    this.setRatingInit()
    this.checkVerify()
    this.instance.addEventListener('submit', e => {
      this.send(e)
    })
    this.container.querySelector('.submitCode').addEventListener('click', e => {
      this.sendCode(e)
    })
  }

  send (e) {
    e.preventDefault()
    const btn = this.instance.querySelector('.btn.send')
    btn.classList.add('processing')
    const url = this.instance.getAttribute('action')
    const params = getFormData(this.instance)
    for (const i in params) {
      if (!params[i].length) {
        btn.classList.remove('processing')
        toast.danger('Заполните все поля')
        return false
      }
    }
    if (this.tags.length) {
      params.tags = this.tags.map(i => parseInt(i))
    }
    params.user_email = review_sender_phone
    axios
      .post(url, params)
      .then(response => {
        const data = response.data
        btn.classList.remove('processing')
        if (data.error) {
          toast.danger(data.error)
        } else if (data.code == 'unverified') {
          this.setStage(2)
        } else {
          this.setStage(3)
        }
      })
      .catch(e => {
        btn.classList.remove('processing')
        toast.danger('Произошла ошибка')
      })
  }

  sendCode (e) {
    const btn = e.currentTarget
    btn.classList.add('processing')
    axios
      .post('/comment/confirm-code', {
        code: this.container.querySelector('.codeInput').value
      })
      .then(response => {
        const data = response.data
        btn.classList.remove('processing')
        if (data.error) {
          toast.danger(data.error)
        } else {
          this.setStage(3)
        }
      })
  }

  setRatingInit () {
    this.rating.querySelectorAll('.rating-set .rating__btn').forEach(item => {
      item.addEventListener('click', e => {
        const target = e.currentTarget
        const container = this.rating
        const input = container.querySelector('input')
        const rating = target.getAttribute('data-rating')
        if (!container.classList.contains('choosen')) {
          container.classList.add('choosen')
        }
        container.querySelectorAll('.choosen__btn').forEach(i => {
          i.classList.remove('choosen__btn')
        })
        item.classList.add('choosen__btn')
        input.value = rating * 2
      })
    })
  }
}

document.querySelectorAll('.btn[data-open="dropMedcenterReview"]').forEach(item => {
  const review_form = document.querySelector('#reviews-short-form')
  item.addEventListener('click', e => {
    if (document.querySelector('.feedback--medcenter')) {
      document.querySelector('.feedback--medcenter').classList.remove('hidden')
      document.querySelector('.feedback--doctor').classList.add('hidden')
    }

    const target = e.currentTarget
    review_form.querySelector('#owner_type').value = target.getAttribute('data-owner-type')
    review_form.querySelector('#owner_id').value = target.getAttribute('data-owner-id')
    const form = new ReviewsShortForm(review_form)
    form.init()
  })
})
