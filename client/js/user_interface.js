UserInterface = function(x, y, width, height){
    var self = this;

    self.x = x;
    self.y = y;
    self.width = width;
    self.height = height;

    self.startMenuElement = document.getElementById("start_menu");
    self.startButton = document.getElementById("start");

    self.restartMenuElement = document.getElementById("restart_menu");
    self.restartButton = document.getElementById("restart");

    self.startingMenuElement = document.getElementById("starting_menu");
    self.beginButton = document.getElementById("begin");

    self.startEvent = new Event('start_game');
    self.restartEvent = new Event('restart_game');
    self.beginEvent = new Event('begin_game');

    self.startGame = function(){
        self.startMenuElement.style.display = 'none';
        self.restartMenuElement.style.display = 'none';
        self.startingMenuElement.style.display = 'block';
        document.dispatchEvent(self.startEvent);
    };

    self.beginGame = function(){
        document.dispatchEvent(self.beginEvent);
    };

    self.onGameOver = function(code){
        let message = code == Config.codeWin ? 'Вы победили' : 'Вы проиграли';
        self.restartMenuElement.querySelector('span').innerHTML = message;
        self.restartMenuElement.style.display = 'block';
    };

    self.onGameStarting = function(data){
        let secondsSpan = document.getElementById('seconds_to_start');
        secondsSpan.innerHTML = data.seconds_remain;
        let usersCount = document.getElementById('current_users_size');
        usersCount.innerHTML = data.users;
        if(data.is_owner){
            self.beginButton.style.display = 'inline';
        }
        else{
            self.beginButton.style.display = 'none';
        }
    };

    self.onGameStarted = function(){
        self.startingMenuElement.style.display = 'none';
    };

    function alignElement(elem){
        elem.style.left = `${self.x}px`;
        elem.style.top = `${self.y}px`;
        elem.style.width = `${self.width}px`;
        elem.style.height = `${self.height}px`;
    }

    self.alignElements = function(){
        alignElement(self.startMenuElement);
        alignElement(self.restartMenuElement);
        alignElement(self.startingMenuElement);
        self.startMenuElement.style.display = 'block';
    };

    self.init = function(){
        self.alignElements();
        self.startButton.addEventListener("click", self.startGame, false);
        self.restartButton.addEventListener("click", self.startGame, false);
        self.beginButton.addEventListener("click", self.beginGame, false);
        self.beginButton.style.display = 'none';
    };

    self.init();
};