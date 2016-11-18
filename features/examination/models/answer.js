/**
 * Created by thangnv on 11/11/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("answer", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        mark: {
            type: DataTypes.STRING(10),
            defaultValue: '0'
        },
        content: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        time: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        answer_keys: {
            type: DataTypes.JSONB
        },
        question_id: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, {
        tableName: "tk_answer"
    })
}