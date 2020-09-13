class Consultations {
    constructor(container) {
        this.instance = container;
        this.applications = {
            appointment: MakeAppointment
        }
        this.list = document.querySelector('.consultation--popular__list')
        this.modal = document.querySelector('.consultation--modal__form')
        this.online = {}
        this.allSpec = []
    }
    init() {
        //this.initSocket()
        this.initList()
        this.listenOnline()
    }
    initSocket(){
        let doc_id = 323;
        let skills = [117, 6, 10, 16]
        socket.emit('online', doc_id, skills)
    }
    listenOnline(){
        socket.emit('skills.online');
        socket.on('skills.online', (response) => {
            this.online = response
            this.updateSpecList()
        })
    }
    updateSpecList(){
        let showList = this.allSpec.filter(item=>{
            return this.filterList(item)
        })
        document.querySelectorAll('.consultation--spec__item').forEach(item=>{
            item.classList.add('hidden')
        })
        showList.map(item=>{
            let card = document.querySelector(`.consultation--spec__item[data-id="${item}"]`)
            card.classList.remove('hidden')
            this.setTaskInPool(item, card)
        })
        this.hideEmptyCategoryes()
        this.listenRequests()
    }
    filterList(item){
        for(key in this.online){
            if((this.online[key]) && (item == key)){
                this.setCounters(item, this.online[key])
                return item
            }
        }
    }
    setCounters(item, value){
        let titles = ['врач онлайн', 'врача онлайн', 'врачей онлайн']
        let card = document.querySelector(`.consultation--spec__item[data-id="${item}"]`)
        card.querySelector('.online-dot').innerHTML = this.getCountEnd(value, titles) 
    }

    getCountEnd(number, titles){
        let cases = [2, 0, 1, 1, 1, 2];
        let res = number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
        return res
    }

    hideEmptyCategoryes(){
        document.querySelectorAll('.consultation--list__wrapper .consultation--spec').forEach(item=>{
            let allCount = item.getElementsByClassName('consultation--spec__item').length
            let hiddenCount = item.getElementsByClassName('hidden').length
            
            if(allCount == hiddenCount){
                item.classList.add('hidden')
            }else{
                item.classList.remove('hidden')
            }
        })
    }
    setTaskInPool(item, card){
        let titles = ['пациент в очереди', 'пациента в очереди', 'пациентов в очереди']
        axios.get(`/${item}`)
        .then((response) => {
            let value = response.data.tasks_in_pool
            let time = response.data.estimate_minutes
            card.querySelector('.online-line').innerHTML = this.getCountEnd(value, titles)
            card.querySelector('.online-time').innerHTML = `${time} мин.`
        }).catch((err) => {
            toast.danger(err)
        })
    }

    initList(){
        document.querySelectorAll('.consultation--spec__item').forEach(item => {
            let id = item.getAttribute('data-id')
            this.allSpec.push(id)
        })
    }
    listenRequests(){
        document.querySelectorAll(`.btn[data-open="dropConsultation"]`).forEach(item=>{
            item.addEventListener('click', e => {
                this.modal.querySelector('.skill_id').value = item.getAttribute("data-id")
            })
        })
    }
}

document.querySelectorAll(".consultation--init").forEach(item => {
    let wrapper = new Consultations(item);
    wrapper.init();
});
