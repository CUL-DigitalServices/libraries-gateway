var sw = require('swagger-node-express');
var url = require('url');

var param = require('swagger-node-express/Common/node/paramTypes.js');
var swe = sw.errors;

/**
 * FAQ
 */
exports.getFaqs = {
  'spec': {
    'path' : '/faqs',
    'notes' : 'Returns a collection of all the faq\'s',
    'summary' : 'Return all the faq\'s',
    'method': 'GET',    
    'responseClass' : 'List[FAQ]',
    'nickname' : 'getFaqs'
  },
  'action': function (req, res) {
    var output = res.body;
    writeResponse(res, output);
  }
};

/**
 * Libraries
 */
exports.getLibraries = {
  'spec': {
    'path' : '/libraries',
    'notes' : 'Returns a collection of all the libraries',
    'summary' : 'Return all the libraries',
    'method': 'GET',    
    'responseClass' : 'List[Library]',
    'nickname' : 'getLibraries'
  },
  'action': function (req, res) {
    var output = res.body;
    writeResponse(res, output);
  }
};

exports.getLibrariesById = {
  'spec': {
    'path' : '/libraries/{LibraryId}',
    'notes' : 'Returns a specific library',
    'summary' : 'Return a library',
    'method': 'GET',    
    'params' : [param.query('query', 'The library\'s id', 'string', true, true)],
    'responseClass' : 'List[Library]',
    'errorResponses' : [swe.invalid('tag')],
    'nickname' : 'getLibrariesById'
  },
  'action': function (req,res) {
    var output = res.body;
    writeResponse(res, output);
  }
};

/**
 * Search
 */
exports.getResults = {
  'spec': {
    'path' : '/search',
    'summary' : 'Find resources',
    'method': 'GET',    
    'params' : [param.query('query', 'The querystring to perform a search', 'string', true, true)],
    'responseClass' : 'List[Result]',
    'errorResponses' : [swe.invalid('tag')],
    'nickname' : 'getResults'
  },
  'action': function (req,res) {
    var output = res.body;
    writeResponse(res, output);
  }
};
