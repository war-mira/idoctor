class Filters {
  constructor (container = null) {
    this.container = document.querySelector(container !== null ? container : '#filtersGroup')
    this.order = this.container.querySelectorAll('input[name="order"]')
    this.sort = this.container.querySelectorAll('input[name="sort"]')
    this.sort_input = document.querySelector('.search-bar__line input[name="sort"]')
    this.order_input = document.querySelector('.search-bar__line input[name="order"]')
    this.form = document.querySelector('.questions__search--form')
  }

  changeOrder (target) {
    if (target.classList.contains('btn_theme_radio_active')) {
      if (this.order_input.value == 'desc') {
        this.order_input.value = 'asc'
      } else {
        this.order_input.value = 'desc'
      }
    } else {
      this.order_input.value = 'desc'
    }
  }

  reloadPage () {
    this.form.submit()
  }

  changeSort (target) {
    const input = target.querySelector('input[name="sort"]')
    this.sort_input.value = input.value
  }

  initSort () {
    this.sort.forEach((item) => {
      item.closest('.sort__change').addEventListener('click', (e) => {
        const target = e.target
        this.changeOrder(target)
        this.changeSort(target)
        this.reloadPage()
      })
    })
  }

  init () {
    this.initSort()
  }
}

if (document.querySelector('.group__filters')) {
  const filters = new Filters('.group__filters')
  filters.init()
}
