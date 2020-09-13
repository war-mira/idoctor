class Dropdown {
  constructor (instance) {
    this.items = []
    this.head = instance
    this.parent = instance.parentElement
  }

  // checkPosition (instance) {
  //   return false
  //   // instance.style.display = 'block'
  //   // // instance.classList.add('show');
  //   // // let data = instance.getBoundingClientRect();
  //   // const rightside = instance.offsetLeft + instance.offsetWidth
  //   // if (rightside >= window.innerWidth) {
  //   //   if (!instance.classList.contains('right')) {
  //   //     instance.classList.add('right')
  //   //   }
  //   // }
  //   // instance.style.display = ''
  //   // instance.classList.remove('show');
  // }

  toggleDropdown (link, hash) {
    const instance = this.items
      .filter(item => {
        return item.hash == hash
      })
      .pop().instance

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
    return this.isTouchDevice() && window.innerWidth <= 768
  }

  isTouchDevice () {
    return 'ontouchstart' in document.documentElement
  }

  init () {
    this.head
      .addEventListener('click', e => {
        this.toggleDropdown(
          this.parent,
          e.currentTarget.getAttribute('data-hash')
        )
      })
    const hash = this.parent.getAttribute('data-hash')
    const content = document.querySelector(
        `.dropdown-content[data-hash="${hash}"]`
    )
    // if (!this.isMobile()) {
    //   this.checkPosition(content)
    // }
    if (!this.items.filter(item => item.hash == hash).length) {
      content
        .querySelector('.dropdown--close')
        .addEventListener('click', e => {
          this.toggleDropdown(
            this.parent,
            e.currentTarget
              .closest('.dropdown-content')
              .getAttribute('data-hash')
          )
        })
      this.items.push({
        hash: hash,
        link: this.parent,
        instance: content
      })
    }
  }
}
export default Dropdown
