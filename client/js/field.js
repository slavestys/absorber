var Field = function(canvas) {
    var self = this;
    self.canvas = canvas;
    self.ctx = self.canvas.getContext('2d');
    self.circles = {};
    self.timer_id = null;
    self.currentUserId = null;
    self.currentUser = null;
    self.userPoints = [];
    self.canvasPos = null;
    self.room = null;
    self.state = Config.states.idle;
    self.scale = null;
    self.gameState = null;

    self.clean = function(){
        self.ctx.fillStyle = '#FFFFFF';
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
    };

    self.draw = function(){
      self.clean();
      let sortedCircles = Object.values(self.circles).sort(function(circle1, circle2){
          return circle1.radius > circle2.radius;
      });
      for(let i in sortedCircles){
          let circle = sortedCircles[i];
          circle.draw(self.ctx, self.currentUser, self.scale);
      }
    };

    self.tick = function(){
        let tickIntervalSeconds = Config.clientTickInterval / 1000;
        for(let i in self.circles){
            let circle = self.circles[i];
            let dx = circle.speedX * tickIntervalSeconds;
            let dy = circle.speedY * tickIntervalSeconds;
            let x = circle.x + dx;
            let y = circle.y + dy;
            if(x - circle.radius < 0){
                x = -(x - circle.radius) + circle.radius;
                circle.speedX = -circle.speedX;
            }
            if(y - circle.radius < 0)
            {
                y = -(y - circle.radius) + circle.radius;
                circle.speedY = -circle.speedY;
            }
            if(x + circle.radius > self.canvas.width){
                x = self.canvas.width - circle.radius - (x + circle.radius - self.canvas.width);
                circle.speedX = -circle.speedX;
            }
            if(y + circle.radius > self.canvas.height){
                y = self.canvas.height - circle.radius - (y + circle.radius - self.canvas.height);
                circle.speedY = -circle.speedY;
            }
            circle.x = x;
            circle.y = y;
        }
        let circlesArray = Object.values(self.circles);
        for(let i = 0; i < circlesArray.length; i++){
            for(let j = circlesArray.length - 1; j > i; j--){
                let circle1 = circlesArray[i];
                let circle2 = circlesArray[j];
                let dx = Math.abs(circle1.x - circle2.x);
                let dy = Math.abs(circle1.y - circle2.y);
                let dest = Math.sqrt(dx * dx + dy * dy);
                if(dest < circle1.radius + circle2.radius){
                    if(circle1.square < circle2.square){
                        let buf = circle1;
                        circle1 = circle2;
                        circle2 = buf;
                    }
                    let intersection = Utils.circleIntersection(circle1.radius, circle2.radius, dest);
                    circle1.absorb(intersection);
                    circle2.absorb(-intersection);
                }
            }
        }

        self.draw();
    };

    self.setCurrentUserId = function(userId){
        self.currentUserId = userId;
    };

    self.mouseClick = function(event){
        if(!self.currentUser){
            return;
        }

        let x = (event.clientX - self.canvasPos.x) / self.scale - self.currentUser.x;
        let y = (event.clientY - self.canvasPos.y) / self.scale - self.currentUser.y;
        self.room.send({command: "click", x: x, y: y});
    };

    self.beginGame = function(event){
        self.room.send({command: "begin_game"});
    };

    self.refreshState = function(state){
        if(state.state == Config.game_states.process){
            if(this.gameState != Config.game_states.process){
                let gameStartEvent = new Event('game_started');
                document.dispatchEvent(gameStartEvent);
                self.gameState = Config.game_states.process;
                self.timer_id = setInterval(self.tick, Config.clientTickInterval);
            }
            self.circles = {};
            for(let i in state.circles){
                let circleData = state.circles[i];
                self.circles[i] = new Circle(circleData);
            }
            self.currentUserId = state.users[self.room.sessionId];
            if(self.currentUserId){
                self.currentUser = self.circles[self.currentUserId];
            }
            else{
                self.currentUser = null;
            }
            self.draw();
        }
        else{
            let secondsRemain = Math.floor((state.createdAt.getTime() + Config.secondsToStart *1000 - state.currentTime.getTime()) / 1000);
            let isOwner = self.room.sessionId == state.owner;
            let gameStartingEvent = new CustomEvent('game_starting',
                    { 'detail': {'seconds_remain': secondsRemain, 'is_owner': isOwner}}
                );
            document.dispatchEvent(gameStartingEvent);
        }
    };

    self.start = function(){
        if(self.state != Config.states.idle) return;
        self.gameState = Config.game_states.starting;
        self.room = self.colyseusClient.join("field");

        self.room.onJoin.add(function () {
            console.log("joined");
            self.state = Config.states.game;
        });

        self.room.onStateChange.add(function(state) {
            //console.log('state refresh ', state);
            self.refreshState(state);
        });

        self.room.onMessage.add(function(message) {
            console.log('message', message);
        });

        self.room.onLeave.add(function(e){
            self.stop(e);
            console.log('Game over:', e);
        });
    };

    self.stop = function(code){
        if(self.state != Config.states.game) return;
        let gameOverEvent = new CustomEvent('game_over', { 'detail': code});
        self.state = Config.states.idle;
        self.clean();
        clearInterval((self.timer_id));
        document.dispatchEvent(gameOverEvent);
    };

    self.init = function(){
        self.scale = self.canvas.width / Config.field.width;
        let newHeight = self.scale * Config.field.height;
        if(newHeight > self.canvas.height){
            self.scale = self.canvas.height / Config.field.height;
            self.canvas.width = Config.field.width * self.scale;
        }
        else{
            self.canvas.height = Config.field.height * self.scale;
        }
        self.canvasPos = Utils.getPosition(canvas);
        self.canvas.addEventListener("click", self.mouseClick, false);

        let host = window.document.location.host.replace(/:.*/, '');
        self.colyseusClient = new Colyseus.Client(location.protocol.replace("http", "ws") + host + (location.port ? ':'+location.port : ''));
    };

    self.init();
};