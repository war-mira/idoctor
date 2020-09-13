class Tooltip {
    get isBottom() {
        return this._isBottom;
    }

    set isBottom(value) {
        this._isBottom = value;
    }

    constructor(instance) {
        this.instance = instance;
        this.body = this.instance.querySelector('.tooltip-body');
        this.arrow = this.instance.querySelector('.tooltip-arrow');
        this.bodyHeight = null;
        this.bodyWidth = null;
        this.setBodySizes();
        this.timer = null;
        this._isBottom = false;
    }

    init() {
        this.setDirection()
        this.instance.addEventListener('mouseover', (e) => {
            this.show();
        })

        this.instance.addEventListener('touchstart', (e) => {
            this.show();
        })
        this.instance.addEventListener('mouseout', (e) => {
            this.timer = setTimeout(() => {
                this.hide()
            }, 200)
        })
        this.instance.addEventListener('touchend', (e) => {
            this.hide()
        })
        this.body.addEventListener('mouseout', (e) => {
            this.hide()
        })
        this.body.addEventListener('mouseover', (e) => {
            this.show();
        })
        window.addEventListener('resize', () => {
            this.setDirection()
            this.hide()
        })

    }

    setDirection() {
        let outOfWindow = this.isOutOfWindow()
        this.isBottom = window.innerWidth <= 768 || outOfWindow;
    }

    isOutOfWindow() {
        return (this.offset().left + this.bodyWidth + 20 + this.instance.offsetWidth) > window.innerWidth;
    }

    setBodyPosition() {
        if (this.isBottom) {
            let top = this.offset().top + this.instance.offsetHeight + 20;
            let left = this.offset().left - (this.bodyWidth / 2);
            this.body.style.top = top + 'px';
            if (!this.isOutOfWindow) {
                this.body.style.left = (left < 0 ? 0 : left) + 'px';
            } else {
                this.body.style.right = '0px';
                this.body.style.left = '';
            }
        } else {
            let top = this.offset().top - (this.bodyHeight * 30 / 100)
            let left = this.offset().left + this.instance.offsetWidth + 20;
            this.body.style.top = top + 'px';
            this.body.style.left = left + 'px';
        }
        this.setArrowPosition()
    }

    setArrowPosition() {
        this.arrow.style.top = '';
        this.arrow.style.left = '';
        if (this.isBottom) {
            let left = this.offset().left - this.body.offsetLeft;
            this.arrow.style.top = '-10px';
            this.arrow.style.left = left + 'px';
        }
    }

    setBodySizes() {
        let originLeft = this.offset().left;
        this.body.hidden = false;
        this.body.style.position = 'fixed';
        this.body.style.left = 0;
        this.bodyHeight = this.body.offsetHeight;
        this.bodyWidth = this.body.offsetWidth;
        this.body.style.position = 'absolute';
        this.body.hidden = true;
        this.body.style.left = originLeft;
    }

    offset() {
        const rect = this.instance.getBoundingClientRect();

        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
        };
    }

    show() {
        if (!this.bodyHeight) {
            this.setBodySizes();
        }
        document.body.append(this.body)
        clearTimeout(this.timer)
        this.setBodyPosition();
        this.body.hidden = false;
        this.setArrowPosition()
    }

    hide() {
        this.body.hidden = true;
        this.instance.append(this.body)
    }
}

document.querySelectorAll('.tooltip').forEach((instance) => {
    (new Tooltip(instance)).init()
})