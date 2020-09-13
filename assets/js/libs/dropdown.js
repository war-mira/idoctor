class Dropdown {
  constructor () {
    this.items = []
    document.querySelectorAll('.dropdown--link').forEach(item => {
      item.querySelector('.dropdown-head').addEventListener('click', e => {
        this.toggleDropdown(item, e.currentTarget.getAttribute('data-hash'))
      })
      const hash = item.getAttribute('data-hash')
      const instance = document.querySelector(
        `.dropdown-content[data-hash="${hash}"]`
      )
      if (!this.isMobile()) {
        this.checkPosition(instance)
      }
      if (!this.items.filter(item => item.hash == hash).length) {
        instance.querySelector('.dropdown--close').addEventListener('click', (e) => {
          this.toggleDropdown(
            item,
            e.currentTarget
              .closest('.dropdown-content')
              .getAttribute('data-hash')
          )
        })
        this.items.push({
          hash: hash,
          link: item,
          instance: instance
        })
      }
    })
  }

  checkPosition (instance) {
    return false
    instance.style.display = 'block'
    // instance.classList.add('show');
    // let data = instance.getBoundingClientRect();
    const rightside = instance.offsetLeft + instance.offsetWidth
    if (rightside >= window.innerWidth) {
      if (!instance.classList.contains('right')) {
        instance.classList.add('right')
      }
    }
    instance.style.display = ''
    // instance.classList.remove('show');
  }

  toggleDropdown (link, hash) {
    const instance = this.items.filter(item => {
      return item.hash == hash
    }).pop().instance

    this.items.map(item => {
      if (item.hash !== hash) {
        item.link.classList.remove('active')
        item.instance.classList.remove('show')
      }
      if (this.isMobile()) {
        document.body.classList.remove('shadow')
      }
    })

    if (instance) {
      if (this.isMobile()) {
        if (instance.classList.contains('show')) {
          document.body.classList.remove('shadow')
        } else {
          document.body.classList.toggle('shadow')
        }
      }
      link.classList.toggle('active')
      instance.classList.toggle('show')
    }
  }

  closeAll () {
    document.body.classList.remove('shadow')
    this.items.map(item => {
      linkl.link.classList.remove('active')
      item.instance.classList.remove('show')
    })
  }

  isMobile () {
    return (this.isTouchDevice() && window.innerWidth <= 768)
  }

  isTouchDevice () {
    return 'ontouchstart' in document.documentElement
  }

  init () {
    console.log(this.items)
  }
}

const dropdowns = new Dropdown()
