class Map {
  constructor (instance) {
    this.instance = instance
    this.map = null
    this.center = this.getDefaultCenter()
    this.radius = 500
    this.zoom = 16
    this.openBalloon = null
    this.points = []
    this.sortedPoints = []
    this.listContainer = this.instance.querySelector('.map-container__list')
    this.searchButtons = this.instance.parentNode.querySelector(
      '.search--buttons'
    )
    this.listContainerItem = 0
    this.selectedItem = null
    this.myLocation = null
    this.objectManager = []
  }

  getFromUrl () {
    const url = new URL(window.location.href)
    if (url.searchParams.get('distance')) {
      const latitude = parseFloat(url.searchParams.get('geo[0]'))
      const longitude = parseFloat(url.searchParams.get('geo[1]'))
      const radius = url.searchParams.get('distance')
      const zoom = url.searchParams.get('zoom')
      const openBalloon = 'medcenter_' + url.searchParams.get('active')
      this.center = [latitude, longitude]
      this.radius = radius
      this.zoom = zoom
      this.openBalloon = openBalloon
    }
    // this.map.setCenter([point.geo.latitude, point.geo.longitude]);
  }

  getDefaultCenter () {
    const self = this
    this.center = [
      parseFloat(mapCenter.latitude),
      parseFloat(mapCenter.longitude)
    ]
    // Функция получения мои координаты и делает их центром
    // в случает отсутствия центром становится центр города что есть глобальная переменная\
    if (navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          var crd = pos.coords
          self.myLocation = [crd.latitude, crd.longitude]
          self.center = [crd.latitude, crd.longitude]
        },
        () => {
          self.center = [
            parseFloat(mapCenter.latitude),
            parseFloat(mapCenter.longitude)
          ]
        },
        {}
      )
    }

    return self.center
  }

  init () {
    // Функция загрузки API Яндекс.Карт по требованию
    var script = document.createElement('script')

    if (script.readyState) {
      // IE
      script.onreadystatechange = function () {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null
          this.loadYandexMap(this)
        }
      }
    } else {
      // Другие браузеры
      script.onload = this.loadYandexMap(this)
    }

    script.type = 'text/javascript'
    script.async = true
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
    document.body.appendChild(script)
  }

  loadYandexMap (self) {
    // пересмотреть сделать с проверкой загрузки yandex layers
    const load_map = this.isMapLoaded()
    load_map
      .then(() => {
        // let x =
        //   Math.sqrt(self.radius * 1.5) * Math.cos((90 * 180) / Math.PI) +
        //   self.center[0];
        // let y =
        //   Math.sqrt(self.radius * 1.5) * Math.sin((90 * 180) / Math.PI) + self.center[1];
        // let x1 = self.center[0] - Math.sqrt(self.radius * 1.5) * Math.cos((90 * 180) / Math.PI);
        // let y1 =
        //   self.center[1] - Math.sqrt(self.radius * 1.5) * Math.sin((90 * 180) / Math.PI);
        // let w = self.instance.querySelector('.map-yandex').offsetWidth,
        //   h = self.instance.querySelector('.map-yandex').offsetHeight;
        // let CenterAndZoom = ymaps.util.bounds.getCenterAndZoom(
        //   [
        //     [x, y],
        //     [x1, y1]
        //   ],
        //   [w, h]
        // );
        // console.log(CenterAndZoom);
        let map, center, zoom
        const collect_data = new Promise((resolve, reject) => {
          this.getFromUrl()
          center = this.center
          zoom = this.zoom
          map = self.instance.querySelector('.map-yandex')
          resolve()
        })

        collect_data.then(function () {
          // Как только будет загружен API и готов DOM, выполняем инициализацию
          ymaps.ready(function () {
            self.map = new ymaps.Map(map, {
              center: center,
              zoom: zoom,
              controls: []
            })
            if (self.myLocation) {
              self.displayLocation()
            }
            const bounds = self.map.getBounds()
            self.setDistance(bounds)
            self.create()
            self.zoomed()
            self.drag()
          })
        })
      })
      .catch(() => {
        console.warn('yandex map not loaded')
      })
  }

  isMapLoaded () {
    // пытается вызвать карту яндекс при неудачи загрузаить за 0.5 с пытается снова и так 50 раз
    const load_map = new Promise((resolve, reject) => {
      let i = 0
      const checker = setInterval(() => {
        if (i > 50) {
          reject()
        }
        try {
          ymaps.Map()
        } catch (e) {
          if (e instanceof ReferenceError) {
            i++
          } else {
            clearInterval(checker)
            resolve()
          }
        }
      }, 500)
    })
    return load_map
  }

  setDistance (bounds) {
    // считает расстояние от  до каардинаты в виде массива передаются
    //  всегда используется для расчета от центра до кравев карты
    const distance =
      ymaps.coordSystem.geo.getDistance(bounds[0], bounds[1]) / 2 / 1.5
    this.radius = Math.round(distance)
  }

  drag () {
    const self = this
    this.listContainerItem = 0
    // при смене края карты запускается функция
    this.map.events.add('boundschange', function (event) {
      // проверка нового и старого центра
      if (event.get('oldCenter') !== event.get('newCenter')) {
        self.map.setCenter(event.get('newCenter'))
        self.center = event.get('newCenter')
        self.setDistance(event.get('newBounds'))
        self.replaceRoute()
        // считает дистанцию от старого до нового центра если расстояние больше 2км тогда загрузка новых данных
        const distance = ymaps.coordSystem.geo.getDistance(
          event.get('oldCenter'),
          event.get('newCenter')
        )
        if (distance > 500) {
          self.update()
        }
      }
    })
  }

  zoomed () {
    const self = this
    this.listContainerItem = 0
    // при смене края карты запускается функция
    this.map.events.add('boundschange', function (event) {
      // проверка нового и старого zoom и только когда зум уменьшается запрашивать новые данные
      // так как уже есть дата в этой области
      if (event.get('newZoom') !== event.get('oldZoom')) {
        self.zoom = event.get('newZoom')
        self.setDistance(event.get('newBounds'))
        self.update()
        // if( event.get('newZoom') < event.get('oldZoom')){
        //   self.setDistance(event.get('newBounds'));
        //   self.update();
        // }
      }
    })
  }

  create () {
    const request = this.request()
    this.updateRoute()
    request.then(response => {
      const notExist = this.updatePoints(response.data.points)
      this.addPoints(notExist)
      if (this.openBalloon) {
        this.openBaloon(this.openBalloon, this)
      }
    })
  }

  update () {
    const request = this.request()
    this.replaceRoute()
    request.then(response => {
      const notExist = this.updatePoints(response.data.points)
      this.addPoints(notExist)
    })
  }

  addPoints (notExist) {
    // делим новую дату на 100 и подгружаем по 100 маркеров
    if (notExist.length > 500) {
      const num = parseInt(notExist.length / 500)
      const res = notExist.length % 500
      for (let i = 0; i <= num; i++) {
        this.displayPoints(notExist.slice(500 * i, 500 * (i + 1)))
      }
      this.displayPoints(notExist.slice(500 * num, 500 * num + res - 1))
    } else {
      this.displayPoints(notExist.slice(0, notExist.length))
    }
    if (window.Worker) {
      const mapWorker = new Worker('/build/js/worker.js')
      mapWorker.postMessage([this.points, this.center])
      // console.log('Message posted to worker')
      const self = this
      mapWorker.onmessage = arr => {
        self.sortedPoints = arr.data
        self.updateList()
        // console.log('Message received from worker')
      }
    } else {
      this.sortPoints()
      this.updateList()
    }
  }

  displayLocation () {
    var default_point = ymaps.templateLayoutFactory.createClass(
      '<div class="map-point__me"></div>'
    )
    const myGeo = new ymaps.Placemark(
      this.myLocation,
      {
        balloonContent: 'Мое местоположение'
      },
      {
        iconLayout: 'default#imageWithContent',
        // The size of the placemark.
        iconImageSize: [40, 40],
        iconImageOffset: [-20, -20],
        // Content layout.
        iconContentLayout: default_point
      }
    )
    this.map.geoObjects.add(myGeo)
  }

  request () {
    let url = new URL(window.location.href)
    url.searchParams.append('geo[0]', this.center[0])
    url.searchParams.append('geo[1]', this.center[1])
    url.searchParams.append('distance', this.radius)
    url = url.toString()
    return axios.get(url)
  }

  updateRoute () {
    const url = new URL(window.location.href)
    const search_params = new URLSearchParams(url.search.slice(1))
    search_params.set('geo[0]', this.center[0])
    search_params.set('geo[1]', this.center[1])
    search_params.set('distance', this.radius)
    search_params.set('zoom', this.zoom)
    url.search = search_params.toString()
    history.pushState(null, null, url.toString())
  }

  replaceRoute () {
    const url = new URL(window.location.href)
    const query_string = url.search
    const search_params = new URLSearchParams(query_string)
    search_params.delete('active')
    search_params.set('geo[0]', this.center[0])
    search_params.set('geo[1]', this.center[1])
    search_params.set('distance', this.radius)
    search_params.set('zoom', this.zoom)
    url.search = search_params.toString()
    history.replaceState(null, null, url.toString())
  }

  displayPoints (notExist) {
    const self = this
    var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
      '<div class="popover-content">$[properties.balloonContent]</div>',
      {
        build: function () {
          this.constructor.superclass.build.call(this)
          self.searchButtons.classList.add('hide')
        },
        clear: function () {
          self.searchButtons.classList.remove('hide')
          this.constructor.superclass.clear.call(this)
        }
      }
    )
    const customBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
      `<ul>
        {% for geoObject in properties.geoObjects %}
        <li>$[geoObject.properties.balloonContentBody]</li>
        {% endfor %}
      </ul>`
    )
    const objectManager = new ymaps.ObjectManager({
      // Чтобы метки начали кластеризоваться, выставляем опцию.
      clusterize: true,
      clusterDisableClickZoom: false,
      clusterOpenBalloonOnClick: true,
      // Cluster Layout
      clusterBalloonLayout: this.getBalloonLayout(),
      clusterBalloonContentLayout: customBalloonContentLayout
    })
    if (notExist.length > 0) {
      var objects = []
      notExist.forEach(point => {
        objects.push({
          type: 'Feature',
          id: point.object_id,
          geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(point.geo.latitude),
              parseFloat(point.geo.longitude)
            ]
          },
          properties: {
            balloonContent: this.getBalloonTemplate(point),
            balloonContentBody: this.getClusterBalloonTemplate(point),
            hintContent: point.name,
            iconContent: point.isTop
          },
          options: {
            balloonPanelMaxMapArea: 768 * 420,
            iconLayout: 'default#imageWithContent',
            // Balloon Layout
            balloonLayout: this.getBalloonLayout(),
            balloonContentLayout: MyBalloonContentLayout,
            hideIconOnBalloonOpen: false,
            balloonOffset: [5, 0],
            // The size of the placemark.
            iconImageSize: [20, 20],
            iconImageOffset: [-10, -10],
            iconShape: {
              type: 'Rectangle',
              // Прямоугольник описывается в виде двух
              // точек - верхней левой и нижней правой.
              coordinates: [
                [-5, -20],
                [150, 25]
              ]
            },
            // Content layout.
            iconContentLayout: this.pointTemplate(point.name, point.isTop)
          }
        })
      })
      objectManager.add(objects)
      this.objectManager.push(objectManager)
      var selected_point = ymaps.templateLayoutFactory.createClass(
        `<div class="map-point__wrapper">
          <div class="map-point__selected"></div>
        </div>`
      )
      const self = this
      objectManager.objects.events.add('balloonopen', function (e) {
        var objectId = e.get('objectId')
        objectManager.objects.setObjectOptions(objectId, {
          iconContentLayout: selected_point
        })
      })
      objectManager.objects.events.add('balloonclose', function (e) {
        var objectId = e.get('objectId')
        var el = objectManager.objects.getById(objectId)
        objectManager.objects.setObjectOptions(objectId, {
          iconContentLayout: self.pointTemplate(
            el.properties.hintContent,
            el.properties.iconContent
          )
        })
      })
      this.map.geoObjects.add(objectManager)
    }
  }

  pointTemplate (name, isTop) {
    if (isTop) {
      return ymaps.templateLayoutFactory.createClass(
        `<div class="map-point__wrapper">
          <div class="map-point__top"></div>
          <span class="map-point__text">${name}</span>
        </div>`
      )
    } else {
      return ymaps.templateLayoutFactory.createClass(
        `<div class="map-point__wrapper">
          <div class="map-point"></div>
          <span class="map-point__text">${name}</span>
        </div>`
      )
    }
  }

  updatePoints (points) {
    // метод для проверки новых данных на наличие в существующих поинтах
    let notExistAll = []
    if (points.length > 0) {
      if (this.points.length > 0) {
        var notExist = points.filter(
          item1 =>
            !this.points.some(
              item2 => item2.id === item1.id && item2.name === item1.name
            )
        )
        if (notExist.length > 0) notExistAll = notExist
      } else {
        notExistAll = points
      }
      this.points = this.points.concat(notExistAll)
    }

    return notExistAll
  }

  sortPoints () {
    // сортирует поинты по дистанции с центра до точек
    // используется для отображения списка блиажайших
    this.sortedPoints = this.points
    const self = this
    this.sortedPoints.sort(function (a, b) {
      var r = ymaps.coordSystem.geo.getDistance(
        [a.geo.latitude, a.geo.longitude],
        self.center
      )
      var k = ymaps.coordSystem.geo.getDistance(
        [b.geo.latitude, b.geo.longitude],
        self.center
      )
      return r - k
    })
  }

  updateList () {
    this.listContainer.classList.add('active')
    const self = this
    const lists = this.sortedPoints.slice(
      20 * this.listContainerItem,
      20 * (this.listContainerItem + 1)
    )
    // удаляет все жлементы в листе ближайших
    if (this.listContainerItem === 0) {
      while (this.listContainer.firstChild) {
        this.listContainer.removeChild(this.listContainer.firstChild)
      }
    }
    // добавляет в лист ближайших
    lists.map(point => {
      const template = this.getListItemTemplate(point)
      if (
        this.listContainer.querySelector('.map-container__list--item__btn') !==
        null
      ) {
        const btn = this.listContainer.querySelector(
          '.map-container__list--item__btn'
        )
        this.listContainer.insertBefore(template, btn)
      } else {
        this.listContainer.appendChild(template)
      }
    })
    if (this.sortedPoints.length > 20) {
      if (this.listContainerItem === 0) {
        var btn = document.createElement('div')
        btn.setAttribute('class', ' map-container__list--item__btn')
        var btn_span = document.createElement('span')
        btn_span.setAttribute('class', 'btn btn--secondary btn--medium')
        btn_span.classList.add('map-container__list--item__btn-text')
        btn_span.innerHTML = 'Загрузить еще'
        var btn_icon = document.createElement('span')
        btn_icon.classList.add('map-container__list--item__btn-icon')
        btn.appendChild(btn_span)
        btn.appendChild(btn_icon)
        btn.addEventListener('click', () => {
          self.showMore(self)
        })
        this.listContainer.appendChild(btn)
      }
    } else {
      if (
        this.listContainer.querySelector('.map-container__list--item__btn') !==
        null
      ) {
        const btn = this.listContainer.querySelector(
          '.map-container__list--item__btn'
        )
        this.listContainer.removeChild(btn)
      }
    }
  }

  getListItemTemplate (point) {
    const self = this
    var div = document.createElement('div')
    div.setAttribute('class', 'map-container__list--item')
    div.addEventListener('click', () => {
      self.openBaloon(point.object_id, self)
    })
    const distance =
      Math.round(
        (ymaps.coordSystem.geo.getDistance(
          [parseFloat(point.geo.latitude), parseFloat(point.geo.longitude)],
          self.center
        ) /
          1000) *
          100
      ) /
        100 +
      ' км '
    const work_time = point.schedule
      ? `
        <div class="map-container__list--item__work-time">
          <i class="far fa-clock"></i>
          <div>${point.schedule}</div>
        </div>
      `
      : ''
    div.innerHTML = `
      <div class="map-container__list--item_wrapper">
        ${
          point.isTop
            ? '<div class="map-container__list--item__top"></div>'
            : ''
        }
            <div class="map-container__list--item__block">
                <div class="map-container__list--item__img">
                  <img src="${point.avatar}" />
                </div>
              <div class="map-container__list--item__review">
                ${point.reviewsCount} отзывов
              </div>
            </div>
            <div  class="map-container__list--item__block">
                <div class="${
                  point.isTop
                    ? 'map-container__list--item__name pr-9'
                    : 'map-container__list--item__name'
                }">
               
                  ${
                    point.name.length > 30
                      ? point.name.slice(0, 30) + '...'
                      : point.name
                  }
                  <span> 
                  ${distance}
                  </span>
                </div>
                 
            </div>
            <div  class="map-container__list--item__block">
                ${work_time}
              
                 <div class="map-container__list--item__address">
                  <svg width="9" height="13" viewBox="0 0 9 13" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                    <use xlink:href="#locationMap"></use>
                  </svg>
                  <div>
                  ${
                    point.geo.address.length > 30
                      ? point.geo.address.slice(0, 150) + '...'
                      : point.geo.address
                  }
                  </div>
                </div>
            </div>
            
            </div>
            `
    // <div class='map-container__list--item__rating'>
    //   <div class='map-container__list--item__rating--stars'>
    //     <i
    //       class="${
    //     point.rang - 1 > 1
    //       ? 'fas fa-star'
    //       : point.rang - 1 >= 0.5
    //       ? 'fas fa-star-half-alt'
    //       : 'far fa-star'
    //   }"
    //       aria-hidden='true'
    //     ></i>
    //     <i
    //       class="${
    //     point.rang - 2 > 1
    //       ? 'fas fa-star'
    //       : point.rang - 2 >= 0.5
    //       ? 'fas fa-star-half-alt'
    //       : 'far fa-star'
    //   }"
    //       aria-hidden='true'
    //     ></i>
    //     <i
    //       class="${
    //     point.rang - 3 > 1
    //       ? 'fas fa-star'
    //       : point.rang - 3 >= 0.5
    //       ? 'fas fa-star-half-alt'
    //       : 'far fa-star'
    //   }"
    //       aria-hidden='true'
    //     ></i>
    //     <i
    //       class="${
    //     point.rang - 4 > 1
    //       ? 'fas fa-star'
    //       : point.rang - 4 >= 0.5
    //       ? 'fas fa-star-half-alt'
    //       : 'far fa-star'
    //   }"
    //       aria-hidden='true'
    //     ></i>
    //     <i
    //       class="${
    //     point.rang - 5 > 1
    //       ? 'fas fa-star'
    //       : point.rang - 5 >= 0.5
    //       ? 'fas fa-star-half-alt'
    //       : 'far fa-star'
    //   }"
    //       aria-hidden='true'
    //     ></i>
    //   </div>
    //   <div class='map-container__list--item__rating--val'>
    //     ${point.rang}
    //   </div>
    // </div>;
    return div
  }

  getBalloonLayout () {
    var MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
      '<div class="popover">' +
        `<div class="icon-btn--wrapper icon-btn--dark" >
            <div class="icon-btn icon-btn--rounded">
              <i class="fas fa-times"></i>
            </div>
          </div>
  ` +
        '<div class="arrow"></div>' +
        '$[[options.contentLayout observeSize minWidth=235 maxWidth=235 maxHeight=350]]' +
        '</div>',
      {
        build: function () {
          this.constructor.superclass.build.call(this)
          const parent = this.getParentElement()
          this._$element = parent.querySelector('.popover')
          this.applyElementOffset()
          this._$element
            .querySelector('.icon-btn--wrapper')
            .addEventListener('click', this.onCloseClick.bind(this))
          if (this._$element.querySelector('.phones.phones--multiple')) {
            const phone_el = this._$element.querySelector(
              '.phones.phones--multiple'
            )
            const phones = new MultiplePhones(phone_el)
            phones.init()
          }
        },
        clear: function () {
          this._$element
            .querySelector('.icon-btn--wrapper')
            .removeEventListener('click', this.onCloseClick.bind(this))
          this.constructor.superclass.clear.call(this)
        },
        onSublayoutSizeChange: function () {
          MyBalloonLayout.superclass.onSublayoutSizeChange.apply(
            this,
            arguments
          )

          if (!this._isElement(this._$element)) {
            return
          }

          this.applyElementOffset()

          this.events.fire('shapechange')
        },
        applyElementOffset: function () {
          this._$element.setAttribute(
            'style',
            `left: ${this._$element.querySelector('.arrow').offsetWidth / 2 +
              5 +
              'px'};
              top: ${-((this._$element.offsetHeight - 30) / 2) + 'px'};
            `
          )
        },
        onCloseClick: function (e) {
          e.preventDefault()
          this.events.fire('userclose')
        },
        getShape: function () {
          if (!this._isElement(this._$element)) {
            return MyBalloonLayout.superclass.getShape.call(this)
          }

          return new ymaps.shape.Rectangle(
            new ymaps.geometry.pixel.Rectangle([
              [this._$element.offsetLeft, this._$element.offsetTop],
              [
                this._$element.offsetLeft + this._$element.offsetWidth,
                this._$element.offsetTop +
                  this._$element.offsetHeight +
                  this._$element.querySelector('.arrow').offsetHeight
              ]
            ])
          )
        },
        _isElement: function (element) {
          return element && element.querySelector('.arrow')
        }
      }
    )
    return MyBalloonLayout
  }

  getClusterBalloonTemplate (point) {
    const clusterBalloon = `
      <a href="${point.url}" target="_blank" class="map-cluster">
        <div class="map-cluster__block">
          <div class="map-cluster__img">
            <img src="${point.avatar}" >
          </div>
          <div class="map-cluster__name">${point.name}</div>
        </div>
        <div class="map-cluster__address">
          <svg width="9" height="13" viewBox="0 0 9 13" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <use xlink:href="#locationMap"></use>
          </svg>
          <div>${point.geo.address}</div>
        </div>
        
      </a>`
    return clusterBalloon
  }

  getBalloonTemplate (point) {
    const type = point.object_id.slice(0, point.object_id.indexOf('_'))
    const id = point.object_id.slice(point.object_id.indexOf('_') + 1)
    const work_time = point.schedule
      ? `<div class="map-balloon__work-time">
              <i class="far fa-clock"></i>
              <div>${point.schedule}</div>
            </div>`
      : ''
    const BalloonContentTemplate = `
    <div  class="map-balloon">
        <div class="map-balloon__header">
            <div  class="map-balloon__header__rating">
            </div>
            <div class="map-balloon__header-review">
            ${point.reviewsCount} отзывов
            </div>
            
        </div>
        <a href="${point.url}" target="_blank"  class="map-balloon__block">
            <div class="map-balloon__block-wrap">
              <div class="map-balloon__img">
                  <img src="${point.avatar}" >
              </div>
              <div class="map-balloon__name">${point.name}</div>
            </div>
            
            <div class="map-balloon__address">
              <svg width="9" height="13" viewBox="0 0 9 13" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                    <use xlink:href="#locationMap"></use>
                </svg>
            <div>${point.geo.address}</div>
            </div>
            ${work_time}
            
        </a>
        <div  class="map-balloon__block">
          <div class="phones phones--multiple"
                  model="${type}" data-id="${id}">
              <div class="phones--container">
                  <div class="btn btn--primary btn--small btn--rounded show__list">
                    <i class="fa fa-phone mr-1"></i>
                    Показать номер
                  </div>
                  <div class="phones--list">
                      <div class="phones--list__title phones--list__close text-center">
                        Закрыть
                        <i class="fa fa-times"></i></div>
                        <div class="phones--list__content">
                      </div>
                  </div>
              </div>
          </div>
        </div>
        
        
      </div>
      `
    //  <div class="map-balloon__header__rating--stars">
    //       <i class="${
    //         point.rang - 1 > 1
    //           ? 'fas fa-star'
    //           : point.rang - 1 >= 0.5
    //           ? 'fas fa-star-half-alt'
    //           : 'far fa-star'
    //       }" aria-hidden="true"></i>
    //       <i class="${
    //         point.rang - 2 > 1
    //           ? 'fas fa-star'
    //           : point.rang - 2 >= 0.5
    //           ? 'fas fa-star-half-alt'
    //           : 'far fa-star'
    //       }" aria-hidden="true"></i>
    //       <i class="${
    //         point.rang - 3 > 1
    //           ? 'fas fa-star'
    //           : point.rang - 3 >= 0.5
    //           ? 'fas fa-star-half-alt'
    //           : 'far fa-star'
    //       }" aria-hidden="true"></i>
    //       <i class="${
    //         point.rang - 4 > 1
    //           ? 'fas fa-star'
    //           : point.rang - 4 >= 0.5
    //           ? 'fas fa-star-half-alt'
    //           : 'far fa-star'
    //       }" aria-hidden="true"></i>
    //       <i class="${
    //         point.rang - 5 > 1
    //           ? 'fas fa-star'
    //           : point.rang - 5 >= 0.5
    //           ? 'fas fa-star-half-alt'
    //           : 'far fa-star'
    //       }" aria-hidden="true"></i>
    //     </div>
    //     <div class="map-balloon__header__rating--val">${
    //       point.rang
    //     }</div>
    return BalloonContentTemplate
  }

  parseHTML (str) {
    const tmp = document.implementation.createHTMLDocument()
    tmp.body.innerHTML = str
    return tmp.body.children
  }

  showMore (self) {
    self.listContainerItem = self.listContainerItem + 1
    self.updateList()
  }

  openBaloon (object_id, self) {
    self.objectManager.forEach(el => {
      var objectState = el.getObjectState(object_id)
      // Проверяем, находится ли объект в видимой области карты.
      if (objectState.found && objectState.isShown) {
        // Если объект попадает в кластер, открываем балун кластера с нужным выбранным объектом.
        if (objectState.isClustered) {
          el.clusters.state.set('activeObject', object_id)
          el.clusters.balloon.open(objectState.cluster.id)
        } else {
          // Если объект не попал в кластер, открываем его собственный балун.
          el.objects.balloon.open(object_id)
        }
      }
    })
  }
}
document.querySelectorAll('.map-container').forEach(instance => {
  const displayToogle = document.querySelectorAll(
    `.display--toogle[data-show=${instance.getAttribute('data-type')}]`
  )
  // в браузере кнопка назад или вперед
  window.onpopstate = function (event) {
    document.location.reload(true)
  }
  var url = new URL(window.location.href)
  var searchParams = url.searchParams.get('distance')
  // проверка по роуту чтоб сразу открывал
  if (searchParams) {
    // toogle button
    var searchParamsType = 'showMedMap'
    const displayToogleUrl = document.querySelector(
      `.display--toogle[data-show=${instance
        .getAttribute('data-type')
        .slice(0, 7) + 'List'}]`
    )
    const displayToogleUrlAll = document.querySelectorAll(
      `.display--toogle[data-show=${instance
        .getAttribute('data-type')
        .slice(0, 7) + 'List'}]`
    )
    const displayToogleAll = document.querySelectorAll('.display--toogle')
    displayToogleAll.forEach(el => {
      el.classList.add('hide--toogle')
    })
    displayToogleUrlAll.forEach(el => {
      el.classList.remove('hide--toogle')
    })
    // displayToogleUrlAll.classList.remove('hide--toogle')
    // map el show
    // костыль
    const displayElUrl = document.querySelector(
      `.display--el[data-type=${searchParamsType}]`
    )
    const displayElAll = document.querySelectorAll('.display--el')

    displayElAll.forEach(el => {
      el.classList.remove('show--el')
    })
    displayElUrl.classList.add('show--el')
    // длф того чтобы менять стили если при тугле что-то меняется
    const parent = displayToogleUrl.closest('.display--parent')
    parent.classList.add('style--parent')
    const map = new Map(instance)
    map.init()
  } else {
    displayToogle.forEach(el => {
      el.addEventListener('click', e => {
        const map = new Map(instance)
        map.init()
        // }
      })
    })
  }
})
