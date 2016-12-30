/**
 * Created by thangnv on 11/17/16.
 */
'use strict';

//let slug = require('slug');
//let Promise = require('arrowjs').Promise;
//let _ = require('arrowjs')._;

module.exports = function (action, component, app) {

    /**
     * Find question by ID
     * @param id {integer} - Id of question
     */
    action.findById = function (id) {
        return app.models.question.findById(id);
    };

    /**
     * Find question with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.find = function (conditions) {
        return app.models.question.find(conditions);
    };

    /**
     * Find all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAll = function (conditions) {
        return app.models.question.findAll(conditions);
    };

    /**
     * Find and count all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAndCountAll = function (conditions) {
        return app.models.question.findAndCountAll(conditions);
    };

    /**
     * Count categories
     */
    action.count = function (conditions) {
        return app.models.question.count(conditions);
    };

    /**
     * Create new question
     * @param data {object} - Data of new question
     */
    action.create = function (data) {
        return app.models.question.create(data);
    };
    /**
     * Update question
     * @param question {object} - question need to update
     * @param data {object} - New data
     */
    action.update = function (question, data) {
        return question.updateAttributes(data);
    };

    /**
     * Delete categories by ids
     * @param ids {array} - Array ids of categories
     */
    action.delete = function (ids) {
        return app.models.question.destroy({
            where: {
                id: {
                    $in: ids
                }
            }
        })
    };

};