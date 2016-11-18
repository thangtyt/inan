/**
 * Created by thangnv on 11/17/16.
 */
'use strict';

//let slug = require('slug');
//let Promise = require('arrowjs').Promise;
//let _ = require('arrowjs')._;

module.exports = function (action, component, app) {

    /**
     * Find answer by ID
     * @param id {integer} - Id of answer
     */
    action.answerFindById = function (id) {
        return app.models.answer.findById(id);
    };

    /**
     * Find answer with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.answerFind = function (conditions) {
        return app.models.answer.find(conditions);
    };

    /**
     * Find all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.answerFindAll = function (conditions) {
        return app.models.answer.findAll(conditions);
    };

    /**
     * Find and count all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.answerFindAndCountAll = function (conditions) {
        return app.models.answer.findAndCountAll(conditions);
    };

    /**
     * Count categories
     */
    action.answerCount = function () {
        return app.models.answer.count();
    };

    /**
     * Create new answer
     * @param data {object} - Data of new answer
     */
    action.answerCreate = function (data) {
        return app.models.answer.create(data);
    };
    /**
     * Update answer
     * @param answer {object} - answer need to update
     * @param data {object} - New data
     */
    action.answerUpdate = function (answer, data) {
        return answer.updateAttributes(data);
    };

    /**
     * Delete categories by ids
     * @param ids {array} - Array ids of categories
     */
    action.answerDelete = function (ids) {
        return app.models.answer.destroy({
            where: {
                id: {
                    $in: ids
                }
            }
        })
    };

};