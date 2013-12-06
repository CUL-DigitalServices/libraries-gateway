/**
 * A library model
 * This model gets populated when retrieving the library data from the database
 *
 * @param  {String}   id                     The id of the library
 * @param  {String}   code                   The code of the library
 * @param  {String}   name                   The name of the library
 * @param  {String}   url                    The slugged url of the library
 * @param  {Type}     type                   The type of the library
 * @param  {Coords}   coords                 The GPS coordinates of the library
 * @param  {Array}    email                  The email address of the library
 * @param  {Array}    address                The address of the library
 * @param  {Array}    telephone              The telephone number of the library
 * @param  {Array}    fax                    The fax number of the library
 * @param  {Array}    web                    The website url of the library
 * @param  {Array}    map                    The map url of the library
 * @param  {String}   opening_hours          The opening hours of the library
 * @param  {String}   admits                 The admit information of the library
 * @param  {String}   stock                  The stock information of the library
 * @param  {String}   special_collections    The special collections information of the library
 * @param  {Staff[]}  staff                  The staff of the library
 * @param  {String}   services               The services information of the library
 * @param  {String}   dbase                  The database the library uses (e.g. cambrdgedb, depfacaedb)
 * @return {Library}                         The returned library object
 */
exports.Library = function(id, code, name, url, type, coords, email, address, telephone, fax, web, map, facebook, blog, twitter, opening_hours, admits, stock, special_collections, services, staff, dbase) {
    var that = {};
    that.id = id;
    that.url = url;
    that.code = code;
    that.name = name;
    that.type = type;
    that.coords = coords;
    that.email = email;
    that.address = address;
    that.telephone = telephone;
    that.fax = fax;
    that.web = web;
    that.map = map;
    that.facebook = facebook;
    that.blog = blog;
    that.twitter = twitter;
    that.opening_hours = opening_hours;
    that.admits = admits;
    that.stock = stock;
    that.special_collections = special_collections;
    that.services = services;
    that.staff = staff;
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

/**
 * A staff model
 * This represents information about a library staff member
 *
 * @param  {String}  title                  The staff member's title (e.g. 'Dr.')
 * @param  {String}  name                   The staff member's name (e.g. 'John Doe')
 * @param  {String}  email                  The staff member's email (e.g. 'johndoe@lib.cam.ac.uk')
 * @param  {String}  position               The staff member's position (e.g. 'Assistant Librarian')
 * @param  {String}  display_email          Show the staff member's email (Y/N)
 * @param  {String}  display_title          Show the staff member's title (Y/N)
 * @return {Staff}                          The returned staff object
 */
 exports.Staff = function(title, name, email, position, display_email, display_title) {
    var that = {};
    that.title = title;
    that.name = name;
    that.email = email;
    that.position = position;
    that.display_email = display_email;
    that.display_title = display_title;
    return that;
 };
