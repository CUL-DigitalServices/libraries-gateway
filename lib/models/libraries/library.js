/**
 * A library model
 *
 * @param  {String}  id                     The id of the library
 * @param  {String}  code                   The code of the library
 * @param  {String}  name                   The name of the library
 * @param  {String}  email                  The email address of the library
 * @param  {String}  lat                    The langitude of the library
 * @param  {String}  lng                    The longitute of the library
 * @param  {String}  address                The address of the library
 * @param  {String}  telephone              The telephone number of the library
 * @param  {String}  fax                    The fax number of the library
 * @param  {String}  web                    The website url of the library
 * @param  {String}  map                    The map url of the library
 * @param  {String}  admits                 The admit information of the library
 * @param  {String}  stock                  The stock information of the library
 * @param  {String}  special_collections    The special collections information of the library
 * @param  {String}  services               The services information of the library
 * @param  {String}  opening_hours          The opening hours of the library
 * @return {Library}                        The returned library object
 */
exports.Library = function(id, code, name, email, lat, lng, address, telephone, fax, web, map, admits, stock, special_collections, services, opening_hours) {
    var that = {};
    that.id = id;
    that.code = code;
    that.name = name;
    that.email = email;
    that.lat = lat;
    that.lng = lng;
    that.address = address;
    that.telephone = telephone;
    that.fax = fax;
    that.web = web;
    that.map = map;
    that.admits = admits;
    that.stock = stock;
    that.special_collections = special_collections;
    that.services = services;
    that.opening_hours = opening_hours;
    return that;
};
