/**
 * Created by thangtyt on 12/22/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("gift",{
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull : false
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            notEmpty: true
        },
        desc: {
            type: DataTypes.TEXT
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
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },{
        tableName: "tk_gift",
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        onDelete: 'no action'
    })
}