const colyseus = require("colyseus");
const FieldState = require('../state_managers/field_state');
const Config = require('../config');

class FieldRoom extends colyseus.Room {
    onInit(options){
        this.maxClients = 4;
        this.clientIdToClient = {};
        console.log("Field created!", options);
        this.setState(new FieldState(Config.field.width,  Config.field.height, this.maxClients));
        this.setSimulationInterval(() => this.tick(), Config.serverTickInterval);
    }

    onJoin(client){
        console.log("User added: ", client.sessionId, '.');
        this.state.addUser(client.sessionId);
        this.clientIdToClient[client.sessionId] = client;
    }

    onLeave(client){
        console.log("User dropped: ", client.sessionId, '.');
        this.state.dropUser(client.sessionId);
    }

    onMessage(client, data){
        console.log("Field received message from", client.sessionId, ":", data);
        if(data.command = 'click'){
            this.state.click(client.sessionId, data.x, data.y);
        }
    }

    onDispose(){
        console.log("Dispose Field");
    }

    tick(){
        let deletedUsers = this.state.tick();
        let winner = this.state.winner();
        if(winner){
            for(let i in this.clients){
                let client = this.clients[i];
                let userId = client.sessionId;
                if(winner.userId && winner.userId == userId){
                    this.finish_game(client, Config.codeWin);
                }
                else{
                    this.finish_game(client, Config.codeFail);
                }
            }
        }
        else{
            for(let i in deletedUsers){
                let userId = deletedUsers[i];
                let client = this.clientIdToClient[userId];
                this.finish_game(client, Config.codeFail);
                delete this.clientIdToClient[userId];
            }
        }

    }

    finish_game(client, code){
        this.send(client, {message: 'game_over', code: code});
        client.close(code, 'game_over');
    }
}

module.exports = FieldRoom;