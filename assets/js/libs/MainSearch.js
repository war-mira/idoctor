class MainSearch {
  constructor (instance) {
    this.instance = instance
    this.model = instance.getAttribute('model')
    this.uid = Math.random().toString(36).substring(7)
    this.iid = this.model + this.uid
    this.model = instance.getAttribute('model')
    this.input = this.instance.querySelector('input')
    this.options = []
    this.val = ''
    this.optionsInstance = this.instance.querySelector(
      '.select-search__options'
    )
    this.search_attr = instance.getAttribute('search_attr') ? JSON.parse(instance.getAttribute('search_attr')) : ''
    this.autocomplete = {
      name: [],
      firstname: [],
      patronymic: [],
      lastname: [],
      skills: [],
      illnesses: [],
      services: [],
      qualifications: [],
      medcenters: [],
      additional: []
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
    if (!isMobile()) {
      this.initMoveByKey()
    }
  }

  initMoveByKey () {
    let current = null
    this.instance.addEventListener('keydown', e => {
      if (e.which === 40) {
        e.preventDefault()
        if (current == null) {
          current = this.optionsInstance.querySelector('li:nth-child(1)')
        } else {
          current = current.nextSibling
        }
        try {
          current.focus()
        } catch (e) {
        }
      } else if (e.which === 38) {
        e.preventDefault()
        if (current == null) {
          current = this.optionsInstance.querySelector('li:last-child')
        } else {
          current = current.previousSibling
        }
        try {
          current.focus()
        } catch (e) {
        }
      } else if (e.which === 13) {
        e.preventDefault()
        if (this.options.length && document.activeElement.tagName == 'LI') {
          this.input.value = current.innerText
        }
        if (this.instance.tagName == 'FORM') {
          this.instance.submit()
        }
      }
    })
  }

  initInput () {
    this.input.addEventListener('input', (e) => {
      const val = this.input.value
      socket.emit('search inserting', val, this.search_attr.length ? this.search_attr : ['name', 'skills', 'illnesses', 'additional'], this.model, this.iid)
    })
  }

  getOptions () {
    let options = ''
    this.options.forEach(item => {
      options += `<li class="select-search__option" tabindex="1">${item.value}</li>`
    })
    options = parseHTML(options)

    return options
  }

  optionsChanged () {
    this.optionsInstance.querySelector('ul').innerHTML = ''
    if (this.options.length && this.input.value.length) {
      this.optionsInstance.classList.add('show')
      const items = this.getOptions()
      const length = 10
      let i = length
      while (i > 0) {
        const item = items[0]
        if (typeof item !== 'undefined') {
          item.addEventListener('click', (e) => {
            const content = e.currentTarget.innerText
            this.input.value = content
            socket.emit('search find',
              this.model,
              this.options.filter(item => {
                return item.value.toLocaleLowerCase() == content.toLocaleLowerCase()
              }),
              this.iid
            )
            if (this.instance.tagName == 'FORM') {
              this.instance.submit()
            }

            this.options = []
            this.optionsChanged()
          })
          this.optionsInstance.querySelector('ul').appendChild(item)
        }
        i--
      }
    } else {
      this.optionsInstance.classList.remove('show')
    }
  }
}

document.querySelectorAll('.mainsearch').forEach(item => {
  const search = new MainSearch(item)
  search.init()
})
