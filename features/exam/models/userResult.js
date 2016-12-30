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
        },
        updated_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Invalid date value'
                }
            }
        },
        created_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Invalid date value'
                }
            }
        }
    }, {
        tableName: "tk_userResult",
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    })
};