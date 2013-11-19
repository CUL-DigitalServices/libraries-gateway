/**
 * Function that initializes the server by calling the 'createServer' method in the serverController.
 * After the server has been created and successfully spun up, the routes are registered.
 * @api private
 */
var init = function() {

    // Create a new express server
    // @see /lib/controllers/server
    require('./lib/util/server').createServer(__dirname, function(app) {

        ////////////////
        // API routes //
        ////////////////

        // This displays an instance of the Swagger UI
        app.get('/api', function(req, res) {
            res.sendfile(__dirname + '/public/swagger/index.html');
        });

        app.get('/api/libraries', require('./lib/controllers/api/libraries').getLibraries);
        app.get('/api/libraries/:id', require('./lib/controllers/api/libraries').getLibraries);
        app.get('/api/search', require('./lib/controllers/api/search').getResults);

        ///////////////////
        // Client routes //
        ///////////////////

        // Home
        app.get('/', require('./lib/controllers/client/nodes/home').getContent);

        // Blog
        app.get('/blogs', require('./lib/controllers/client/nodes/blogs').getContent);

        // Find a library
        app.get('/find-a-library', require('./lib/controllers/client/nodes/libraries').getContent);
        app.get('/find-a-library/:id', require('./lib/controllers/client/nodes/libraries').getLibraryDetail);

        // Find a resource
        app.get('/find-a-resource',  require('./lib/controllers/client/nodes/resources').getContent);
        app.get('/find-a-resource/:id',  require('./lib/controllers/client/nodes/resources').getResourceDetail);

        // My account
        app.get('/my-account', require('./lib/controllers/client/nodes/account').getContent);

        // Using our libraries
        app.get('/using-our-libraries', require('./lib/controllers/client/nodes/usinglibraries').getContent);

        ////////////
        // ERRORS //
        ////////////

        // ErrorHandler
        app.use(require('./lib/controllers/error/errorHandler').getErrorPage);
    });
};

init();
