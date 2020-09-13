class SelectCity {
  constructor (instance) {
    this.instance = instance
    this.model = instance.getAttribute('model')
    this.uid = Math.random().toString(36).substring(7)
    this.iid = this.model + this.uid
    this.input = this.instance.querySelector('input')
    this.options = []
    this.val = ''
    this.optionsInstance = document.querySelector('.select--city__content')
    this.search_attr = instance.getAttribute('search_attr') ? JSON.parse(instance.getAttribute('search_attr')) : ''
    this._currentCity = null
    this.autocomplete = {
      name: []
      // 'city':[],
    }
  }

  initSocket () {
    setTimeout(() => {
      socket.on('search autocomplete', (msg) => {
        if (this.iid === msg.key) {
          this.options = msg.data
          this.optionsChanged()
        }
      })
      socket.on('search results', (msg) => {
        if (this.iid === msg.key) {
          const value = Object.assign(this.val, { id: msg.data[0] })
          this.instance.dispatchEvent((new CustomEvent('autocomplete_selected', { detail: value })))
        }
      })
    }, 300)
  }

  init () {
    this.initSocket()
    this.initInput()
    this.detectCity()
  }

  set currentCity (data) {
    this._currentCity = data
    this.appendToList()
  }

  get currentCity () {
    return this._currentCity
  }

  appendToList () {
    const default_list = document.querySelector('.select--city__list-default')
    if (default_list) {
      const url = `/setcity/${this.currentCity.id}`
      if (default_list.querySelector('a[href="' + url + '"]')) {
        default_list.querySelector('a[href="' + url + '"]').closest('li').remove()
      }
      const default_city = document.createElement('li')
      default_city.className = 'select--city__list-item'
      default_city.innerHTML = `<a href="${url}">${this.currentCity.name}</a>`
      default_list.insertBefore(default_city, default_list.firstChild)
    }
  }

  detectCity () {
    const cityFromStorage = localStorage.getItem('currentCity')
    if (cityFromStorage) {
      this.currentCity = JSON.parse(cityFromStorage)
      return true
    }
    axios.get('/detect-city')
      .then(response => {
        const data = response.data
        this.currentCity = data
        localStorage.setItem('currentCity', JSON.stringify(data))
      }).catch(err => {
        //  console.warn(err);
      })
  }

  initInput () {
    this.input.addEventListener('input', (e) => {
      const val = this.input.value
      socket.emit('search inserting', val, this.search_attr.length ? this.search_attr : ['name'], this.model, this.iid)
    })
    this.instance.addEventListener('autocomplete_selected', e => {
      axios.get('/setcity/' + e.detail.id).then(function (response) {
        const data = response.data
        if (data.message == 'success') {
          window.location.href = data.url
        }
      })
    })
  }

  getOptions () {
    let options = ''
    this.options.forEach(item => {
      options += `<li class="select--city__list-item">
      <a>${item.value}</a></li>`
    })
    options = parseHTML(options)

    return options
  }

  optionsChanged () {
    this.optionsInstance.querySelector('.select--city__list').innerHTML = ''
    if (this.options.length && this.input.value.length) {
      this.optionsInstance.querySelector('.select--city__list-default').hidden = true
      const items = this.getOptions()
      const length = 10
      let i = length
      while (i > 0) {
        const item = items[0]
        if (typeof item !== 'undefined') {
          item.addEventListener('click', (e) => {
            const content = e.currentTarget.querySelector('a').innerText
            this.input.value = content
            socket.emit('search find',
              this.model,
              this.options.filter(item => {
                return item.value.toLocaleLowerCase() == content.toLocaleLowerCase()
              }),
              this.iid
            )
            this.options = []
            this.optionsChanged()
          })
          this.optionsInstance.querySelector('.select--city__list').appendChild(item)
        }
        i--
      }
    } else {
      this.optionsInstance.querySelector('.select--city__list-default').hidden = false
      //   this.optionsInstance.classList.remove('show');
      // this.input.closest('.input-with-btn').classList.remove('active');
    }
  }
}

document.querySelectorAll('.select--city__search').forEach(item => {
  const search = new SelectCity(item)
  search.init()
})
