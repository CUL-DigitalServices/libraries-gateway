var ResultModel = require('../../../models/search/result');

/**
 * Function that creates a resource model
 *
 * @param  {Object}  data    Object containing the data to create the model
 * @return {Result}          The created result model
 */
var createResourceModel = module.exports.createResourceModel = function(data) {
    try {
        return new ResultModel.Result(
            data.id,
            data.src,
            data.extId,
            data.titles,
            data.description,
            data.isbn,
            data.eisbn,
            data.issn,
            data.ssid,
            data.authors,
            data.published,
            data.subjects,
            data.series,
            data.tags,
            data.notes,
            data.contentType,
            data.thumbnails,
            data.links,
            data.branches
        );
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that creates a branch model
 *
 * @param  {Object}  data    Object containing the data to create the model
 * @return {Branch}          The created branch model
 */
var createBranchModel = module.exports.createBranchModel = function(data) {
    try {
        return new ResultModel.Branch(
            data.name,
            data.classmark,
            data.status,
            data.numberOfItems
        );
    } catch(error) {
        log().error(error);
        return null;
    }
};
