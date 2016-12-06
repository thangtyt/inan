/**
 * Created by thangnv on 11/11/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('section', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull : false
        },
        title: {
          type: DataTypes.TEXT
        },
        content: {
            type: DataTypes.TEXT
        },
        subject_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        total_mark: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_answers: {
            type: DataTypes.INTEGER
        },
        isDisplayContent: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            isIn: {
                args: [['0', '1', 0, 1, true, false]],
                msg: 'Invalid boolean value'
            }
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
        tableName: "tk_section",
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        onDelete: 'no action'
    });
}