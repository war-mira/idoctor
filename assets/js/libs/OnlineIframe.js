class OnlineIframe {
    constructor(url) {
        this.url = url
        this.title = document.querySelector('.consultation--form__title')
        this.wrapper = document.querySelector('.iframe--wrapper')
        this.iframe = null
    }

    init() {
        this.createIframe()
        this.listenSocket()
    }
    createIframe(){
        this.wrapper.classList.remove('hidden')
        this.iframe = document.createElement('iframe');
        this.iframe.classList.add('consultation--online__iframe')
        this.iframe.src = this.url ? this.url : 'https://idoctor.kz/';
        this.iframe.height = '100%';
        this.iframe.width = '100%';
        this.wrapper.appendChild(this.iframe);
    }
    static closeIframe(){
        let wrapper = document.querySelector('.iframe--wrapper')
        wrapper.innerHTML= ''
        wrapper.classList.add('hidden')  
    }
    
}
