var Circle = function(x, y, square) {
    var self = this;
    self.x = x;
    self.y = y;
    self.square = square;
    self.speedX = 0;
    self.speedY = 0;
    self.userId = null;

    self.updateRadius = function() {
        self.radius = Utils.circleRadius(self.square);
    };

    self.draw = function(ctx, currentUser) {
        ctx.beginPath();
        ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
        if(currentUser && self.userId == currentUser.userId){
            ctx.fillStyle = 'blue';
        }
        else{
            ctx.fillStyle = currentUser.square > self.square ? 'green' : 'red';
        }
        ctx.fill();
    };

    self.init = function(){
        self.updateRadius();
    };

    self.absorb = function(intersectionSquare){
        self.square += intersectionSquare;
        self.updateRadius();
    };

    self.init();
};