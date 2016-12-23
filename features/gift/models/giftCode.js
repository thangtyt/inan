/**
 * Created by thangtyt on 12/22/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("giftCode",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        gift_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        gift_code: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        updated_at: {
            type: DataTypes.DATE
        },
        created_at: {
            type: DataTypes.DATE
        }
    },{
        tableName: "tk_giftCode",
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        onDelete: 'no action'
    })
}