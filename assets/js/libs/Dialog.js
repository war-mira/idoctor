class Dialog {
  constructor (caller) {
    this.caller = caller
    this.instance = document.querySelector(`.dialog[data-type=${caller.getAttribute('data-open')}]`)
    this.background = this.instance.querySelector('.dialog--background')
  }

  init () {
    this.initButtons()
  }

  initButtons () {
    this.caller.addEventListener('click', e => {
      this.instance.classList.toggle('dialog--open')
    })
    this.background.addEventListener('click', e => {
      this.close()
    })
    if (this.instance.querySelector('.dialog--close')) {
      this.instance.querySelectorAll('.dialog--close').forEach(item => {
        item.addEventListener('click', e => {
          this.close()
        })
      })
    }
  }

  close () {
    this.instance.classList.remove('dialog--open')
  }
}

document.querySelectorAll('.open--dialog').forEach(instance => {
  const dialog = new Dialog(instance)
  dialog.init()
})
