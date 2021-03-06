Config = {
    minRadius: 2,
    maxRadius: 20,
    interval: 5,
    minSpeed: -1,
    maxSpeed: 1,
    clientTickInterval: 10,
    serverTickInterval: 200,
    circleSquareMin: 3,
    speedChangeSquarePercent: 0.03,
    winTrigger: 0.7,
    codeWin: 4000,
    codeFail: 4001,
    states: {
        idle: 0,
        game: 1
    },
    game_states: {
        starting: 0,
        process: 1
    },
    field:{
        width: 480,
        height: 320
    },
    secondsToStart: 30
};
Config.minDiameter = Config.minRadius * 2;
Config.maxDiameter = Config.maxRadius * 2;
Config.serverTickKoef = Config.serverTickInterval / 1000;
Config.clientMoveKoef = Config.clientTickInterval / 1000;
Config.clientAnimationKoef = Config.clientTickInterval / Config.serverTickInterval;
Config.clientAbsorbKoef = Config.clientTickInterval / Config.serverTickInterval;
module.exports = Config;