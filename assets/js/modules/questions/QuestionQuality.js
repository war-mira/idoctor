import {isElementOnFocus} from "../Base";

class QuestionQuality {
    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        if (!value) {
            this.hideTips();
        }
        this.label.hidden = !value;

    }

    constructor(instance, parent = null) {
        this.instance = instance;
        this.quality = 'low';
        this.container = this.instance.closest('.quality-control');
        this.label = this.container.querySelector('.quality-control__label');
        this.labelType = this.container.querySelector('.quality-control__label-type');
        this.bottomTip = this.container.querySelector('.quality-control__tip-bottom');
        this.middleTip = this.container.querySelector('.quality-control__tip-middle');
        this.tips = [this.bottomTip, this.middleTip];
        this._visible = false;
        this.tipPosition = 'bottom';
        this.types = {
            'low': {
                'label': '<span class="red">Низкое</span>',
                'bottomTip': 'Чем лучше качество вашего вопроса, тем лучше врач сможет вас понять и развёрнуто ответить.',
                'tip': 'Пожалуйста, опишите ваш вопрос подробнее. '
            },
            'normal': {
                'label': '<span class="vivid_amber">Среднее</span>',
                'tip': 'Что ещё Вы можете сказать врачу?'
            },
            'high': {
                'label': '<span class="paolo_veronese">Высокое</span>',
                'tip': 'Отлично! Вы молодец! 👍🏼',
            },
        }
    }

    init() {
        ['input', 'focus', 'blur'].forEach(eventType => {
            this.instance.addEventListener(eventType, e => {
                this.check();
            }, true);
        })
    }

    check() {

        let value = this.instance.value;
        let length = value.length;
        if (!isElementOnFocus(this.instance) && !length) {
            this.visible = false;
            return;
        }
        if (length <= 100) {
            this.quality = 'low'
        } else if (length > 100 && length < 200) {
            this.quality = 'normal'
        } else {
            this.quality = 'high'
        }
        if (length < 3) {
            this.tipPosition = 'bottom';
        } else {
            this.tipPosition = 'middle';
        }
        this.showTipAndLabel();
    }

    hideTips() {
        this.tips.map(tip => tip.hidden = true)
    }

    showTipAndLabel() {
        this.visible = true;
        let type = this.types[this.quality];
        this.labelType.innerHTML = type.label;
        this.hideTips();
        if (this.tipPosition == 'bottom') {
            this.bottomTip.hidden = false;
            this.bottomTip.innerHTML = type.bottomTip;
        } else {
            this.middleTip.hidden = false;
            this.middleTip.innerHTML = type.tip;
        }

    }


}

export default QuestionQuality

