/**
 * A library model
 * This model gets populated when retrieving the library data from the database
 *
 * @param  {String}  id                     The id of the library
 * @param  {String}  code                   The code of the library
 * @param  {String}  name                   The name of the library
 * @param  {String}  url                    The slugged url of the library
 * @param  {Type}    type                   The type of the library
 * @param  {String}  email                  The email address of the library
 * @param  {Coords}  coords                 The GPS coordinates of the library
 * @param  {String}  address                The address of the library
 * @param  {String}  telephone              The telephone number of the library
 * @param  {String}  fax                    The fax number of the library
 * @param  {String}  web                    The website url of the library
 * @param  {String}  map                    The map url of the library
 * @param  {String}  opening_hours          The opening hours of the library
 * @param  {String}  admits                 The admit information of the library
 * @param  {String}  stock                  The stock information of the library
 * @param  {String}  special_collections    The special collections information of the library
 * @param  {String}  services               The services information of the library
 * @param  {String}  dbase                  The database the library uses (e.g. cambrdgedb, depfacaedb)
 * @return {Library}                        The returned library object
 */
exports.Library = function(id, code, name, url, type, email, coords, address, telephone, fax, web, map, opening_hours, admits, stock, special_collections, services, dbase) {
    var that = {};
    that.id = id;
    that.url = url;
    that.code = code;
    that.name = name;
    that.type = type;
    that.email = email;
    that.coords = coords;
    that.address = address;
    that.telephone = telephone;
    that.fax = fax;
    that.web = web;
    that.map = map;
    that.opening_hours = opening_hours;
    that.admits = admits;
    that.stock = stock;
    that.special_collections = special_collections;
    that.services = services;
    that.dbase = dbase;
    return that;
};

/**
 * A type model
 * This represents the library type
 *
 * @param  {String}  code                   The type code (e.g. 'D')
 * @param  {String}  name                   The type name (e.g. 'Department')
 * @return {Type}                           The returned type object
 */
exports.Type = function(code, name) {
    var that = {};
    that.code = code;
    that.name = name;
    return that;
};
