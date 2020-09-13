import { init as initBase } from './Base'
import Banners from './Banners'
import AskForm from './questions/AskForm'
import PageSearch from './search/PageSearch'
import MainSearch from './search/MainSearch'
import Dropdown from './dropdown/Dropdown'
import MobileMenu from './menu/MobileMenu'
import SelectCity from './city/SelectCity'
import Dialog from './dialog/Dialog'
import SingleAutocomplete from './autocomplete/SingleAutocomplete'
import QuestionAnswerVote from './questions/QuestionAnswerVote'
import LoadMore from './pagination/LoadMore'

class Application {
  constructor () {
    initBase()
    this.dialogs = []
    this.swipers = []
    this.banners = []
    this.appointments = []
    this.instance = document.querySelector('#es-app')
    // Список доступных модулей
    this.modules = {
      'ask-question': AskForm,
      'mobile-menu': MobileMenu,
      select_city: SelectCity,
      search: MainSearch,
      'open--dialog': Dialog,
      'load-more': LoadMore,
      dropdown: Dropdown,
      'question-answer-vote': QuestionAnswerVote,
      'single-autocomplete': SingleAutocomplete,
      'skills-page-search': PageSearch
    }
    this.initedModules = []
  }

  init () {
    this.initBanners()
    this.initModules()
  }

  initModules () {
    const enabledModules = this.getModulesFromDOM()
    enabledModules.map(item => {
      if (this.modules[item.key]) {
        const module = new this.modules[item.key](item.element)
        module.init()
        this.initedModules.push(module)
      }
    })
  }

  /**
     * Смотрим есть ли у layout-а в дата атрибуте модули
     */
  getModulesFromDOM () {
    const modules = []
    this.instance.querySelectorAll('[data-module]').forEach(item => {
      modules.push({
        key: item.getAttribute('data-module'),
        element: item
      })
    })
    return modules
  }

  initBanners () {
    this.banners = new Banners()
  }
}

export default Application
