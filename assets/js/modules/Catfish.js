import axios from 'axios';

export default class Catfish {
    constructor(instance) {
        this.instance = instance;
        this.closeButton = instance.querySelector('.promotional--catfish__close');
    }

    init() {
        this.initCloseButton();
        
    }

    close() {
        axios.post('/banner/catfish/close')
            .then(response => {
                let data = response.data;
                if (data.success) {

                }
            })
            .catch(err=>{
                console.warn(err);
            });
        this.instance.remove(); 
    }

    initCloseButton() {
        this.closeButton.addEventListener('click', evt => {
            this.close();
        })
    }
}