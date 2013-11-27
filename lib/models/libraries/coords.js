/**
 * A coords model
 *
 * @param  {String}  lat                    The latitude
 * @param  {String}  lng                    The longitude
 * @return {Coords}                         The returned coords object
 */
exports.Coords = function(lat, lng) {
    var that = {};
    that.lat = lat;
    that.lng = lng;
    return that;
};
