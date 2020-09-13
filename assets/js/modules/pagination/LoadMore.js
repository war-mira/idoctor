import axios from 'axios';
import {parseHTML} from '../Base'

class LoadMore {
    constructor(instance) {
        this.instance = instance;
        this.container = this.instance.closest(instance.getAttribute('container')).querySelector('[load-more="body"]');
        this.url = instance.getAttribute('load-url');
        this.page = instance.getAttribute('page') ? instance.getAttribute('page') : '1';
        this.url_attr = instance.getAttribute('url-attr') ? JSON.parse(instance.getAttribute('url-attr')) : {};
        this.actions = instance.getAttribute('actions') ? instance.getAttribute('actions').split(',') : [];
        this.afterLoad = instance.getAttribute('after-load') ? instance.getAttribute('after-load').split(',') : [];
        this.lastPage = null;
        this.nextPage = parseInt(this.page) + 1;
        this.lastLoaded = [];
    }

    init() {
        this.instance.addEventListener('click', e => {
            this.getData();
        });
    }

    parseInstances(html) {
        let items = parseHTML(html);
        [...items].forEach(item => {
            this.container.append(item);
        });

        if (this.page == this.lastPage) {
            this.instance.remove();
        }
    }


    getData() {
        this.instance.classList.add('processing');
        let params = {
            page: this.nextPage,
        };
        params = Object.assign(params, this.url_attr);
        axios.get(this.url, {
            params: params
        }).then(response => {
            let data = response.data;
            if (typeof data.page !== 'undefined') {
                this.changePageInUrl();
                this.page = data.page;
                this.nextPage = data.nextPage;
                this.lastPage = data.lastPage;
            }
            this.parseInstances(data.view);
            this.instance.classList.remove('processing');
        }).catch(e => {
            this.instance.classList.remove('processing');
        })
    }

    changePageInUrl() {
        let url = new URL(window.location.href);
        let query_string = url.search;
        let search_params = new URLSearchParams(query_string);
        search_params.set('page', this.page);
        url.search = search_params.toString();
        history.pushState(null, null, url.toString());
    }
}

export default LoadMore