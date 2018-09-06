Config = {
    minRadius: 2,
    maxRadius: 20,
    interval: 5,
    minSpeed: -1,
    maxSpeed: 1,
    clientTickInterval: 50,
    serverTickInterval: 200,
    circleSquareMin: 3,
    speedChangeSquarePercent: 0.03,
    winTrigger: 0.7,
    codeWin: 4000,
    codeFail: 4001
};
Config.minDiameter = Config.minRadius * 2;
Config.maxDiameter = Config.maxRadius * 2;
module.exports = Config;