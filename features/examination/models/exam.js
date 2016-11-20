/**
 * Created by thangnv on 11/11/16.
 */
module.exports = function (sequelize,DataTypes) {
    return sequelize.define("exam",{
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull : false
        },
        title: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        subject_id: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                isUUID : {
                    msg: "Invalid data input of subject"
                }
            }
        },
        total_mark: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isNumber: {
                    msg: "Invalid data input of total mark"
                }
            }
        },
        total_question: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isNumber: {
                    msg: "Invalid data input of total mark"
                }
            }
        },
        total_time: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isNumber: {
                    msg: "Invalid data input of total mark"
                }
            }
        },
        sections: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: [],
            validate: {
                isUUID : {
                    msg: "Invalid data input of subject"
                }
            }
        },
        content: {
            type: DataTypes.JSONB
        },
        desc: {
            type: DataTypes.TEXT
        },
        /*
         0: easy,
         1: normal,
         2: difficult
         3: super star
         */
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                min: 1,
                max: 5
            }
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                isNumeric: {
                    msg: "Wrong data type of created user !"
                }
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
        indexes: [
            {
                unique: true,
                fields: ['title']
            }
        ],
        tableName: "tk_exam",
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    })
}