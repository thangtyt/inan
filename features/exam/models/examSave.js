/**
 * Created by thangtyt on 12/14/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("examSave", {
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
        updated_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Invalid date !'
                }
            }
        },
        created_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Invalid date !'
                }
            }
        }
    }, {
        tableName: "tk_examSave",
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    })
};