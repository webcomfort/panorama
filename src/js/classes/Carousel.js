export class Carousel {
    
    /**
     * Carousel
     * @param {JSON} JSON scenes collection
     * @param {Object} pannellum viewer
     */
    constructor (scenes, viewer){

        this.scenes = scenes
        this.viewer = viewer

        this.$carousel = document.querySelector('.carousel')
        this.$content = document.querySelector(".carousel__content")
        this.$logo = document.querySelector(".carousel__logo")
        this.$slides = document.querySelector(".carousel__slides")
        this.$items
        this.$prev = document.querySelector(".carousel__button-prev")
        this.$next = document.querySelector(".carousel__button-next")
        this.$show = document.querySelector(".carousel__button-show")
        this.$hide = document.querySelector(".carousel__button-hide")

        this.carouselHeight = 0
        this.carouselWidth = 0
        this.carouselItemsWidth = 0
        this.carouselGap = 16

        this.renderItems()
        this.addEvents()
    }

    /**
     * Setting slides
     */
    renderItems(){
        
        let itemsProcessed = 0
        
        Object.keys(this.scenes).forEach(function(k, i, scene){
            
            let html = `<a class="carousel__item" data-pano="${k}" href="javascript:void(0);"><img src="${this.scenes[k].thumb}" /><span>${this.scenes[k].title}</span></a>`
            
            if(this.scenes[k].type != "cubemap") this.$slides.innerHTML += html

            itemsProcessed++

            if(itemsProcessed === scene.length) {
                
                this.$items = document.querySelectorAll(".carousel__item")
                
                setTimeout(() => {
                    
                    this.carouselHeight = this.$slides.offsetHeight
                    this.carouselWidth = this.$content.offsetWidth

                    for (var i = 0; i < this.$items.length; i++) {
                        this.carouselItemsWidth += parseInt(this.$items[i].offsetWidth, 10) + this.carouselGap
                    }

                    this.setTop('-' + this.carouselHeight + 'px')
                    this.prevNextButtons()

                }, 300)

            }

        }.bind(this))

    }

    /**
     * Events
     */
    addEvents(){
        
        window.addEventListener("resize", e => {
            this.carouselWidth = this.$carousel.offsetWidth
            this.prevNextButtons()
        });

        this.$show.addEventListener("click", e => {
            this.setTop('0px')
        });

        this.$hide.addEventListener("click", e => {
            this.setTop('-' + this.carouselHeight + 'px')
        });

        this.$next.addEventListener("click", e => {
            this.nextAction()
        });
        
        this.$prev.addEventListener("click", e => {
            this.prevAction()
        });

        let viewer = this.viewer
        for (let i = 0; i < this.$items.length; i++) {
            this.$items[i].addEventListener('click', function() {
                viewer.loadScene(this.dataset.pano)
            })
        }

    }

    /**
     * Active slide
     * @param {string} data item parameter
     */
    setActiveCarousel (data){
        for (let k = 0; k < this.$items.length; k++) {
            this.$items[k].classList.remove( 'active' )
        }
        
        let panoActive = document.querySelectorAll('[data-pano="'+data+'"]');
        
        for (let k = 0; k < panoActive.length; k++) {
            panoActive[k].classList.add( 'active' )
        }
    }
    
    /**
     * Scroll left action
     */
    prevAction(){
        this.$content.scrollBy(-(this.carouselWidth + this.carouselGap), 0)
        
        if (this.$content.scrollLeft - this.carouselWidth - this.carouselGap <= 0) {
            this.$prev.style.display = "none"
        }
        if (!this.$slides.scrollWidth - this.carouselWidth - this.carouselGap <= this.$content.scrollLeft + this.carouselWidth) {
            this.$next.style.display = "flex"
        }
    }
    
    /**
     * Scroll right action
     */
    nextAction(){
        this.$content.scrollBy(this.carouselWidth + this.carouselGap, 0)
        if (this.$content.scrollWidth !== 0) {
            this.$prev.style.display = "flex"
        }
        if (this.$slides.scrollWidth - this.carouselWidth - this.carouselGap <= this.$content.scrollLeft + this.carouselWidth) {
            this.$next.style.display = "none"
        }
    }

    /**
     * Show/hide buttons, based on resize action
     */
    prevNextButtons(){
        if(this.carouselWidth < this.carouselItemsWidth + this.$logo.offsetWidth && this.$prev.style.display != "flex") {
            this.$next.style.display = "flex"
        } else {
            this.$next.style.display = "none"
        }
    }
    
    /**
     * Show/hide carousel
     * @param {string} css carousel top position in px
     */
    setTop(top){
        this.$carousel.style.top = top
        this.$show.style.display = (top === '0px') ? "none" : "block"
        this.$hide.style.display = (top === '0px') ? "block" : "none"
    }
}