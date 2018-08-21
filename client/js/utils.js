var Utils = {
    randomInInterval: function(min, max){
        return Math.random() * (max - min) + min;
    },
    circleIntersection: function(r1, r2, d){
        if(r1 > r2 && r1 - r2 > d){
            return Math.PI * r2 * r2;
        }
        if(r2 > r1 && r2 - r1 > d){
            return Math.PI * r1 * r1;
        }
        var p = (r1 + r2 + d) / 2;
        var h = 2 * Math.sqrt(p * (p - r1) * (p - r2) * (p - d)) / d;
        var a1 = 2 * Math.asin(h / r1);
        var a2 = 2 * Math.asin(h / r2);
        var s1 = (r1 * r1) * (a1 - Math.sin(a1)) / 2;
        var s2 = (r2 * r2) * (a2 - Math.sin(a2)) / 2;
        return s1 + s2;
    }
};