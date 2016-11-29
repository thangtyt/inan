/**
 * Created by thangtyt on 11/26/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("resultAnswer", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        user_result_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        answer_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        isSure: {
            type: DataTypes.BOOLEAN
        },
        chose: {
            type: DataTypes.INTEGER
        },
        content: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: "tk_resultAnswer"
    })
};