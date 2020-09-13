class MakeAppointment {
  constructor (id, instance, appdata) {
    this.instance = instance
    this.data = appdata
    this.apiBaseUrl = 'https://api'
    this.id = id
    this.stage = 0
    this.modal = document.querySelector('.modal--appointment')
    this.btn = null
    this.canSubmit = false
    this.phone = document.querySelector('#appointment_phone')
  }

  init () {
    if (this.instance.querySelector('[data-action="appointment"]')) {
      return false
    }
    if (typeof this.data === 'undefined') {
      return false
    }

    this.addButton()
    this.listenModal()
    this.phone.addEventListener('input', (e) => {
      this.checkPhone(this.phone.value)
    });
    application.appointments.push(this.id)
  }

  listenModal () {
    if (application.appointments.includes(this.id)) {
      return false
    }
    this.modal.addEventListener('submited', e => {
      if (this.modal.getAttribute('data-id') == this.id) {
        this.checkAppointment(e)
      }
    })
  }

  getBtnInstance () {
    return parseHTML('<div class="btn btn--ghost btn--modal btn--small btn--rounded" data-action="appointment">Оставить заявку</div>')[0]
  }

  addButton () {
    const btn = this.getBtnInstance()
    this.instance.querySelector('.profile--request__buttons').appendChild(btn)
    btn.addEventListener('click', (i) => {
      this.showModal()
    })
    this.btn = btn
  }

  checkAppointment(e){
    const btn = this.modal.querySelector('.modal__submit')
    if (this.stage == 1) {
      this.confirmCode(e, btn)
      return false
    }
    const form = this.modal.querySelector('form')
    if (!form.checkValidity()) {
      toast.danger('Не все поля заполнены')
      return false
    }
    const data = getFormData(form)
    data.appointable_id = this.id
    delete data.phone_code
    
    if (this.canSubmit) {
      this.sendAppointment(data, btn)
      btn.classList.remove('processing')
    } else {
      this.requestCode(data.phone, btn)
    }
  }
  sendAppointment(params, btn) {
    btn.classList.add('processing')

    params.phone = phoneFormat(params.phone)
    axios.post(`${this.apiBaseUrl}/appointments`, params)
      .then((response) => {
        const data = response.data
        btn.classList.remove('processing')
        closeModal(this.modal)
        toast.success('Заявка успешно отправлена', 10)
        this.stage = 3
      }).catch((err) => {
        btn.classList.remove('processing')
        if (err.response) {
          const data = err.response.data
          for (const prop in data.errors) {
            data.errors[prop].forEach(i => {
              toast.danger(i)
            })
          }
        }
      })
  }
  requestCode(number, btn) {
    let phone = phoneFormat(number);
    btn.classList.add('processing')
    axios.get(`${this.apiBaseUrl}/phone/guest/${phone}`).then(response => {
      if (response.data.success) {
        this.modal.querySelector('form').classList.add('form--sent')
        this.modal.querySelector('.modal__submit').innerText = 'Отправить'
        this.stage = 1
      }
    }).finally(() => {
      btn.classList.remove('processing')
    })
  }


  confirmCode(e, btn) {
    e.preventDefault()
    const phone = phoneFormat(this.phone.value)
    btn.classList.add('processing')

    axios.post(`${this.apiBaseUrl}/phone/guest/${phone}`, {
      code: document.querySelector('#offlineConfirmCode').value
    }).then(response => {
        const data = response.data
        btn.classList.remove('processing')
        if (data.error) {
          toast.danger(data.error)
        } else {
          this.stage = 2
          this.canSubmit = true
          this.checkAppointment(e)
        }
      }).catch((err) => {
        if (err.response) {
          const data = err.response.data
          toast.danger(data.msg)
        }
        btn.classList.remove('processing')
      })
  }

  checkPhone(number) {
    const phone = phoneFormat(number)
    if (phone.length !== 11) {
      return false
    }
    axios.get(`${this.apiBaseUrl}/phone/guest/check/${phone}`)
      .then(response => {
        if (!response.data.success) {
          this.canSubmit = false
        } else {
          this.canSubmit = true
        }
      }).catch(err => {

      })
  }

  showModal () {
    if (this.stage == 3) {
      toast.danger('Вы уже оставили заявку этому врачу')
      return false
    }
    this.modal.classList.add('is-modal-active')
    this.modal.setAttribute('data-id', this.id)
  }
}
