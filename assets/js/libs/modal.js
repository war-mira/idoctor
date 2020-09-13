function closeModal(modal) {
    modal.classList.remove('is-modal-active');
    modal.removeAttribute('data-id');
    if (modal.querySelector('form')) {
        let form = modal.querySelector('form');
        form.reset();
        form.classList.remove('form--sent');
    }
    if (modal.querySelector('.modal__submit')) {
        if (modal.querySelector('.modal__submit').getAttribute('default-value')) {
            modal.querySelector('.modal__submit').innerText = modal.querySelector('.modal__submit').getAttribute('default-value');
        }
    }
}

document.querySelectorAll('.modal').forEach(modal=>{
    modal.querySelector('.modal__close').addEventListener('click',e=>{
        closeModal(modal);
    });
    if(modal.querySelector('.modal__submit')){
        modal.querySelector('.modal__submit').addEventListener('click',e=>{
            modal.dispatchEvent(new CustomEvent('submited', {
                detail: {
                    modal:modal
                }
            }))
        })
    }
})