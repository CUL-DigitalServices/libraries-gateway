var _ = require('underscore');
var mysql = require('mysql');

var config = require('../../config');

/**
 * Function that executes a MySQL query to fetch all the libraries and their data
 */
var getLibraries = module.exports.getLibraries = function() {

    // Create a new connection
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
    });

    connection.connect();
};
