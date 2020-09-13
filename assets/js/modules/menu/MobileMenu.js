class MobileMenu {
  constructor (link) {
    this.link = link
    this.instance = document.querySelector(`.menu--mobile[data-id="${link.getAttribute('data-id')}"]`)
    this.close = document.querySelector('.menu--mobile__close')
    this.header = this.instance.parentNode.querySelector('header')
  }

  open () {
    this.instance.classList.add('open')
    this.close.classList.add('open')
    this.header.classList.add('open')
    document.body.classList.add('disable-scroll')
  }

  closeAll () {
    document.querySelectorAll('.menu--mobile').forEach(item => {
      item.classList.remove('open')
    })
    this.close.classList.remove('open')
    this.header.classList.remove('open')
    document.body.classList.remove('disable-scroll')
  }

  init () {
    this.close.addEventListener('click', e => {
      const target = e.currentTarget
      if (target.classList.contains('open')) {
        e.stopPropagation()
        this.closeAll()
      }
    })
    this.link.addEventListener('click', e => {
      this.open()
    })
  }
}

export default MobileMenu
