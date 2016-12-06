/**
 * Created by thangnv on 11/17/16.
 */
'use strict';

//let slug = require('slug');
//let Promise = require('arrowjs').Promise;
//let _ = require('arrowjs')._;

module.exports = function (action, component, app) {


    action.examUserFindAll = function (conditions) {
        return app.models.userResult.findAll(conditions);
    }
    /**
     * Find exam by ID
     * @param id {integer} - Id of exam
     */
    action.examFindById = function (id) {
        return app.models.exam.findById(id);
    };
    /**
     * Find exam with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.examFind = function (conditions) {
        return app.models.exam.find(conditions);
    };

    /**
     * Find all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.examFindAll = function (conditions) {
        return app.models.exam.findAll(conditions);
    };

    /**
     * Find and count all categories with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.examFindAndCountAll = function (conditions) {
        return app.models.exam.findAndCountAll(conditions);
    };

    /**
     * Count categories
     */
    action.examCount = function () {
        return app.models.exam.count();
    };

    /**
     * Create new exam
     * @param data {object} - Data of new exam
     */
    action.examCreate = function (data) {
        return app.models.exam.create(data);
    };
    /**
     * Update exam
     * @param exam {object} - exam need to update
     * @param data {object} - New data
     */
    action.examUpdate = function (exam, data) {
        return exam.updateAttributes(data);
    };

    /**
     * Delete categories by ids
     * @param ids {array} - Array ids of categories
     */
    action.examDelete = function (ids) {
        return app.models.exam.destroy({
            where: {
                id: {
                    $in: ids
                }
            }
        })
    };
    action.examSubmit = function (condition) {
        return app.models.userResult.create(condition);
    };
    action.examSubmitAnswer = function (condition) {
        return app.models.resultAnswer.create(condition);
    }

};