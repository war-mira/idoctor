class ClearFilters {
  constructor (container) {
    this.instance = container
    this.filtersList = []
  }

  init () {
    this.findFilters()
    this.addResetBtn()
    this.listenRemoveBtn()
    this.listenResetBtn()
  }

  findFilters () {
    this.instance.querySelectorAll('.tag').forEach(item => {
      const name = item.getAttribute('name')
      const value = item.getAttribute('data-value')
      this.filtersList.push({ name, value })
    })
  }

  addResetBtn () {
    if (this.instance.querySelectorAll('.tag').length > 0) {
      const parent = this.instance.parentElement
      const btn = document.createElement('div')
      btn.innerHTML = 'Сбросить всё'
      btn.setAttribute('class', 'search--filter__reset')
      parent.appendChild(btn)
    }
  }

  listenRemoveBtn () {
    this.instance.querySelectorAll('.tag').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault()
        const name = item.getAttribute('name')
        const value = item.getAttribute('data-value')
        const newParamsArray = this.deleteFilter(name, value)
        const newUrl = window.location.href.split('?')[0] + '?' + this.arrayToUrl(newParamsArray)
        if ((name == 'services') && (_$('.service--link__clear'))) {
          window.location.href = (_$('.service--link__clear')).getAttribute('href')
        } else {
          window.location.href = newUrl
        }
      })
    })
  }

  listenResetBtn () {
    const resetButton = _$('.search--filter__block').querySelector('.search--filter__reset')
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        const url = new URL(window.location.href)
        const new_URL = new URL(window.location.href.split('?')[0])
        if (url.searchParams.get('distance')) {
          const search_params = new URLSearchParams()
          search_params.set('geo[0]', url.searchParams.get('geo[0]'))
          search_params.set('geo[1]', url.searchParams.get('geo[1]'))
          search_params.set('distance', url.searchParams.get('distance'))
          search_params.set('zoom', url.searchParams.get('zoom'))
          new_URL.search = search_params.toString()
        }

        if (!_$('.service--link__clear')) {
          window.location.href = new_URL
        } else {
          window.location.href = (_$('.service--link__clear')).getAttribute('href')
        }
      })
    }
  }

  deleteFilter (name, value) {
    let searchElementIndex
    let newArr = []
    this.filtersList.map(item => {
      if ((item.name == name) && (item.value == value)) {
        searchElementIndex = this.filtersList.indexOf(item)
      }
    })
    if (searchElementIndex > -1) {
      this.filtersList.splice(searchElementIndex, 1)
    }

    newArr = this.filtersList
    newArr = this.filtersList
    return newArr
  }

  arrayToUrl (arr) {
    const list = {}
    const params = {}
    arr.map(item => {
      if ((item.name == 'types') || (item.name == 'skills') || (item.name == 'services')) {
        if (!params[item.name]) {
          params[item.name] = []
        }
        params[item.name].push(item.value)
      } else if (item.name == 'exp_range') {
        params.exp_range = { min: 0, max: item.value }
      } else if (item.name == 'price_range') {
        params.price = { from: 0, to: item.value }
      } else {
        list[item.name] = item.value
      }
    })
    return this.serialize(Object.assign({}, params, list))
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
}

document.querySelectorAll('.search--filter__list').forEach(item => {
  const filter = new ClearFilters(item)
  filter.init()
})
