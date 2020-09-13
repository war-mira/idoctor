/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const _$ = document.querySelector.bind(document)
const _$$ = document.querySelectorAll.bind(document)
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
window.socket = io.connect('')
const token = document.head.querySelector('meta[name="csrf-token"]')
let review_sender_phone = null

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content
} else {
    // console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

function isMobile() {
    return window.innerWidth <= 768
}

if (typeof project !== 'undefined') {
    project.messages.forEach(function (msg) {
        try {
            if (msg.type == 'warning') {
                toast.warning(msg.msg)
            } else if (msg.type == 'success') {
                toast.success(msg.msg)
            } else {
                toast[msg.type](msg.msg)
            }
        } catch (err) {
        }
    })
}

function parseHTML(str) {
    const tmp = document.implementation.createHTMLDocument()
    tmp.body.innerHTML = str
    return tmp.body.children
}

function changeCity(city) {
    axios.get('/setcity/' + city).then(function (response) {
        const data = response.data
        if (data.message == 'success') {
            window.location.href = data.url
        }
    })
}
function phoneFormat (string, pad = false){
    let numstr = string.replace(/[^0-9]/g, '');
    if (numstr.length <= 0) {
        numstr = '7';
    }
    if (numstr[0] == '8') {
        numstr = '7' + numstr.substr(1);
    }
    if (numstr.length > 11) {
        numstr = numstr.substr(0, 11);

    } else {
        if (pad) {
            numstr = numstr.padEnd(11, '0');
        }
    }
    return numstr;
}
function changeLang(lang) {
    axios.get('/lang/' + lang).then(function (response) {
        const data = response.data
        if (data.message == 'success') {
            window.location.reload()
        }
    })
}

_$$('.change-city').forEach(item => {
    item.addEventListener('change', e => {
        changeCity(e.currentTarget.value)
    })
})
_$$('.change-lang').forEach(item => {
    item.addEventListener('change', e => {
        changeLang(e.currentTarget.value)
    })
})
_$$('.dropdown[data-hash="city"]').forEach(dropdown => {
    dropdown.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', item => {
            const value = item.currentTarget.getAttribute('data-value')
            changeCity(value)
        })
    })
})

const inputMask = new Inputmask('+7 (999) 999-9999')
const codeMask = new Inputmask('9999')
if (_$$('.form--item__mobile').length) {
    _$$('.form--item__mobile').forEach(item => {
        inputMask.mask(item)
    })
}
if (_$$('.codeInput').length) {
    _$$('.codeInput').forEach(item => {
        codeMask.mask(item)
    })
}

function serializeArray(form) {
    var field
    var l
    var s = []
    if (typeof form === 'object' && form.nodeName == 'FORM') {
        var len = form.elements.length
        for (var i = 0; i < len; i++) {
            field = form.elements[i]
            if (
                field.name &&
                !field.disabled &&
                field.type != 'file' &&
                field.type != 'reset' &&
                field.type != 'submit' &&
                field.type != 'button'
            ) {
                if (field.type == 'select-multiple') {
                    l = form.elements[i].options.length
                    for (j = 0; j < l; j++) {
                        if (field.options[j].selected) {
                            s[s.length] = {name: field.name, value: field.options[j].value}
                        }
                    }
                } else if (
                    (field.type != 'checkbox' && field.type != 'radio') ||
                    field.checked
                ) {
                    s[s.length] = {name: field.name, value: field.value}
                }
            }
        }
    }
    return s
}

function getFormData(form) {
    const unindexed_array = serializeArray(form)
    const indexed_array = {}

    unindexed_array.map(function (n, i) {
        indexed_array[n.name] = n.value
    })

    return indexed_array
}

_$$('.rating-set .rating__btn').forEach(item => {
    item.addEventListener('click', e => {
        const target = e.currentTarget
        const container = target.closest('.rating-set')
        const input = container.querySelector('input')
        const val = container.querySelector('.rating-set .rating_val')
        const rating = target.getAttribute('data-rating')
        if (!container.classList.contains('choosen')) {
            container.classList.add('choosen')
        }
        container.querySelectorAll('.choosen__btn').forEach(i => {
            i.classList.remove('choosen__btn')
        })
        item.classList.add('choosen__btn')
        input.value = rating * 2
        val.innerHTML = rating + '.0'
    })
})

function scrollIt(element) {
    window.scrollTo({
        behavior: 'smooth',
        left: 0,
        top: element.offsetTop
    })
}

_$$('.js-anchor-link').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault()
        const target = e.currentTarget
        const text = target.innerText
        const anchor = _$('.article--content').querySelectorAll('h2')
        anchor.forEach(item => {
            if (item.innerText == text) {
                scrollIt(item)
            }
        })
    })
})

if (_$('.skill-description--content')) {
    const btn = _$('#toggle__descr')
    btn.addEventListener('click', e => {
        _$$('.skill-description--content').forEach(item => {
            item.classList.toggle('hidden')
        })
        if (btn.innerHTML === 'Читать всё') {
            btn.innerHTML = 'Скрыть'
        } else {
            btn.innerHTML = 'Читать всё'
        }
    })
}

if (_$('.search form.search--head__input')) {
    _$('form.search--head__input').addEventListener('submit', e => {
        e.preventDefault()
        const link = _$('#filterRedirectLink').getAttribute('href')
        window.location.href = link
    })
}

const application = {
    appointments: []
}

document.querySelectorAll('.idoctor-widget').forEach(widget => {
    widget.addEventListener('idoctor-widget-failed', (e) => {
        widget.closest('.search--premium, .premium--profiles').remove()
        if (_$('.search--list.title-with-info > h2')) {
            _$('.search--list.title-with-info > h2').remove()
        }
       if (_$('.related-premium__dialog')) {
                _$('[data-open="related-premium"]').remove()
                _$('[data-type="related-premium"]').remove()
            }
    })
})
if (document.querySelector('.related-premium-link')) {
    document.querySelector('.related-premium-link').addEventListener('click', () => {
        setTimeout(() => {
            document.querySelector('.related-premium__dialog .idoctor-widget').dispatchEvent(new Event('re-render'))
        }, 1)
    })
}