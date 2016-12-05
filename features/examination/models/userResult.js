/**
 * Created by thangtyt on 11/26/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("userResult", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        exam_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        time: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        mark: {
            type: DataTypes.FLOAT
        },
        level: {
            type: DataTypes.INTEGER
        }
    }, {
        tableName: "tk_userResult",
        onDelete: 'restrict'
    })
};