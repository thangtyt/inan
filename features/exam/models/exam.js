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
            allowNull: false
        },
        total_mark: {
            type: DataTypes.INTEGER,
            allowNull: false,
            set: function (val) {
                if(typeof val !== 'number'){
                    this.setDataValue('total_mark', Number(val));
                }else{
                    this.setDataValue('total_mark', val);
                }
            }
        },
        total_question: {
            type: DataTypes.INTEGER,
            allowNull: false,
            set: function (val) {
                if(typeof val !== 'number'){
                    this.setDataValue('total_question', Number(val));
                }else{
                    this.setDataValue('total_question', val);
                }
            }
        },
        total_time: {
            type: DataTypes.INTEGER,
            allowNull: false,
            set: function (val) {
                if(typeof val !== 'number'){
                    this.setDataValue('total_time', Number(val));
                }else{
                    this.setDataValue('total_time', val);
                }
            }
        },
        sections: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: [],
            set: function (val) {
                if(typeof val !== 'object'){
                    this.setDataValue('sections', [val]);
                }else{
                    this.setDataValue('sections',val);
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
         */
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            set: function (val) {
                if(typeof val !== 'number'){
                    this.setDataValue('level', Number(val));
                }else{
                    this.setDataValue('level', val);
                }
            },
            validate: {
                min: 1,
                max: 3
            }
        },
        rating: {
            type: DataTypes.INTEGER,
            defaultValue : 1,
            set: function (val) {
                if(typeof val !== 'number'){
                    this.setDataValue('rating','1');
                }else{
                    this.setDataValue('rating',val);
                }
            },
            validate: {
                min: 1,
                max: 5
            }
        },
        status: {
            type: DataTypes.INTEGER,
            set: function (val) {
                if(typeof val !== 'number'){
                    this.setDataValue('status', Number(val));
                }else{
                    this.setDataValue('status', val);
                }
            },
            defaultValue: 0
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: false,
            set: function (val) {
                if(typeof val !== 'number'){
                    this.setDataValue('created_by', Number(val));
                }else{
                    this.setDataValue('created_by', val);
                }
            }
        },
        gift_code: {
            type: DataTypes.STRING,
            isValid: function (val) {
                if(!val.match(/[A-Z0-9]{5}/)){
                    throw new ERROR('Invalid input Gift Code !')
                }
            }
        },
        gifts: {
            type: DataTypes.TEXT
        },
        reference: {
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
        updatedAt: 'updated_at',
        onDelete: 'no action'
    })
}