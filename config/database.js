"use strict";

module.exports = {
    db: {
        host: 'localhost',
        port: '5432',
        database: 'arrowjs',
        username: 'postgres',
        password: '',
        dialect: 'postgres',
        logging: false
    },
    associate: function (models) {
        models.menu.hasMany(models.menu_detail, {foreignKey: 'menu_id'});
        models.menu_detail.belongsTo(models.menu, {foreignKey: 'menu_id'});
        models.user.belongsTo(models.role, {foreignKey: 'role_id'});
        models.role.hasMany(models.user, {foreignKey: 'role_id'});
        models.post.belongsTo(models.user, {foreignKey: "created_by"});
        //tkbooks
        models.question.hasMany(models.answer, {foreignKey: 'question_id'});
        models.answer.belongsTo(models.question, {foreignKey: 'question_id'});

        models.subject.hasMany(models.question, {foreignKey: 'subject_id'});
        models.question.belongsTo(models.subject, {foreignKey: 'subject_id'});

        models.subject.hasMany(models.chapter, {foreignKey: 'subject_id'});
        models.chapter.belongsTo(models.subject, {foreignKey: 'subject_id'});

        models.subject.hasMany(models.section, {foreignKey: 'subject_id'});
        models.section.belongsTo(models.subject, {foreignKey: 'subject_id'});

        models.subject.hasMany(models.exam, {foreignKey: 'subject_id'});
        models.exam.belongsTo(models.subject, {foreignKey: 'subject_id'});

        models.user.hasMany(models.question, {foreignKey: 'created_by'});
        models.question.belongsTo(models.user, {foreignKey: 'created_by'});

        models.user.hasMany(models.exam, {foreignKey: 'created_by'});
        models.exam.belongsTo(models.user, {foreignKey: 'created_by'});

        models.chapter.hasMany(models.question, { foreignKey: 'chapter_id' });
        models.question.belongsTo(models.chapter, { foreignKey: 'chapter_id' })

    }
};