import { state } from "../state"

type Message = {
    from: string,
    message: string
}

export class ChatRoom extends HTMLElement{
    messages: Message[] = []
    roomId: "" = ""
    connectedCallback(){
        state.suscribe( () => {
            const currentState = state.getState()
            this.messages = currentState.messages
            console.log("render!");
            
            this.render()
        })
        state.suscribe(() => {
            const currentState = state.getState()
            this.roomId = currentState.roomId
            this.render()
        })
        this.render()
    }
    render(){
        // const currentState = state.getState()

        this.innerHTML = `
            <h1 class="chatroom__title">Chat</h1>
            <h2 class="chatroom__roomId">room id: ${this.roomId}</h2>
            <div class="chatroom__container-messages">
                ${this.messages.map( m => {
                return ` <div class="message"> ${m.from}:${m.message} </div> `
                }).join("")}
            </div>
            <form class="chatroom__form">
                <input class="chatroom__input" placeholder="escribe un mensaje" name="new-message"></input>
                <button class="chatroom__button" name="">Enviar</button>
            </form>
        `

        this.querySelector(".chatroom__form").addEventListener("submit", e =>{
            e.preventDefault();
            const target = e.target as any
            // console.log("nuew message", target["new-message"].value);
            state.pushMessages(target["new-message"].value)
        })
    }
}

customElements.define("chatroom-page", ChatRoom)