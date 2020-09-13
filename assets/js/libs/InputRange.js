class InputRange {
  constructor (container) {
    this.container = container
    this.instance = container.querySelector('input')
  }

  init () {
    this.modifyInputs()
  }

  modifyOffset () {
    let el, newPoint, newPlace, offset, siblings, k
    width = this.offsetWidth
    newPoint = (this.value - this.getAttribute('min')) / (this.getAttribute('max') - this.getAttribute('min'))
    offset = -1
    if (newPoint < 0) { newPlace = 0 } else if (newPoint > 1) { newPlace = width } else { newPlace = width * newPoint + offset; offset -= newPoint }
    siblings = this.parentNode.childNodes
    for (let i = 0; i < siblings.length; i++) {
      sibling = siblings[i]
      if (sibling.id == this.id) { k = true }
      if ((k == true) && (sibling.nodeName == 'OUTPUT')) {
        outputTag = sibling
      }
    }
    outputTag.style.left = newPlace + 'px'
    outputTag.style.marginLeft = offset + '%'
    outputTag.innerHTML = this.value
  }

  modifyInputs () {
    const input = this.instance
    input.onchange = this.modifyOffset

    const event = document.createEvent('Event')
    event.initEvent('change', true, true)
    input.addEventListener('change', function (e) { }, false)
    input.dispatchEvent(event)
  }
}

document.querySelectorAll('.range--container').forEach(item => {
  const wrapper = new InputRange(item)
  wrapper.init()
})
document.querySelectorAll('.filter--open').forEach(item => {
  item.addEventListener('click', e => {
    document.querySelectorAll('.range--container').forEach(item => {
      const wrapper = new InputRange(item)
      wrapper.init()
    })
  })
})
