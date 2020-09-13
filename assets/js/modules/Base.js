import axios from 'axios';
import io from 'socket.io-client'
import Inputmask from "inputmask";

const apiBaseUrl = 'https://api';
const initDefaults = () => {
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    window.socket = io.connect('https://');
    let token = document.head.querySelector('meta[name="csrf-token"]');
    window.review_sender_phone = null;
    if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content
    }
};

const isMobile = () => {
    return window.innerWidth <= 768
};

const showMessages = () => {
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
};

const parseHTML = (str) => {
    const tmp = document.implementation.createHTMLDocument()
    tmp.body.innerHTML = str
    return tmp.body.children
};

const changeCity = (city) => {
    axios.get('/setcity/' + city).then(function (response) {
        const data = response.data
        if (data.message == 'success') {
            window.location.href = data.url
        }
    })
};
const changeLang = (lang) => {
    axios.get('/lang/' + lang).then(function (response) {
        const data = response.data
        if (data.message == 'success') {
            window.location.reload()
        }
    })
};
const getCookieValue = (val) => {
    let cookies = {};
    document.cookie.split(';').map(item => {
        item = item.split('=')
        cookies[item[0].trim()] = item[1]
        return cookies
    });
    return cookies[val];
}
const getGa = () => {
    return getCookieValue('_ga');
};
const checkActiveSession = (phone, callback, errorCallback = null) => {
    axios.get(`${apiBaseUrl}/phone/guest/check/${phone}?ga=${getGa()}`)
        .then(response => {
            callback(response)
        }).catch(err => {
        if (errorCallback) {
            errorCallback(err)
        }
    })
}
const isElementOnFocus = (element) => {
    return element === document.activeElement
}
const initListeners = () => {
    document.querySelectorAll('.change-city').forEach(item => {
        item.addEventListener('change', e => {
            changeCity(e.currentTarget.value)
        })
    });

    document.querySelectorAll('.change-lang').forEach(item => {
        item.addEventListener('change', e => {
            changeLang(e.currentTarget.value)
        })
    });
    document.querySelectorAll('.dropdown[data-hash="city"]').forEach(dropdown => {
        dropdown.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', item => {
                const value = item.currentTarget.getAttribute('data-value');
                changeCity(value)
            })
        })
    })
};
const initMasks = () => {
    const inputMask = new Inputmask('+7 (999) 999-9999');
    const codeMask = new Inputmask('9999');
    document.querySelectorAll('.form--item__mobile').forEach(item => {
        inputMask.mask(item)
    });
    document.querySelectorAll('.codeInput').forEach(item => {
        codeMask.mask(item)
    })
};
const initRatingStarsButtons = () => {
    document.querySelectorAll('.set-rating__btn').forEach(item => {
        item.addEventListener('click', e => {
            const target = e.currentTarget;
            const container = target.closest('.set-rating');
            const input = container.querySelector('input');
            const val = container.querySelector('.set-rating_val');
            const rating = target.getAttribute('data-rating');
            if (!container.classList.contains('choosen')) {
                container.classList.add('choosen')
            }
            container.querySelectorAll('.choosen__btn').forEach(i => {
                i.classList.remove('choosen__btn')
            });
            item.classList.add('choosen__btn');
            input.value = rating * 2;
            val.innerHTML = rating + '.0'
        })
    })
};

const serializeArray = (form) => {
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
};
const getFormData = (form) => {
    const unindexed_array = serializeArray(form);
    const indexed_array = {};

    unindexed_array.map(function (n, i) {
        indexed_array[n.name] = n.value
    });

    return indexed_array
};

const scrollIt = (element) => {
    window.scrollTo({
        behavior: 'smooth',
        left: 0,
        top: element.offsetTop
    })
};

const initAnchorScrolling = () => {
    document.querySelectorAll('.js-anchor-link').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const target = e.currentTarget
            const text = target.innerText;
            const anchor = _$('.article--content').querySelectorAll('h2');
            anchor.forEach(item => {
                if (item.innerText == text) {
                    scrollIt(item)
                }
            })
        })
    })

};
const phoneFormat = (string, pad = false) => {
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
const initHeadInputSearch = () => {
    if (document.querySelector('.search form.search--head__input')) {
        document.querySelector('form.search--head__input').addEventListener('submit', e => {
            e.preventDefault();
            window.location.href = document.querySelector('#filterRedirectLink').getAttribute('href')
        })
    }
};

const init = () => {
    initDefaults();
    showMessages();
    initListeners();
    initMasks();
    initRatingStarsButtons();
    initAnchorScrolling();
    initHeadInputSearch()
};


export {
    init,
    apiBaseUrl,
    serializeArray,
    getGa,
    parseHTML,
    getFormData,
    scrollIt,
    isMobile,
    phoneFormat,
    isElementOnFocus,
    checkActiveSession
}