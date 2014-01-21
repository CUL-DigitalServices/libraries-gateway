casper.test.begin('Accordion', function(test) {

    casper.start(config.url + config.pages.usingOurLibraries, function() {

        casper.echo('Starting using-our-libraries accordion tests', 'INFO');

        casper.then(function() {
            test.assertExists('#collapse', 'Accordion element exists');
        });


        casper.wait(100, function() {
            casper.echo('Waited 100ms for the JS to execute.', 'COMMENT');
        });

        casper.then(function() {
            var totalArticles = casper.evaluate(function() {
                return document.getElementById('collapse').children.length;
            });

            for (var i = 1; i <= totalArticles; i += 1) {
                var content = '#collapse' + i;
                test.assertNotVisible(content, 'Article content is hidden by default');
            }
        });
    });

    casper.run(function() {
        test.done();
    });
});
