class MakeOnlineRequest {
  constructor (container) {
    this.container = container
    this.instance = container.querySelector('.consultation--form__stage')
    this.title = this.container.querySelector('.consultation--form__title')
    this.modal = document.querySelector('.consultation--modal__form')
    this.phone = this.instance.querySelector('#phone')
    this.timer = this.container.querySelector('.consultation--timer')
    this.repeatBtn = this.container.querySelector('.repeatCode')
    this.apiBaseUrl = 'https://api'
    this.canSubmit = false
    this.name = this.modal.querySelector('#alt_name')
    this.image = this.modal.querySelector('#alt_img')
    this.skill = this.modal.querySelector('#alt_skill')
    this.qual = this.modal.querySelector('#alt_qual')
    this.price = this.modal.querySelector('#alt_price')
    this.queue_length = document.querySelector('#consult_queue_length')
    this.formData = null
  }

  setStage (id) {
    this.container.querySelectorAll('.consultation--form__stage').forEach(i => {
      i.classList.remove('show')
    })
    this.container
      .querySelector(`.consultation--form__stage[data-id="${id}"]`)
      .classList.add('show')
  }

  init () {
    this.startListeners()
  }

  startListeners () {
    this.listenRequests()
    this.phone.addEventListener('input', (e) => {
      this.checkPhone(this.phone.value)
    })
    this.instance.addEventListener('submit', e => {
      this.checkAppointment(e)
    })
    this.container.querySelector('.submitRequestCode').addEventListener('click', e => {
      this.sendCode(e)
    })
    this.repeatBtn.addEventListener('click', e => {
      this.requestCode(this.phone.value)
      this.repeatBtn.classList.add('disabled')
    })
  }

  listenRequests () {
    document.querySelectorAll('.btn[data-open="dropConsultation"]').forEach(item => {
      item.addEventListener('click', e => {
        this.modal.querySelector('.appointable_id').value = item.getAttribute('data-id')

        this.name.innerHTML = item.getAttribute('data-name')
        this.image.src = item.getAttribute('data-avatar')
        this.skill.innerHTML = item.getAttribute('data-skills')
        this.qual.innerHTML = item.getAttribute('data-qualification')
        this.price.innerHTML = item.getAttribute('data-price') + '₸'
      })
    })
  }

  checkAppointment (e) {
    e.preventDefault()
    const btn = this.instance.querySelector('.btn.sendRequest')
    btn.classList.add('processing')
    const params = getFormData(this.instance)
    for (const i in params) {
      if (!params[i].length) {
        btn.classList.remove('processing')
        toast.danger('Заполните все поля')
        return false
      }
    }
    if (this.canSubmit) {
      this.sendAppointment(params)
      btn.classList.remove('processing')
    } else {
      this.setStage(2)
      this.title.innerHTML = 'Подтверждение мобильного номера'
      this.requestCode(params.phone)
      btn.classList.remove('processing')
    }
  }

  requestCode (number) {
    const phone = phoneFormat(number)
    axios.get(`${this.apiBaseUrl}/phone/guest/${phone}`).then(response => {
      if (response.data.success) {
        this.startTimer()
      }
    }).finally(() => {

    })
  }

  sendCode (e) {
    e.preventDefault()
    const btn = e.currentTarget
    btn.classList.add('processing')
    const phone = phoneFormat(this.phone.value)
    axios.post(`${this.apiBaseUrl}/phone/guest/${phone}`, {
      code: this.container.querySelector('.codeRequestInput').value
    })
      .then(response => {
        const data = response.data
        btn.classList.remove('processing')
        if (data.error) {
          toast.danger(data.error)
        } else {
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

  sendAppointment (params) {
    params.phone = phoneFormat(params.phone)
    axios.post(`${this.apiBaseUrl}/appointments`, params)
      .then((response) => {
        this.createInvoice(response.data)
        this.queue_length.innerHTML =
          response.data.queue_length
        // localStorage.setItem('queue_length', response.data.data.queue_length)
      }).catch((err) => {
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

  // Создание инвойса из данных заявки
  createInvoice (data) {
    if (!data) {
      toast.danger('Ошибка создания счета на оплату')
      return false
    }
    const appointment = data
    axios.post(`${this.apiBaseUrl}/invoices`, {
      target_id: appointment.id,
      target_type: 'Appointment',
      amount: parseInt(this.price.innerHTML)
    }).then((response) => {
      this.setStage(3)
      this.getPaymentLink(response.data.data)
      this.title.innerHTML = 'Оплата'
    }).catch((err) => {
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

  getPaymentLink (data) {
    const success_url = 'https://payment'
    const failure_url = 'https://payment/error'
    axios
      .get(
        `${this.apiBaseUrl}/invoices/${data.id}/pay?success_url=${success_url}&failure_url=${failure_url}`
      )
      .then((response) => {
        document.querySelector('#payment_link').href = response.data
      })
      .catch((err) => {
        toast.danger('Ошибка создания счета на оплату')
      })
  }

  checkPhone (number) {
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

  startTimer () {
    let seconds = 60
    setInterval(() => {
      if (seconds > 0) {
        seconds = parseInt(seconds - 1)
        this.timer.innerHTML = seconds
        if (seconds < 10) {
          seconds = '0' + seconds
        }
      } else {
        this.repeatBtn.classList.remove('disabled')
      }
    }, 1000)
  }

  getCountEnd (number, titles) {
    const cases = [2, 0, 1, 1, 1, 2]
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]]
  }
}

document.querySelectorAll('#consultation-form').forEach(item => {
  const form = new MakeOnlineRequest(item)
  form.init()
})
