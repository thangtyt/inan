/**
 * Created by thangtyt on 12/13/16.
 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("examRate", {
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
        rating: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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
        tableName: "tk_examRate",
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    })
};