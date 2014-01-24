var util = {
    'random': function(max, min, excl) {
        var random;
        excl = (excl || []);
        do {
            random = Math.round(Math.random() * (max - min) + min);
        } while (excl.indexOf(random) >= 0);
        return random;
    }
};
