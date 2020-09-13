class Modal {
    constructor(instance, caller = null) {
        this.caller = caller;
        this.instance = instance;
        this.background = this.instance.querySelector('.dialog--background')
    }

    init() {
        this.initButtons()
    }

    initButtons() {
        this.caller.addEventListener('click', e => {
            this.toggle();
        });
        this.background.addEventListener('click', e => {
            this.close()
        });
        if (this.instance.querySelector('.dialog--close')) {
            this.instance.querySelectorAll('.dialog--close').forEach(item => {
                item.addEventListener('click', e => {
                    this.close()
                })
            })
        }
    }

    toggle() {
        this.instance.classList.toggle('dialog--open')
    }

    open() {
        this.instance.classList.add('dialog--open')
    }

    close() {
        this.instance.classList.remove('dialog--open')
    }
}

export default Modal;
