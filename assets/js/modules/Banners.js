import Catfish from "./Catfish";

class Banners {
    constructor() {
        this.catfishes = [];
        this.init();
    }

    init() {
        document.querySelectorAll('.promotional--catfish').forEach(item => {
            let catfish = new Catfish(item);
            catfish.init();
            this.catfishes.push(catfish)
        });
    }
}

export default Banners;