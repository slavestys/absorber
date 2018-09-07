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

    self.startEvent = new Event('start_game');
    self.restartEvent = new Event('restart_game');

    self.startGame = function(){
        self.startMenuElement.style.display = 'none';
        self.restartMenuElement.style.display = 'none';
        document.dispatchEvent(self.startEvent);
    };

    self.onGameOver = function(code){
        let message = code == Config.codeWin ? 'Вы победили' : 'Вы проиграли';
        self.restartMenuElement.querySelector('span').innerHTML = message;
        self.restartMenuElement.style.display = 'block';
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
        self.restartMenuElement.style.display = 'none';
    };

    self.init = function(){
        self.alignElements();
        self.startButton.addEventListener("click", self.startGame, false);
        self.restartButton.addEventListener("click", self.startGame, false);
    };

    self.init();
};