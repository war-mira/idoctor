class ShowPhone {
  constructor (container) {
    const instance = container.querySelector('.profile--info__phone')
    if (!instance) {
      return false
    }
    this.instance = instance
    this.model = instance.getAttribute('model')
    this.id = instance.getAttribute('id')
    this.code = instance.getAttribute('phone')
    this.message = instance.getAttribute('msg')
    this.isActive = false
    this.full_phone = ''
  }

  init () {
    if (!this.instance) {
      return false
    }
    const instance = this.getInstance()
    instance.addEventListener('click', e => {
      this.send(instance)
    })
    this.instance.appendChild(instance)
  }

  getInstance () {
    return parseHTML(this.getTemplate())[0]
  }

  send (old_instance) {
    const _self = this
    axios.post('/phones', {
      model: this.model,
      id: this.id
    })
      .then(
        (response) => {
          const phones = response.data.phones
          _self.message = phones.pop()
          _self.isActive = true
          _self.full_phone = _self.code + _self.message
          let phone = _self.message
          const arr = phone.toString().split(',')
          if (arr.length == 2) {
            phone = arr[0] + ' вн. ' + arr[1]
            _self.message = phone
          }
          _self.instance.replaceChild(_self.getInstance(), old_instance)
        },
        (error) => {
        }
      )
  }

  getTemplate () {
    return ` 
             <div class="btn btn--primary btn--medium btn_desktop--small btn--rounded"> 
                <i class="fa fa-phone mr-1"></i>
                <${this.isActive ? 'a class="charcoal"' : 'div'} ${
      this.isActive ? `href="tel:${this.full_phone}"` : ''
    } >
                <span>${this.code} </span>     
                <span class="white" ${!this.isActive ? '' : ''}>${this.message}</span> 
            </${this.isActive ? 'a' : 'div'}>   
       </div>`
  }
}

class MultiplePhones {
  constructor (instance) {
    this.instance = instance
    this.model = instance.getAttribute('model')
    this.id = instance.getAttribute('data-id')
    this.container = instance.querySelector('.phones--list__content')
    this.show_btn = this.instance.querySelector('.btn.show__list')
    this.phones = []
  }

  init () {
    this.listenButtons()
  }

  listenButtons () {
    this.show_btn.addEventListener('click', e => {
      if (this.phones.length) {
        this.instance.classList.toggle('show')
        e.stopPropagation()
      } else {
        this.loadPhones()
      }
    })
    const close = '.phones--list__close' + ((window.innerWidth <= 768) ? ',.phones--container' : '')
    this.instance.querySelector(close).addEventListener('click', evt => {
      this.close(evt)
    })
  }

  loadPhones () {
    if (this.phones.length) {
      return false
    }
    this.show_btn.classList.add('processing')
    axios.post('/phones', {
      model: this.model,
      id: this.id
    })
      .then(
        (response) => {
          this.phones = response.data.phones
          this.appendPhones()
          this.instance.classList.add('show')
          this.show_btn.classList.remove('processing')
        },
        (error) => {
          toast.danger('Попробуйте позже.')
        }
      )
  }

  appendPhones () {
    this.phones.forEach(phone => {
      this.container.appendChild(this.getTemplate(phone))
    })
  }

  getTemplate (phone) {
    const arr = phone.toString().split(',')
    let href
    if (arr.length == 2) {
      href = phone
      phone = arr[0] + ' вн. ' + arr[1]
    }
    return parseHTML(
      `<a href="tel:${href}" class="btn btn--primary btn--medium btn_desktop--small btn--rounded"><i class="fa fa-phone mr-1"></i>${phone}</a>`
    )[0]
  }

  close (e) {
    this.instance.classList.remove('show')
  }
}

document.querySelectorAll('.profile').forEach(item => {
  const phone = new ShowPhone(item)
  phone.init()
})

document.querySelectorAll('.phones.phones--multiple').forEach(item => {
  const phones = new MultiplePhones(item)
  phones.init()
})
