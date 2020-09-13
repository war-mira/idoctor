import axios from 'axios';
import {toast} from '../notifications/Toast'
import {apiBaseUrl, getGa} from "../Base";

class QuestionAnswerVote {
    constructor(instance) {
        this.instance = instance
        this.id = this.instance.getAttribute('data-id')
    }

    init() {
        this.instance.querySelectorAll('[data-vote]').forEach(item => {
            item.addEventListener('click', e => {
                this.vote(e,item.getAttribute('data-vote'));
            })
        })
    }

    vote(e,mark) {

        axios.post(`${apiBaseUrl}/questions/answer/vote/${this.id}`, {
            mark: mark,
            ga:getGa()
        }).then(response => {
            if (response.data.id) {
                toast.success('Спасибо за ваш голос.')
                this.instance.remove();
            }
        }).catch(err => {
            console.log(err);
        })
    }
}

export default QuestionAnswerVote

