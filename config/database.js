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
        models.question.belongsTo(models.chapter, { foreignKey: 'chapter_id' });

        models.section.hasMany(models.question, {foreignKey: 'section_id'});
        models.question.belongsTo(models.section, {foreignKey: 'section_id'});

        models.section.hasMany(models.exam, {foreignKey: 'section_id'});
        models.exam.belongsTo(models.section, {foreignKey: 'section_id'});

        models.userInfo.belongsTo(models.user, { foreignKey: 'user_id' });
        models.user.hasOne(models.userInfo, { foreignKey: 'user_id' });

        models.user.hasMany(models.userResult, {foreignKey: 'user_id'});
        models.userResult.belongsTo(models.user, {foreignKey: 'user_id'});

        models.userResult.hasMany(models.resultAnswer, {foreignKey: 'user_result_id'});
        models.resultAnswer.belongsTo(models.userResult, {foreignKey: 'user_result_id'});

        models.exam.hasMany(models.userResult, {foreignKey: 'exam_id'});
        models.userResult.belongsTo(models.exam, {foreignKey: 'exam_id'});

        models.answer.hasMany(models.resultAnswer, {foreignKey: 'answer_id'});
        models.resultAnswer.belongsTo(models.answer, {foreignKey: 'answer_id'});

        models.gift.hasMany(models.giftCode,{foreignKey: 'gift_id'});
        models.giftCode.belongsTo(models.gift, {foreignKey: 'gift_id'});

        models.user.hasMany(models.gift,{foreignKey: 'user_id'});
        models.gift.belongsTo(models.user, {foreignKey: 'user_id'});

        models.questionReport.belongsTo(models.user,{foreignKey: 'created_by'});
        models.questionReport.belongsTo(models.question,{foreignKey: 'question_id'});
    }
};