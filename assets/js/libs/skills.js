
class HideableRow{
    constructor(container){
        this.instance = container.querySelector('.skills');
        if(!this.instance){
            return false;
        }
        this.hidden = [];

    }
    init(){
        if(!this.instance){
            return false;
        }
        try{
            this.top = this.instance.querySelector(".skills--list").firstElementChild.offsetTop;
        } catch (e) {
            return false;
        }

        this.instance.querySelectorAll(".skills--list .skills--list__item").forEach(item => {
            if (item.offsetTop > this.top) {
                this.hidden.push(item);
                this.instance.querySelector(".skills--list__hidden").appendChild(item);
            }
        });
        if (this.hidden.length) {
            this.instance.querySelector(".skills--count").innerHTML = "+" + this.hidden.length;
        }
    }
}

document.querySelectorAll(".profile").forEach(profile => {
    let skill = new HideableRow(profile);
    skill.init();
 /*
    let top_position = skills.querySelector(".skills--list").firstElementChild.offsetTop;

    let hidden = [];
    skills.querySelectorAll(".skills--list .skills--list__item").forEach(item => {
        if (item.offsetTop > top_position) {
            hidden.push(item);
            skills.querySelector(".skills--list__hidden").appendChild(item);
        }
    });
    if (hidden.length) {
        skills.querySelector(".skills--count").innerHTML = "+" + hidden.length;
    }
         */
});
