/**
 * Created by thangnv on 11/11/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("questionReport", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        question_id: {
            type: DataTypes.UUID
        },
        content: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 2
            }
        },
        created_by: {
            type: DataTypes.BIGINT
        },
        update_by: {
            type: DataTypes.BIGINT
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
    },{
        tableName: 'tk_question_report',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        onDelete: 'no action'
    });
}