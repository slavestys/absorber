var Field = function(canvas) {
    var self = this;
    self.canvas = canvas;
    self.ctx = self.canvas.getContext('2d');
    self.circles = {};
    self.timer_id = null;
    self.currentUserId = null;
    self.currentUser = null;
    self.userPoints = [];
    self.canvasPos = Utils.getPosition(canvas);
    self.room = null;

    self.draw = function(){
      self.ctx.fillStyle = '#FFFFFF';
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
      for(let i in self.circles){
          let circle = self.circles[i];
          circle.draw(self.ctx, self.currentUser);
      }
    };

    self.tick = function(){
        var tickIntervalSeconds = Config.tickInterval / 1000;
        for(var i = 0; i < self.circles.length; i++){
            var circle = self.circles[i];
            var dx = circle.speedX * tickIntervalSeconds;
            var dy = circle.speedY * tickIntervalSeconds;
            var x = circle.x + dx;
            var y = circle.y + dy;
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

        self.draw();
    };

    self.setCurrentUserId = function(userId){
        self.currentUserId = userId;
    };

    self.mouseClick = function(event){
        if(!self.currentUser){
            return;
        }

        let x = event.clientX - self.canvasPos.x - self.currentUser.x;
        let y = event.clientY - self.canvasPos.y - self.currentUser.y;
        self.room.send({command: "click", x: x, y: y});
    };

    self.refreshState = function(state){
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
    };


    self.init = function(){
        self.canvas.addEventListener("click", self.mouseClick, false);

        let host = window.document.location.host.replace(/:.*/, '');

        let client = new Colyseus.Client(location.protocol.replace("http", "ws") + host + (location.port ? ':'+location.port : ''));
        self.room = client.join("field");

        self.room.onJoin.add(function () {
            console.log("joined");
            //self.timer_id = setInterval(self.tick, Config.tickInterval);
        });

        self.room.onStateChange.add(function(state) {
            console.log('state refresh ', state);
            self.refreshState(state);
        });

        self.room.onMessage.add(function(message) {
            console.log('message', message);
        });

        self.room.onLeave.add(function(e){
            console.log('Game over:', e);
        });

        // self.room.listen("circles/:id", (change) => {
        //     if(!Object.keys(self.circles).length){
        //         return;
        //     }
        //     // let circle = self.circles[parseInt(change.path["id"])];
        //     // if(!circle)
        //     // {
        //     //     return;
        //     // }
        //     // circle[change.path["attribute"]] = change.value;
        //     //console.log(change.operation); // => "replace" (can be "add", "remove" or "replace")
        //     // console.log(change.path["id"]); // => "f98h3f"
        //     // console.log(change.path["attribute"]); // => "y"
        //     // console.log(change.value); // => 1
        // })
    };

    self.init();
};