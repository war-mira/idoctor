import {parseHTML} from "../Base"

class SingleAutocomplete {
    get options() {
        return this._options;
    }

    set options(value) {
        this._options = value;
        (value.length && this.input.value.length) ? this.showOptions() : this.hideOptions()

    }

    get target() {
        if (!this._target) {
            return this.instance
        }
        return this._target;
    }

    set target(value) {
        this._target = value;
    }

    constructor(instance) {
        this.instance = instance;
        this.input = this.instance.querySelector('input[type=text]');
        this.optionsContainer = this.instance.querySelector('.single-autocomplete__options');
        this.model = this.instance.getAttribute('model');
        this.attr = this.instance.getAttribute('search_attr');
        this._target = this.instance.getAttribute('target');
        this.uid = Math.random().toString(36).substring(7);
        this.iid = this.model + this.uid;
        this._options = [];
        this.selectOptions = [];
    }

    getOptionsTemplate(option) {
        return `<div class="single-autocomplete__options-item" data-id="${option.value}">${option.label}</div>`
    }

    init() {
        this.input.addEventListener('input', e => {
            this.options = this.selectOptions.filter(item => item.label.toLowerCase().includes(this.input.value.toLowerCase()))
        })
        if (this.instance.querySelector('select')) {
            [...this.instance.querySelector('select').options].forEach(option => {
                this.selectOptions.push({label: option.label, value: option.value});
            })
        }
    }

    select(item) {
        this.input.value = item.label;
        this.instance.querySelector(`[name=${this.target}]`).value = item.value;
        this.hideOptions();
    }

    showOptions() {
        this.optionsContainer.hidden = false;
        this.optionsContainer.innerHTML = '';
        this.options.map((value) => {
            let element = parseHTML(this.getOptionsTemplate(value))[0];
            element.addEventListener('click', e => {
                this.select(value)
            });
            this.optionsContainer.append(element);
        });

    }

    hideOptions() {
        this.optionsContainer.hidden = true;
    }
}

export default SingleAutocomplete;