import axios from 'axios';
import QuestionSuggestion from "./QuestionSuggestion";
import {apiBaseUrl, checkActiveSession, getGa, isElementOnFocus, isMobile, phoneFormat} from '../Base'
import QuestionQuality from "./QuestionQuality";
import {toast} from '../notifications/Toast'
import Modal from "../common/Modal";

class AskForm {
    get timerSeconds() {
        return this._timerSeconds;
    }

    set timerSeconds(value) {
        this._timerSeconds = value;
        this.timerInstance.innerHTML = `00:${(value + "").padStart(2, "0")}`;
        if (!value) {
            this.clearTimer()
        }
    }

    constructor(instance) {
        this.instance = instance;
        this._canSubmit = false;
        this.title = this.instance.querySelector('#title');
        this.desc = this.instance.querySelector('#desc');
        this.skill = this.instance.querySelector('#skill');
        this.phone = this.instance.querySelector('#phone');
        this.smscode = this.instance.querySelector('#smscode');
        this.smscodeContainer = this.instance.querySelector('.sms-code');
        this.image = this.instance.querySelector('aside figure');
        this.submitButton = this.instance.querySelector('.questions-form__submit button');
        let suggestionSelector = (!isMobile() ? 'aside .questions--suggest' : 'section .questions--suggest');
        this.suggestions = new QuestionSuggestion(this.instance.querySelector(suggestionSelector), this);
        this.qualityControl = new QuestionQuality(this.desc);
        this.timer = null;
        this.timerInstance = this.instance.querySelector('.sms-code-timer');
        this._timerSeconds = 60;
        this.modal = new Modal(this.instance.querySelector('.dialog'))

    }

    get canSubmit() {
        return this._canSubmit;
    }

    set canSubmit(value) {
        this._canSubmit = value;
        this.submitButton.disabled = !value;
    }

    isOnFocus(element) {
        return element == document.activeElement;
    }

    init() {
        this.addListeners();
        this.qualityControl.init();
    }

    addListeners() {
        this.title.addEventListener('input', (e) => {
            this.suggestions.load(this.title.value)
        });
        this.phone.addEventListener('input', (e) => {
            this.canSubmit = false;
            this.checkPhone(this.phone.value)
        });
        this.smscode.addEventListener('input', (e) => {
            let code = this.smscode.value.replace(/_/g, '');
            if (code.length == 4) {
                this.checkCode()
            }
        });
        this.submitButton.addEventListener('click', e => {
            this.sendQuestion()
        })
        this.smscodeContainer.querySelectorAll('.send-code').forEach(i => i.addEventListener('click', e => this.requestCode(e)))
        this.tipsListener()
    }

    tipsListener() {
        ['focus', 'blur', 'input'].forEach(eventType => {
            this.instance.querySelectorAll('[data-tip]').forEach(item => {
                let attr = item.getAttribute('data-tip');
                if (this[attr]) {
                    this[attr].addEventListener(eventType, e => {
                        if (e.currentTarget.value.length) {
                            item.hidden = true;
                            return false;
                        }
                        let timeout = (attr === 'smscode') ? 500 : 1;
                        setTimeout(() => {
                            item.hidden = !isElementOnFocus(this[attr])
                        }, timeout)
                    })
                }
            })
        })
    }

    checkPhone(number) {
        let phone = phoneFormat(number);
        if (phone.length !== 11) {
            return false;
        }
        checkActiveSession(phone, (response) => {
            if (!response.data.success) {
                this.showCodeRequestButton();
            } else {
                this.canSubmit = true;
            }
        }, (err) => {

        })
    }

    clearTimer() {
        clearInterval(this.timer);
        this.timer = null;
        this.timerSeconds = 60;
        this.timerInstance.innerHTML = `01:00`;
    }

    reStartTimer() {
        this.clearTimer();
        this.timer = setInterval(() => {
            this.timerSeconds -= 1;
        }, 1000)
    }

    showCodeRequestButton() {
        this.smscodeContainer.classList.remove('hide');
    }


    checkCode() {
        let phone = phoneFormat(this.phone.value);
        axios.post(`${apiBaseUrl}/phone/guest/${phone}`, {
            code: this.smscode.value
        }).then((response) => {
            if (response.data.success) {
                this.canSubmit = true;
                toast.success('Телефон подтвержден')
            } else {
                toast.danger(response.data.msg);
            }
        }).catch(err => {
            toast.danger(err.response.data.msg);
        });
    }

    requestCode(e) {
        if (this.timer) {
            toast.info('Попробуйте позже');
            this.smscode.focus();
            return false;
        }
        let target = e.currentTarget;
        let phone = phoneFormat(this.phone.value);
        target.classList.add('processing');
        axios.get(`${apiBaseUrl}/phone/guest/${phone}?ga=${getGa()}`).then(response => {
            if (response.data.success) {
                this.smscodeContainer.classList.add('sended')
                this.reStartTimer();
                this.smscode.focus();
            }
        }).finally(() => {
            target.classList.remove('processing');
        })
    }

    sendQuestion() {
        if (!this.canSubmit) {
            toast.warning('Нужно подтвердить номер телефона')
            return;
        }
        this.submitButton.classList.add('processing');
        this.submitButton.disabled = true;
        axios.post(`${apiBaseUrl}/questions/ask`, {
            'title': this.title.value,
            'text': this.desc.value,
            'ga': getGa(),
            'phone': phoneFormat(this.phone.value),
            'skill_id': this.instance.querySelector('[name=skill_id]').value
        }).then(response => {
            if (response.data.data.id) {
                this.modal.open()
            }
        }).catch(err => {
            if (err.response.data.errors) {
                Object.values(err.response.data.errors).map(item => toast.danger(item[0], 7))
            }
        }).finally(() => {
            this.submitButton.classList.remove('processing');
            this.submitButton.disabled = false;
        })
    }
}

export default AskForm

