import { Router } from "@vaadin/router"
import { state } from "../state"

export class Welcome extends HTMLElement{
    render(){
        const style = document.createElement("style")
        this.innerHTML = `
        <form action="" class="welcome__form">
            <div class="welcome__campo email">
                <label for="" class="welcome__label">Tu email</label>
                <input type="text" name="email" class="welcome__input" placeholder="ingresa tu e-mail aqui">
            </div>
            <div class="welcome__campo nombre">
                <label for="" class="welcome__label">Tu nombre</label>
                <input type="text" name="nombre" class="welcome__input" placeholder="ingresa tu nombre aqui">
            </div>
            <div class="welcome__campo opcionRoom">
                <label for="options">Elegi una opcion:</label>
                <select name="options" id="">
                    <option value="room-nuevo">Nuevo Room</option>
                    <option value="room-existente">Room existente</option>
                </select>
            </div>
            <div class="welcome__campo roomid">
                <label for="" class="welcome__label">Ingresa un ID</label>
                <input type="text" name="roomId" class="welcome__input" placeholder="ingresa un id aqui">
            </div>
            <button class="welcome__button">Comenzar</button>
        </form>
        `
    }
    connectedCallback(){
        this.render()
        this.querySelector(".welcome__form").addEventListener("submit", e => {
            const currentState = state.getState()
            const target = e.target as any;

            e.preventDefault();
            
            currentState.nombre = target.nombre.value
            currentState.email = target.email.value
            if( target.options.value == "room-existente"){
                currentState.roomId = target.roomId.value
            }
            state.initState()
            state.setState(currentState)
            setTimeout(() => {
                Router.go("/chatroom")
            }, 1250);
        })
    }
}

customElements.define("welcome-page", Welcome)