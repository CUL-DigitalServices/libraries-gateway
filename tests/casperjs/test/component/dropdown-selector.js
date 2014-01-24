casper.test.begin('DropdownSelector', function(test) {

    var evaluateBase = function(dropdownSelector) {
        test.assertExists(dropdownSelector, 'Dropdown container exists');
        test.assertExists(dropdownSelector + ' .dropdown-toggle', 'Dropdown button exists');
        test.assertExists(dropdownSelector + ' .dropdown-menu', 'Dropdown options exist');
        test.assertNotVisible(dropdownSelector + ' .dropdown-menu', 'Dropdown options are hidden by default');
    };

    var evaluateBaseRemove = function(dropdownSelector) {
        test.assertExists('.lg-dropdown-selector-alphabet .lg-btn-remove', 'Remove button exists');
        test.assertNotVisible('.lg-dropdown-selector-alphabet .lg-btn-remove', 'Remove button is hidden by default');
    };

    var evaluateOptions = function(dropdownSelector) {
        var testedIndices = [];
        var optionsLength = casper.evaluate(function(optionsSelector) {
            return document.querySelector(optionsSelector).children.length;
        }, dropdownSelector + ' .dropdown-menu');
        test.assertTruthy(optionsLength, 'Dropdown menu has options');
        while (testedIndices.length < optionsLength) {
            var randomIndex = util.random(optionsLength, 1, testedIndices);
            var option = dropdownSelector + ' .dropdown-menu' + ' li:nth-child(' + randomIndex + ') a';
            var optionInfo = casper.getElementInfo(option);
            testedIndices.push(randomIndex);

            test.assert(optionInfo.attributes['data-value'] !== undefined, 'Dropdown option has a data-value attribute defined (' + testedIndices.length + ')');
            casper.click(dropdownSelector + ' .dropdown-toggle');
            test.assertVisible(dropdownSelector + ' .dropdown-menu', 'Dropdown options are shown after the dropdown button has been clicked (' + testedIndices.length + ')');
            casper.click(option);

            test.assertNotVisible(dropdownSelector + ' .dropdown-menu', 'Dropdown options are hidden when an option is clicked (' + testedIndices.length + ')');
            test.assertSelectorHasText(dropdownSelector + ' .dropdown-toggle span', optionInfo.text, 'Dropdown button text is updated when an option is clicked (' + testedIndices.length + ')');
        }
    };

    var evaluateRemoveFunctionality = function(dropdownSelector) {
        var defaultLabel = casper.getElementInfo(dropdownSelector + ' .lg-dropdown-value').attributes['data-default-label'];
        test.assert(defaultLabel !== undefined, 'Dropdown has a default label defined');
        test.assertVisible(dropdownSelector + ' .lg-btn-remove', 'Remove button is visible when an option is active');
        casper.click(dropdownSelector + ' .lg-btn-remove');
        test.assertSelectorHasText(dropdownSelector + ' .dropdown-toggle span', defaultLabel, 'Drodown label is reset to the default when the remove button is clicked');
    };

    var evaluateDropdown = function(dropdownSelector, removeEnabled) {
        casper.then(function() {
            casper.echo('Running base dropdown tests', 'INFO');
            evaluateBase(dropdownSelector);
        });

        casper.wait(100, function() {
            casper.echo('Waited 100ms for the JS to execute.', 'COMMENT');
        });

        if (removeEnabled) {
            casper.then(function() {
                evaluateBaseRemove(dropdownSelector);
            });
        }

        casper.then(function() {
            casper.echo('Running dropdown option tests', 'INFO');
            evaluateOptions(dropdownSelector);
        });

        if (removeEnabled) {
            casper.then(function() {
                casper.echo('Running remove tests', 'INFO');
                evaluateRemoveFunctionality(dropdownSelector);
            });
        }
    };

    casper.start(config.url + config.pages.findAResource, function() {

        casper.echo('Starting find-a-resource dropdown tests', 'INFO');
        evaluateDropdown('.lg-dropdown-selector');

        casper.thenOpen(config.url + config.pages.findALibrary, function() {
            casper.echo('Switched to find a library page', 'COMMENT');
        });

        casper.echo('Starting find-a-library dropdown tests', 'INFO');
        evaluateDropdown('.lg-dropdown-selector-alphabet', true);
        evaluateDropdown('.js-dropdown-selector-area', true);
    });

    casper.run(function() {
        test.done();
    });
});
