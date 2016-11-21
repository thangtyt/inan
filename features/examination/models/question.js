/**
 * Created by thangnv on 11/11/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("question", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        question_type: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        section_id: {
            type: DataTypes.UUID
        },
        content: {
            type: DataTypes.TEXT
        },
        subject_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        chapter_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        lesson: {
            type: DataTypes.STRING,
            allowNull: false
        },
        /*
            0: easy,
            1: normal,
            2: difficult
            3: super star
        */
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 3
            }
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        /*
         0: pending,
         1: activate,
         2: deactivate
         */
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1,//todo: fix 1 default to display frontend. Edit later
            validate: {
                min: 0,
                max: 2
            }
        },
        user_active: {
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
    },{
        indexes: [
            {
                unique: false,
                fields: ['content']
            }
        ],
        tableName: 'tk_question',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
}