/* eslint-disable prefer-const */
import axios from 'axios'
class MainSearch {
  constructor (instance) {
    this.instance = instance
    this.form = this.instance.querySelector('form')
    this.input = this.instance.querySelector('.system--search__input')
    this.close = this.instance.querySelector('.input--right')
    this.optionsInstance = document.querySelector('.system--search__options')
    this.submit = this.instance.querySelector('.search--btn')
    this.list = this.optionsInstance.querySelector('.system--search__list')
    this.title = this.optionsInstance.querySelector('.system--search__title')
    this.header = document.querySelector('.header-main__right')
  }

  init () {
    this.listenInputFocusing()
    this.listenInputEntering()
    this.listenInputClosing()
  }

  listenInputFocusing () {
    this.input.addEventListener('focus', e => {
      this.optionsInstance.classList.remove('hidden')
      this.close.classList.remove('hidden')
      this.submit.classList.remove('hidden')
      this.header.classList.add('header-main__right-normal')
    })
    let self = this
    window.addEventListener('click', e => {
      // close when clicked outside
      if (!self.input.contains(e.target)) {
        self.optionsInstance.classList.add('hidden')
        self.close.classList.add('hidden')
        self.submit.classList.add('hidden')
        this.header.classList.remove('header-main__right-normal')
      }
    })
  }

  listenInputEntering () {
    this.input.addEventListener('input', e => {
      const val = this.input.value

      if (val.length > 0) {
        this.getSearchSuggestions(val)
        this.submit.classList.remove('disabled')
      } else {
        this.submit.classList.add('disabled')
      }
    })
  }

  listenInputClosing () {
    this.close.addEventListener('click', e => {
      this.optionsInstance.classList.add('hidden')
      this.close.classList.add('hidden')
      this.submit.classList.add('hidden')
      this.clearSearchResult()
    })
  }

  clearSearchResult () {
    this.input.value = ''
    this.list.innerHTML = ''
  }

  getSearchSuggestions (val) {
    let query = val
    axios
      .get('https://api', {
        params: {
          query: query
        }
      })
      .then(response => {
        this.list.innerHTML = ''
        const data = response.data.data
        data.items.map(item => {
          this.createSearchOption(item)
        })
        if (data.length < 1) {
          this.title = 'Совпадений не найдено'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  createSearchOption (item) {
    let elem = document.createElement('li')
    let alias = this.form.querySelector('.search--alias').value
    let img = ''
    let link = ''
    if (item.type == 'medcenter' || item.type == 'doctor') {
      link = `/${alias}/${item.type}/${item.alias}`
      img = `<div class="icon-btn icon-btn--large icon-btn--none"><div class="avatar avatar--rounded">
              <img src="${item.avatar}" alt="${item.name}"/>
            </div></div>`
    } else {
      img = `<div class="system--search__item-icon"><svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <use xlink:href="#icon_search"></use>
            </svg></div>`
      link = `/search?query=${item.name}`
    }

    let template = `<a href=${link}><div class="icon-btn--wrapper icon-btn--gray system--search__line">
          ${img}
        <span class="system--search__item_name ml-2">${item.name}</span>
      </div></a>`
    elem.innerHTML = template
    this.list.append(elem)
  }
}

export default MainSearch
