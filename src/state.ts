import { initWs } from "./server-side/ws"

const API_BASE_URL = "http://localhost:"
const PORT = 3000
type OptionRoom = "room-nuevo" | "room-existente"

const state = {
    data : {
        nombre: "",
        messages: [],
        userId: "",
        roomId: "",
        rtdbRoomId: ""
    },
    listeners: [],
    initState(){
        // aqui pienso que deberia haber algun metodo o funcion que consiga los mensajes de rtdb y los meta en messages. y de algun modo usar la autentificacion que hice
        console.log("initstate");
        this.auth()
    
    },
    getState(){
        return this.data
    },
    setState(newState){
        this.data = newState;
        for (const cb of this.listeners) {
            cb(newState)
        }
        console.log("state cambio!", this.data);
    },
    suscribe( callback: (any)=> any){
        this.listeners.push(callback)
    },
    pushMessages( newMessage: string ){
        const nombreDelUser = this.data.nombre;
        const currentState = this.getState()
        fetch( API_BASE_URL + PORT + "/rooms/" +currentState.rtdbRoomId,{
            method: "POST",
            headers: { "content-type": "application/json"},
            body: JSON.stringify({
                from: nombreDelUser,
                message: newMessage
            })
        })
    },
    auth(){
        const currentState = state.getState()

        fetch( API_BASE_URL + PORT + '/auth',{
            method: "POST",
            headers: {"content-type": 'application/json'},
            body: JSON.stringify({email: currentState.email})
        })
        .then( res => { return res.json() })
        .then( responseData => {
            // AQUI DEBERIA IR EL IF( EXISTE) =>
            currentState.userId = responseData.id
            this.setState(currentState)
        })
        .then( () => { this.chatRoomHandler()})
        
    //  FALTA AGREGAR QUE PASA CUANDO NO TENES EL MAIL COSO
    },
    chatRoomHandler(){
        const currentState = state.getState()
        if ( currentState.roomId !== ""){
            // si puso un Id Corto
            console.log("id corto!");
            
            fetch( API_BASE_URL + PORT + '/rooms/' + currentState.roomId, {
                method: "GET",
                headers: { "content-type": 'application/json' },
            })
            .then( res => { return res.json()})
            .then( response => { 
                const newCurrentState = Object.assign( currentState, response.data)
                console.log("responda.data",response.data);
                
                console.log("newcurrentstate", newCurrentState);
                this.setState(newCurrentState)
            })
            .then( () => {
                initWs()
            })
        }else{
            // si NO puso un Id Corto, es porque no tiene y hay que crear uno nuevo
            console.log("SIN id corto!");

            fetch( API_BASE_URL + PORT + '/rooms' , {
                method: "POST",
                headers: { "content-type": 'application/json' },
                body: JSON.stringify({userId: currentState.userId})
            })
            .then( res => { return res.json()})
            .then( response => { 
                const newCurrentState = Object.assign( currentState, response)
                this.setState(newCurrentState)
            })
            
            .then( () => {
                initWs()
            })
        }
    },
}

export { state }