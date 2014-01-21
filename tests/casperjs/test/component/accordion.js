casper.test.begin('Accordion', function(test) {

    var evaluateBase = function() {
        test.assertExists('#collapse', 'Accordion element exists');
    };

    var evaluateCollapsing = function() {
        var totalArticles = casper.evaluate(function() {
            return document.getElementById('collapse').children.length;
        });

        for (var i = 1; i <= totalArticles; i += 1) {
            var contentId = '#collapse' + i;
            var trigger = '[href="' + contentId + '"]';

            test.assertExists(contentId, 'Article content exists');
            test.assertNotVisible(contentId, 'Article content is hidden by default');

            casper.click(trigger);
            casper.wait(100);

            casper.then(function() {
                test.assertVisible(contentId, 'Article content is shown when its heading is clicked');
            });
        }
    };

    casper.start(config.url + config.pages.usingOurLibraries, function() {

        casper.echo('Starting using-our-libraries accordion tests', 'INFO');

        casper.then(function() {
            evaluateBase();
        });

        casper.wait(100, function() {
            casper.echo('Waited 100ms for the JS to execute.', 'COMMENT');
        });

        casper.then(function() {
            evaluateCollapsing();
        });
    });

    casper.run(function() {
        test.done();
    });
});
