import "pannellum"
import { Carousel } from './Carousel'
import { Modal } from './Modal'

export class Panorama {
    
    /**
     * Panorama
     */
    constructor (jsonURL){
        
        this.jsonURL = jsonURL
        this.$panorama = document.querySelector(".panorama")

        // Controls
        this.$mapButton = document.querySelector('.controls__button_map')
        this.$audioButton = document.querySelector('.controls__button_audio')
        this.$audioPlayIcon = document.querySelector('.controls__audio-play')
        this.$audioPauseIcon = document.querySelector('.controls__audio-pause')
        this.$panoPlayIcon = document.querySelector('.controls__animation-play')
        this.$panoPauseIcon = document.querySelector('.controls__animation-pause')
        this.$panUpButton = document.querySelector('.controls__button_pan-up')
        this.$panDownButton = document.querySelector('.controls__button_pan-down')
        this.$panLeftButton = document.querySelector('.controls__button_pan-left')
        this.$panRighButton = document.querySelector('.controls__button_pan-right')
        this.$zoomInButton = document.querySelector('.controls__button_zoom-in')
        this.$zoomOutButton = document.querySelector('.controls__button_zoom-out')
        this.$fullscreenButton = document.querySelector('.controls__button_fullscreen')
        this.$expandIcon = document.querySelector('.controls__expand')
        this.$compressIcon = document.querySelector('.controls__compress')

        // JSON load
        const getJSON = async url => {
            const response = await fetch(url)
            if(!response.ok) throw new Error(response.statusText)
            const data = response.json()
            return data
        }

        getJSON(this.jsonURL).then(data => {
            
            this.data = data

            this.modal = new Modal()

            // hotSpots click handlers
            this.addClickHandlers()

            this.viewer = pannellum.viewer(this.$panorama, this.data)
            this.carousel = new Carousel(this.data.scenes, this.viewer)

            this.viewer.on('load', function () {

                this.curScene = this.viewer.getConfig().scenes[this.viewer.getScene()]
                this.carousel.setActiveCarousel(this.viewer.getScene())
                this.carousel.setTop('-' + this.carousel.carouselHeight + 'px')

                let bounds = this.viewer.getHfovBounds()
                this.minHfov = bounds[0]
                this.maxHfov = bounds[1]

                this.setMap(this.data.scenes)
                this.setAudio(this.curScene)
                this.setSceneHfov()
                this.coordsToConsole()

            }.bind(this))

            this.setButtonActions()
            
            // HFov event
            const SceneHfov = function(){
                this.setSceneHfov()
            }.bind(this)
            window.addEventListener("resize", SceneHfov)
            

        }).catch(error => {
            console.error(error)
        })
    }

    /**
     * Map prepare
     * @param {object} scene params
     */
    setMap(scenes){

        Object.keys(scenes).forEach(function(k, i, scene){
            if(scenes[k].type === "cubemap"){
                this.$mapButton.style.display = "inline-block";
                this.$mapButton.addEventListener('click', function() {
                    this.viewer.loadScene(k)
                    return
                }.bind(this))
            }
        }.bind(this))

    }

    /**
     * Data prepare for modals
     */

    addClickHandlers(){

        let showInfo = function(event, content){
            this.modal.$modalHeader.innerHTML = content.title;
            this.modal.$modalBody.innerHTML = content.content;
            this.modal.$modal.style.display = "block";
        }.bind(this)
        
        let scenes = this.data.scenes
        
        Object.keys(scenes).forEach(function(k){
            
            let scene = scenes[k].hotSpots

            Object.keys(scene).forEach(function(k){
                if(scene[k].type == "info" && scene[k].clickHandlerArgs !== undefined) {
                    scene[k].clickHandlerFunc = showInfo
                }
            })

        })

    }

