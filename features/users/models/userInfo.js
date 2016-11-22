/**
 * Created by thangtyt on 11/22/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define("userInfo",{
        user_id : {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        school: {
            type: DataTypes.STRING
        },
        class: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        district: {
            type: DataTypes.STRING
        },
        target: {
            type: DataTypes.STRING
        },
        /*
        * 0:nu
        * 1:nam
        * 2:khac
        * */
        sex: {
            type: DataTypes.INTEGER
        }

    }, {
        tableName: 'tk_userInfo'
    })

}