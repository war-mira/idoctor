class ShowFaq {
  constructor(container) {
    this.instance = container;
    if (!this.instance) {
      return false;
    }
  }
  init() {
    this.instance.querySelectorAll(".faq--item").forEach(item => {
      this.initAccordeon(item);
    });
  }
  initAccordeon(item) {
    item.addEventListener("click", e => {
      this.instance.querySelectorAll(".faq--item").forEach(item => {
        item.classList.remove("faq--item-active");
      });
      item.classList.add("faq--item-active");
    });
  }
}

document.querySelectorAll(".faq").forEach(item => {
  let faq = new ShowFaq(item);
  faq.init();
});
