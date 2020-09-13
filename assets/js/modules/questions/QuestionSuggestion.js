import axios from 'axios';
import {parseHTML} from "../Base";

class QuestionSuggestion {


    constructor(instance, parent = null) {
        this.instance = instance;
        this.ajaxQuery = null;
        this._isShowed = false;
        this.source = null;
        this.parent = parent;
        this.items = '';
    }

    get isShowed() {
        return this._isShowed;
    }

    set isShowed(value) {
        this._isShowed = value;
        this.instance.hidden = !value;
        if (this.parent) {
            this.parent.image.hidden = value;
        }
    }

    getTipTemplate() {
        return `
        <div class="questions--suggest__tip">
                    <div class="questions--suggest__tip-title">
                        <i class="fa fa-info"></i>
                        Возможно, врач уже ответил на Ваш вопрос
                    </div>
                    <div class="questions--suggest__tip-content">
                        Чтобы сэкономить время наших пользователей на нахождение ответа на свой вопрос, также во избежание
                        дублирующихся вопросов, ниже найдены совпадения по вашему вопросу, возможно на ваш вопрос уже
                        отвечали.
                    </div>
                </div>
        `;
    }

    getTemplate() {
        return `${this.getTipTemplate()} 
                <div class="questions--suggest__items">
                  <div class="questions--suggest__items-title">Возможные совпадения</div>
                    <div class="questions--suggest__items-content"></div>
                  </div>
        `
    }

    load(value) {
        if (this.ajaxQuery) {
            this.source.cancel();
        }
        this.source = axios.CancelToken.source();
        this.ajaxQuery = axios.post('/questions/suggestions', {
            title: value
        }, {
            cancelToken: this.source.token
        }).then(response => {
            if (response.data.success) {
                this.show(response.data.html);
                this.ajaxQuery = null;
            } else {
                this.isShowed = false
            }

        }).catch(err => {

        })
    }

    show(data) {
        if (!this.isShowed) {
            this.instance.innerHTML = '';
            let baseTemplate = parseHTML(this.getTemplate());
            [...baseTemplate].forEach(item => {
                this.instance.append(item);
            });
            this.isShowed = true;
        }
        let html = parseHTML(data);
        this.instance.querySelector('.questions--suggest__items-content').innerHTML = '';
        [...html].forEach(item => {
            this.instance.querySelector('.questions--suggest__items-content').append(item);
        });
    }

}

export default QuestionSuggestion

