class MistakeForm {
  constructor (container) {
    this.container = container
    this.instance = container.querySelector('form')
    this.success = container.querySelector('.pages--fix__thank')
  }

  init () {
    this.instance.addEventListener('submit', e => {
      this.send(e)
    })
  }

  send (e) {
    e.preventDefault()
    const btn = this.instance.querySelector('.btn.send')
    btn.classList.add('processing')
    const url = this.instance.getAttribute('data-url')
    // eslint-disable-next-line no-undef
    const params = getFormData(this.instance)
    axios
      .post(url, params)
      .then(response => {
        const data = response.data
        btn.classList.remove('processing')
        if (data.error) {
          toast.danger(data.error)
        } else {
          this.toggleView()
        }
      })
      .catch(e => {
        btn.classList.remove('processing')
        toast.danger('Произошла ошибка, данные не отправлены')
      })
  }

  toggleView () {
    _$('.pages--title').classList.add('hidden')
    this.instance.classList.add('hidden')
    this.success.classList.remove('hidden')
  }
}

document.querySelectorAll('#mistake-form').forEach(item => {
  let form
  form = new MistakeForm(item)
  form.init()
})