/* eslint-disable camelcase */
/* eslint-disable no-undef */
class ReviewsForm {
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

  init () {
    this.setTags()
    this.setRatingInit()
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
    axios
      .post(url, params)
      .then(response => {
        const data = response.data.data
        btn.classList.remove('processing')
        if (data.error) {
          toast.danger(data.error)
        } else if (data.id) {
          review_sender_phone = params.user_email
          if (document.querySelector('.feedback--doctor')) {
            document.querySelector('.feedback--doctor').classList.add('with-code')
            this.container.querySelectorAll('.receiver--form__close').forEach(item => {
              item.addEventListener('click', e => {
                this.setStage(4)
              })
            })
          }
          this.setStage(3)
          if (this.instance.getAttribute('data-title')){
            document.querySelector('.consultation--form__title').innerHTML = this.instance.getAttribute('data-title')
          }
        } else {
          review_sender_phone = params.user_email
          this.setStage(2)
        }
      })
      .catch(e => {
        btn.classList.remove('processing')
        toast.danger('Произошла ошибка, SMS не отправлено')
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
          if (document.querySelector('.feedback--doctor')) {
            document.querySelector('.feedback--doctor').classList.add('with-code')
            this.container.querySelectorAll('.receiver--form__close').forEach(item => {
              item.addEventListener('click', e => {
                this.setStage(4)
              })
            })
          }
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

  static toggleForm (button) {
    const id = button.getAttribute('data-id')
    const form = id ? document.querySelector('.reviews--form[data-id="' + id + '"]')
      : button.closest('.reviews').querySelector('.reviews--form')
    if (id) {
      form.classList.add('open')
      document
        .querySelector('.reviews [data-action="dropReview"]')
        .classList.add('hide')
      setTimeout(() => {
        location.hash = '#review'
        location.hash = '#reviews-form'
      }, 50)
      return false
    }
    form.classList.toggle('open')
    button.classList.toggle('hide')
  }
}

let form
document.querySelectorAll('#reviews-form').forEach(item => {
  form = new ReviewsForm(item)
  form.init()
})
document.querySelectorAll('.btn[data-action="dropReview"]').forEach(item => {
  // eslint-disable-next-line eqeqeq
  if (window.location.hash == '#reviews-form') {
    ReviewsForm.toggleForm(item)
  }
  item.addEventListener('click', e => {
    ReviewsForm.toggleForm(item)
  })
})
document.querySelectorAll('.btn[data-open="dropMedcenterReview"]').forEach(item => {
  if (!document.querySelector('.dialog[data-type="dropReview"]')) {
    return
  }
  item.addEventListener('click', e => {
    document.querySelector('.dialog[data-type="dropReview"]').classList.remove('dialog--open')
  })
})
