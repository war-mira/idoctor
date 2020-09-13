class Filter {
  constructor (instance) {
    this.instance = instance
    this.price = { from: 0, to: '' }
    this.query = ''
    this.exp_range = { min: 0, max: '' }
    this.types = null
    this.q = ''
    this.other = []
    this.params = {}
    this.links = instance.querySelector('.links')
  }

  init () {
    this.addListeners()
    this.updateLinks()
  }

  addListeners () {
    this.listenToAutcomplete()
    this.listenToFilterAutcomplete()
    this.listenToOther()
    this.listenToPrice()
    this.listenToQuery()
    this.listenToRange()
    this.listenSubmitBtn()
    this.updateLinks()
  }

  listenToQuery () {
    if (document.querySelector('#search-query-input')) {
      document
        .querySelector('#search-query-input')
        .addEventListener('input', e => {
          this.query = e.currentTarget.value
          this.updateLinks()
        })
    }
  }

  listenToPrice () {
    this.instance
      .querySelectorAll('.price--range input[name="price.to"]')
      .forEach(item => {
        this.price.to = item.value
        item.addEventListener('input', e => {
          this.price.to = e.currentTarget.value
          this.updateLinks()
        })
      })
  }

  listenToOther () {
    this.instance.querySelectorAll('div[name="other"]').forEach(item => {
      // eslint-disable-next-line prefer-const
      let item_val = item.getAttribute('data-value')

      if (item.classList.contains('active')) {
        this.other.push(item_val)
      }
      item.addEventListener('click', (e) => {
        item.classList.toggle('active')

        if (!this.other.includes(item_val)) {
          this.other.push(item_val)
        } else {
          this.other = this.other.filter(item => item !== item_val)
        }
        this.updateLinks()
      })
    })
  }

  listenToFilterAutcomplete () {
    this.instance.querySelectorAll('.filter_mainsearch').forEach((item) => {
      const param_name = item.getAttribute('data-parent')

      this.instance.querySelectorAll(`input[name=${param_name}]`).forEach(item => {
        if (!this.params[param_name]) {
          this.params[param_name] = []
        }
        this.params[param_name].push(item.value)
      })

      item.addEventListener('autocomplete_selected', (e) => {
        if (!this.params[param_name]) {
          this.params[param_name] = []
        }
        const object = e.detail
        this.params[param_name].push(object.id)
        this.updateLinks()
      })
    })
  }

  listenToRange () {
    document.querySelectorAll('.filter--modal_range').forEach(item => {
      this.exp_range.max = item.value
      if (item.value > 0) {
        document.querySelector('.range--value__start').style.display = 'block'
      }
      item.addEventListener('change', (e) => {
        document.querySelector('.range--value__start').style.display = 'block'
        this.exp_range.max = e.currentTarget.value
        this.updateLinks()
      })
    })
  }

  listenToAutcomplete () {
    this.instance.querySelectorAll('.mainsearch').forEach((item) => {
      item.addEventListener('autocomplete_selected', (e) => {
        const object = e.detail
        const action = item.getAttribute('action_call')
        if (action.length) {
          this[action](object)
        }
      })
    })
  }

  listenSubmitBtn () {
    if (document.getElementById('filterRedirectLink')) {
      document.getElementById('filterRedirectLink').addEventListener('click', e => {
        e.preventDefault()
        const target = e.currentTarget
        target.classList.add('processing')
      })
    }
  }

  updateLinks () {
    if (!this.links) {
      return false
    }
    this.links.innerHTML = this.getLinksTemplate()
    const filterList = document.querySelector('.search--filter__list')
    const filterSearchBtns = document.querySelector('.search--buttons')
    if (filterSearchBtns) {
      const filterMapBtnSpan = filterSearchBtns.querySelector(
        '.btn--floating__filter span'
      )
      if (filterList.childElementCount > 0) {
        filterMapBtnSpan.classList.add('ml-1')
        filterMapBtnSpan.classList.add('badge')
        filterMapBtnSpan.classList.add('badge--primary')
        filterMapBtnSpan.innerHTML = filterList.childElementCount
      } else {
        filterMapBtnSpan.classList.remove('ml-1')
        filterMapBtnSpan.classList.remove('badge')
        filterMapBtnSpan.classList.remove('badge--primary')
      }
    }
  }

  get others () {
    const data = {}
    this.other.sort().map(item => {
      data[item] = 1
    })
    return data
  }

  getLink () {
    if ((_$('.service--link__clear')) && (this.params.services)) {
      if (this.params.services.length > 1) {
        const redirect_link = `/redirect-to/service-medcenters/${this.params.services.slice(-1)[0]}`
        return redirect_link
      }
    }
    return this.getUrlParams().length
      ? '?' + this.getUrlParams() + '&' + this.getMapParams()
      : '' + this.getMapParams()
  }

  getMapParams () {
    var url = new URL(window.location.href)
    var searchParams = url.searchParams.get('distance')
    let mapGeo = ''
    if (searchParams) {
      mapGeo = `geo[0]=${url.searchParams.get(
        'geo[0]'
      )}&geo[1]=${url.searchParams.get(
        'geo[1]'
      )}&distance=${url.searchParams.get(
        'distance'
      )}&zoom=${url.searchParams.get('zoom')}`
    }
    return mapGeo
  }

  getUrlParams () {
    let options = {}
    if (this.price.to > 0) {
      options.price = this.price
    }
    if (this.query.length) {
      options.q = this.query
    }

    if (this.params) {
      options = { ...options, ...this.params }
    }

    if (this.exp_range.max > 0) {
      options.exp_range = this.exp_range
    }
    return this.serialize(Object.assign({}, options, this.others))
  }

  getResetLink () {
    return window.location.pathname + '?' + this.getMapParams()
  }

  getLinksTemplate () {
    const template = `<a href="${this.getLink()}" class="btn btn--primary btn--medium ${
      this.getLink().length ? '' : 'disabled'
    }" id="filterRedirectLink">Применить</a>
        <a href="${this.getResetLink()}" class="btn btn--ghost btn--medium ${
      this.getUrlParams().length ? '' : 'disabled'
    }" >Сбросить</a>`
    return template
  }

  updatePrice (val) {
    this.price.to = val
  }

  goToSkill (object) {
    window.location.href = '/redirect-to/skill/' + object.id
  }

  goToServices (object) {
    window.location.href = '/redirect-to/services/' + object.id
  }

  goToMedcenterType (object) {
    window.location.href = '/redirect-to/medcenter-type/' + object.id
  }

  serialize (obj, prefix) {
    const str = []
    let p
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        const k = prefix ? prefix + '[' + p + ']' : p
        const v = obj[p]
        str.push(
          v !== null && typeof v === 'object'
            ? this.serialize(v, k)
            : encodeURIComponent(k) + '=' + encodeURIComponent(v)
        )
      }
    }
    return str.join('&')
  }

  static toggleFilterForm () {
    const form = document.querySelector('.filters--form')
    form.classList.toggle('open')
  }
}

const filters = []
document.querySelectorAll('.search--filters').forEach(item => {
  const filter = new Filter(item)
  filters.push(filter)
  filter.init()
})