    /**
     * click + CTRL = viewer center coords to console
     * click + ALT = mouse coords to console
     */
    coordsToConsole(){
        
        this.viewer.on('mousedown', function(event) {
            
            if (window.event.ctrlKey) {
                console.log(this.viewer.getPitch(), this.viewer.getYaw());
            }

            if (window.event.altKey) {
                console.log(this.viewer.mouseEventToCoords(event));
            }

        }.bind(this));

    }

    /**
     * Audio set up
     * @param {object} scene params
     */
    setAudio(curScene){
        
        if(this.audio !== undefined) this.audio.pause()

        if(curScene.audio !== undefined) {

            this.$audioButton.style.display = "inline-block"
            this.$audioPlayIcon.classList.remove("hidden")
            this.$audioPauseIcon.classList.add("hidden")
            this.audio = new Audio(curScene.audio)

        } else{

            this.$audioButton.style.display = "none"

        }
    }

    /**
     * Button events
     */
    setButtonActions(){

        this.$panUpButton.addEventListener('click', function(e) {
            this.viewer.setPitch(this.viewer.getPitch() + 10)
        }.bind(this))

        this.$panDownButton.addEventListener('click', function(e) {
            this.viewer.setPitch(this.viewer.getPitch() - 10)
        }.bind(this))

        this.$panLeftButton.addEventListener('click', function(e) {
            this.viewer.setYaw(this.viewer.getYaw() - 10)
        }.bind(this))

        this.$panRighButton.addEventListener('click', function(e) {
            this.viewer.setYaw(this.viewer.getYaw() + 10)
        }.bind(this))

        this.$zoomInButton.addEventListener('click', function(e) {
            this.viewer.setHfov(this.viewer.getHfov() - 10)
        }.bind(this))

        this.$zoomOutButton.addEventListener('click', function(e) {
            this.viewer.setHfov(this.viewer.getHfov() + 10)
        }.bind(this))

        this.$fullscreenButton.addEventListener('click', function(e) {
            this.viewer.toggleFullscreen()
            this.$expandIcon.classList.toggle("hidden")
            this.$compressIcon.classList.toggle("hidden")
        }.bind(this))

        this.$panoPauseIcon.addEventListener('click', function(e) {
            this.viewer.stopAutoRotate()
            this.$panoPlayIcon.classList.toggle("hidden")
            this.$panoPauseIcon.classList.toggle("hidden")
        }.bind(this))

        this.$panoPlayIcon.addEventListener('click', function(e) {
            this.viewer.startAutoRotate()
            this.$panoPlayIcon.classList.toggle("hidden")
            this.$panoPauseIcon.classList.toggle("hidden")
        }.bind(this))

        this.$audioPauseIcon.addEventListener('click', function(e) {
            this.audio.pause()
            this.$audioPlayIcon.classList.toggle("hidden")
            this.$audioPauseIcon.classList.toggle("hidden")
        }.bind(this))

        this.$audioPlayIcon.addEventListener('click', function(e) {
            this.audio.play()
            this.$audioPlayIcon.classList.toggle("hidden")
            this.$audioPauseIcon.classList.toggle("hidden")
        }.bind(this))

    }

    /**
     * Change scene Hfov
     */
    setSceneHfov(){

        let w = document.documentElement.clientWidth
        let h = document.documentElement.clientHeight
        let ratio = w/h
        let minHfov, maxHfov

        if(ratio < 1.5){

            if(ratio < 0.7){
                minHfov = this.minHfov * (ratio - 0.2)
                maxHfov = this.maxHfov * (ratio - 0.2)
            } else {
                minHfov = this.minHfov * (ratio - 0.4)
                maxHfov = this.maxHfov * (ratio - 0.4)
            }

            this.viewer.setHfovBounds([minHfov, maxHfov])
            
        } else {
            this.viewer.setHfovBounds([this.minHfov, this.maxHfov])
        }

    }

    /**
     * Change scene action
     * @param {string} scene name
     */
    changeScene(scene){
        this.viewer.loadScene(scene);
    }
}