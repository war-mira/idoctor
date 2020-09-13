
class PageSearch {
    constructor(instance) {
        this.instance = instance
    }

    init() {
        this.listenServices()
        this.listenAlphabetLists()
    }

    listenServices() {
        if (!document.querySelector('.service--item')) {
            return
        }
        let search = this.instance
        let accordions = document.querySelectorAll('.service--item');
        search.addEventListener('input', function () {
            let searchText = search.value.toLowerCase();
            Array.prototype.forEach.call(accordions, function (accordion) {
                if (accordion.classList.contains('hidden')) {
                    return false
                }
                if (accordion.innerText.toLowerCase().indexOf(searchText) >= 0) {
                    accordion.style.display = 'block';
                } else {
                    accordion.style.display = 'none';
                }
            })
        })
    }

    listenAlphabetLists() {
        if (!document.querySelector('.page--search__item')) {
            return
        }
        let search = this.instance
        let search_list = document.querySelectorAll('.page--search__item');

        search.addEventListener('input', (e) => {
            let searchText = search.value.toLowerCase();
            let parentBlock, parentColumn
            Array.prototype.forEach.call(search_list, item => {
                parentBlock = item.closest('.page--search__parent')
                parentColumn = item.closest('.mainpage--skills__content-column')
                if (item.innerText.toLowerCase().indexOf(searchText) >= 0) {
                    parentBlock.classList.remove('hidden')
                } else {
                    parentBlock.classList.add('hidden')
                }
                this.hideEmptyColumns(parentColumn)
            })
        })
    }

    hideEmptyColumns(column) {
        let parentRow = column.closest('.mainpage--skills__row')
        if (!column.querySelector('.hidden')) {
            column.classList.remove('hidden-column')
            return
        }
        this.hideElement(column, '.page--search__parent', '.hidden', 'hidden-column')
        this.hideElement(parentRow, '.mainpage--skills__content-column', '.hidden-column', 'emptyRow')
    }

    hideElement(container, list, hiddenList, hiddenClassName) {
        let all = container.querySelectorAll(list).length
        let epmty = container.querySelectorAll(hiddenList).length
        if (all != epmty) {
            container.classList.remove(hiddenClassName)
            return
        }
        container.classList.add(hiddenClassName)
    }

    static hideEmptyListItems() {
        _$$('.service--list').forEach(item => {
            if (item.getElementsByTagName('li').length <= 0) {
                item.closest('.service--item__content').classList.add('service--item__empty')
            }
        })
        _$$('.service--item').forEach(function (item) {
            const all_items_length = item.querySelector('.service--item__content').childElementCount

            if (item.querySelector('.service--item__empty')) {
                const empty_items_length = item.querySelector('.service--item__empty').childElementCount
                if (all_items_length === empty_items_length) {
                    item.classList.add('hidden')
                }
            }
        })
    }
}

export default PageSearch;