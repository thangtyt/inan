/**
 * Created by thangnv on 11/11/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("chapter",{
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull : false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lessons: {
            type: DataTypes.TEXT
        },
        subject_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        index: {
            type: DataTypes.INTEGER
        },
        created_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Invalid date value'
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
        }
    },{
        tableName: "tk_chapter",
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        onDelete: 'no action'
    })
}