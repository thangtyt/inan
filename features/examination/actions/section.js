/**
 * Created by thangnv on 11/15/16.
 */
'use strict';

//let slug = require('slug');
//let Promise = require('arrowjs').Promise;
//let _ = require('arrowjs')._;

module.exports = function (action, component, app) {

    /**
     * Find section by ID
     * @param id {integer} - Id of section
     */
    action.secFindById = function (id) {
        return app.models.section.findById(id);
    };

    /**
     * Find section with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.secFind = function (conditions) {
        return app.models.section.find(conditions);
    };

    /**
     * Find all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.secFindAll = function (conditions) {
        return app.models.section.findAll(conditions);
    };

    /**
     * Find and count all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.secFindAndCountAll = function (conditions) {
        return app.models.section.findAndCountAll(conditions);
    };

    /**
     * Count categories
     */
    action.secCount = function () {
        return app.models.section.count();
    };

    /**
     * Create new section
     * @param data {object} - Data of new section
     */
    action.secCreate = function (data) {
        return app.models.section.create(data);
    };
    /**
     * Update section
     * @param section {object} - section need to update
     * @param data {object} - New data
     */
    action.secUpdate = function (section, data) {
        return section.updateAttributes(data);
    };

    /**
     * Delete categories by ids
     * @param ids {array} - Array ids of categories
     */
    action.secDelete = function (ids) {
        return app.models.section.destroy({
            where: {
                id: {
                    $in: ids
                }
            }
        })
    };

};