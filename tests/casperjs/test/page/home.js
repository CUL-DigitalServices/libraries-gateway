casper.test.begin('Homepage', function(test) {

    var evaluateTweets = function() {
        test.assertExists('.lg-tweet', 'Tweets are shown on the page');
        var tweetsLength = casper.evaluate(function() {
            return $('.lg-tweet').length;
        });
        test.assertEquals(tweetsLength, 8, 'The amount of tweets shown is eight.');
    };

    var evaluateSearch = function() {
        test.assertExists('.lg-search-form', 'The search form is visible.');
    };

    casper.start(config.url, function() {
        casper.then(evaluateSearch);
        casper.then(evaluateTweets);
    });

    casper.run(function() {
        test.done();
    });
});
