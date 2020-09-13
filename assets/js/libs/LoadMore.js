class UpdateReviewsHeight {
  constructor (instance) {
    const wrapper = instance.closest('.profile_inner--wrapper')
    const parentWrapper = document.querySelector('.profile--wrapper')
    if (wrapper) {
      const slide = wrapper.querySelector('.swiper-slide-active')
      if (slide) {
        wrapper.style.height = slide.scrollHeight + 'px'
      }
      parentWrapper.style.height =
        parentWrapper.querySelector('.tabs--element.swiper-slide-active')
          .scrollHeight + 'px'
    }
    if (parentWrapper){
      parentWrapper.style.height =
        parentWrapper.querySelector('.tabs--element.swiper-slide-active')
          .scrollHeight + 'px'
    }
  }

  init () {

  }
}

class LoadMore {
  constructor (instance) {
    this.instance = instance
    this.container = this.instance.closest(instance.getAttribute('container')).querySelector('[load-more="body"]')
    this.url = instance.getAttribute('load-url')
    this.offset = instance.getAttribute('offset') ? instance.getAttribute('offset') : ''
    this.page = instance.getAttribute('page') ? instance.getAttribute('page') : '1'
    this.limit = instance.getAttribute('limit') ? instance.getAttribute('limit') : 10
    this.url_attr = instance.getAttribute('url-attr') ? JSON.parse(instance.getAttribute('url-attr')) : {}
    this.actions = instance.getAttribute('actions') ? instance.getAttribute('actions').split(',') : []
    this.left = instance.getAttribute('left')
    this.afterLoad = instance.getAttribute('after-load') ? instance.getAttribute('after-load').split(',') : []
    this.afterLoadActions = {
      'update-review-height': UpdateReviewsHeight,
      'doctor-applications': DoctorApplications
    }
    this.supported_actions = {
      'show-phone': ShowPhone,
      appointment: MakeAppointment,
      'hideable-row': HideableRow
    }
  }

  init () {
    this.instance.addEventListener('click', e => {
      this.getData()
    })
  }

  runAfterLoad (ids) {
    this.afterLoad.forEach(action => {
      if (this.afterLoadActions[action]) {
        const instance = new this.afterLoadActions[action](this.instance, ids)
        instance.init()
      }
    })
  }

  parseInstances (html) {
    const items = parseHTML(html)
    const ids = []
    const length = items.length
    let i = length
    while (i > 0) {
      const item = items[0]
      try {
        ids.push(item.querySelector('.profile').getAttribute('data-id'))
      } catch (e) { }

      this.container.appendChild(item)
      this.addActions(item)
      i--
    }
    this.runAfterLoad(ids)

    if (this.left == 0) {
      this.instance.remove()
    }
  }

  addActions (item) {
    this.actions.forEach(action => {
      if (this.supported_actions[action]) {
        const instance = new this.supported_actions[action](item)
        instance.init()
      }
    })
  }

  getData () {
    if (this.page == this.checkPage()) {
      this.page = +this.page + 1
    }
    this.instance.classList.add('processing')
    let params = {
      offset: this.offset,
      page: this.page,
      limit: this.limit
    }
    params = Object.assign(params, this.url_attr)
    axios.get(this.url, {
      params: params
    }).then(response => {
      const data = response.data

      this.offset = data.offset
      this.left = data.left
      if (typeof data.page !== 'undefined') {
        this.changePageInUrl()
        this.page = data.page
      }
      this.parseInstances(data.view)
      this.instance.classList.remove('processing')
      if (document.querySelector('.reviews--item')) {
        document.querySelectorAll('.reviews--item').forEach(instance => {
          const review = new Reviews(instance)
          review.init()
        })
      }
    }).catch(e => {
      this.instance.classList.remove('processing')
    })
  }

  checkPage () {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const param = urlParams.get('page')
    return param
  }

  changePageInUrl () {
    const url = new URL(window.location.href)
    const query_string = url.search
    const search_params = new URLSearchParams(query_string)
    search_params.set('page', this.page)
    url.search = search_params.toString()
    history.pushState(null, null, url.toString())
  }
}

document.querySelectorAll('[data-action="loadMore"]').forEach(item => {
  const loadable = new LoadMore(item)
  loadable.init()
})
if (document.readyState !== 'loading') {
  setTimeout(() => {
    document.querySelectorAll('[data-action="loadMore"]').forEach(item => {
      new UpdateReviewsHeight(item).init()
    })
  }, 300)
} else {
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
      document.querySelectorAll('[data-action="loadMore"]').forEach(item => {
        (new UpdateReviewsHeight(item)).init()
      })
    }, 300)
  }, false)
}
