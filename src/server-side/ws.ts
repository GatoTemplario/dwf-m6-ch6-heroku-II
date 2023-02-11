import { state } from "../state";


function initWs(){
    const currentState = state.getState()
    console.log("currentstate", currentState.rtdbRoomId);
    
    // Create WebSocket connection.
    // const socket = new WebSocket('ws://localhost:8080');

// METO CODIGO
    const nodeEnv = process.env.NODE_ENV.trim()
    function locationHost(nodeEnv){
        if(nodeEnv == "production"){
            console.log("boolean true");
            
            return location.hostname + ":8080"  
        }else{
            console.log("boolean false");
            
            return location.host
        }
        
    }
    const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${locationHost(nodeEnv)}`)
    console.log("socket: ", socket);
// HASTA AQUI METO CODIGO
    // Connection opened
    socket.addEventListener('open', (event) => {
        socket.send(currentState.rtdbRoomId);
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        // convierto a json lo que me manda el WS
        const usefulJson = JSON.parse(event.data)
        const boolean = (<any>Object).hasOwn(usefulJson, "messages")
        // hago esto porque la primera propiedad del objeto es owner y me estaba avisando en el eventlistener. sospecho que me iba a romper las bolas
        if (boolean == true){
            // convierto el objeto en un array. el return el[1] es porque en la posicion 0 está el key del obj
            const messagesList = Object.entries(usefulJson.messages).map( el => { return el[1] })
            // me quedo con la primera propiedad que es un objeto de objetos (idMensaje : {obj importante})
            currentState.messages = messagesList
            state.setState(currentState)
        }
    });

    socket.onclose = function(event) {
        console.log('Chau amigo! ', event.reason);

    }
}

export { initWs }