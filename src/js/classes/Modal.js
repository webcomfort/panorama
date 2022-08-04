export class Modal {
    
    constructor (){
        this.$modal = document.querySelector(".modal")
        this.$modalHeader = document.querySelector(".modal__title")
        this.$modalBody = document.querySelector(".modal__body")
        this.$modalClose = document.querySelector(".modal__close")

        this.init()
    }

    init(){

        // Close modal by click the outside area
        window.onclick = function(event) {
            if(event.target.classList.contains('modal__content')){
                this.$modal.style.display = "none"
            }
        }.bind(this)

        // Close modal
        this.$modalClose.addEventListener('click', function(event) {
            this.$modal.style.display = "none"
        }.bind(this))
        
    }
}