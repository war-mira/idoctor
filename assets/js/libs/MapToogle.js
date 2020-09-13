class MapToogle {
  constructor(caller) {
    this.caller = caller;
    this.instance = document.querySelector(
      `.display--el[data-type=${caller.getAttribute('data-show')}]`
    );
  }

  init() {
    this.initButtons();
  }

  initButtons() {
    this.caller.addEventListener('click', e => {
      this.updateUrl()
      //
      // длф того чтобы менять стили если при тугле что-то меняется
      const parent = this.caller.closest('.display--parent');
      parent.classList.toggle('style--parent');
      // удаляет все существующие show--toogle в элементе с display--toogle
      document
        .querySelectorAll('.display--toogle.hide--toogle')
        .forEach(item => {
          item.classList.remove('hide--toogle');
        });
      this.caller.classList.toggle('hide--toogle');
      // удаляет все существующие show--el в элементе с display--el
      document.querySelectorAll('.display--el.show--el').forEach(item => {
        item.classList.remove('show--el');
      });
      this.instance.classList.toggle('show--el');
    });
  }

  updateUrl() {
    // только для карты
    const url = new URL(window.location.href);
    url.searchParams.delete('geo[0]');
    url.searchParams.delete('geo[1]');
    url.searchParams.delete('distance');
    url.searchParams.delete('zoom');
    history.replaceState(null, null, url.toString());
  }
}

document.querySelectorAll('.display--toogle').forEach(instance => {
  const display = new MapToogle(instance);
  display.init();
});
