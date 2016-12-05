/**
 * Created by thangnv on 11/11/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("subject",{
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
        icons: {
            type: DataTypes.STRING
        },
        desc: {
            type: DataTypes.TEXT
        },
        class: {
            type: DataTypes.INTEGER
        }
    },{
        tableName: "tk_subject",
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        onDelete: 'restrict'
    })
}