/**
 * Created by thangnv on 11/14/16.
 */
'use strict';

//let slug = require('slug');

module.exports = function (action, comp, app) {
    //subject actions
    action.sCreate = function (subject) {
        return app.models.subject.create(subject);
    }
    action.sUpdate = function (subject,data) {
        return subject.updateAttributes(data);
    }
    action.sFindAndCountAll = function (conditions) {
        return app.models.subject.findAndCountAll(conditions);
    }
    action.sFindAll = function (conditions) {
        return app.models.subject.findAll(conditions);
    }
    action.sFind = function (conditions) {
        return app.models.subject.find(conditions);
    }
    //chapter actions
    action.cDelete = function (conditions) {
        return app.models.chapter.destroy(conditions);
    }
    action.cUpdate = function (chapter,data) {
        return app.models.chapter.update(chapter,data);
    }
    action.cCreate = function (chapter) {
        return app.models.chapter.create(chapter);
    }
    action.cFindAll = function (conditions) {
        return app.models.chapter.findAll(conditions);
    }
}