/**
 * Created by thangnv on 11/11/16.
 */
'use strict';

module.exports = {
    /**
     * Uncomment to override config in development environment
     */
    port: process.env.PORT || 8005,
    db: {
        host: 'https://thithu-dev.caqfpadax79e.ap-southeast-1.rds.amazonaws.com',
        port: '5432',
        database: 'tkbooks',
        username: 'root',
        password: '123123123e',
        dialect: 'postgres',
        logging: false
    },
    redis: {
        host: 'localhost',
        port: '6379'
    },

    //config facebook
    facebook:{
        FACEBOOK_APP_ID : '482919618540896',
        FACEBOOK_APP_SECRET : '02e7f05494beb229d1505e731244cf94',
        CALLBACK_URL : 'http://localhost:8002/auth/facebook/callback'
    },

    //config google
    google:{
        GOOGLE_CLIENT_ID : '143838909898-cpinp1cku5o573fc9iroutnvlvtmi4ku.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET : 'xWuZy9onfv7Wu6DCfJVk_Dig',
        CALLBACK_URL : 'http://localhost:8002/auth/google/callback'
    },

    //upload module
    amazonS3 : {
        "credentials" : {
            "userName" : "mcbooks_tk",
            "accessKeyId" : "AKIAIMDIT4IY6RLY3YEQ",
            "secretAccessKey" : "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"
        },
        "bucket" : "mcbooks-tk",
        "region" : "ap-southeast-1"
    },
    extensions: [
        '.jpg', '.jpeg', '.gif', '.png', '.bmp',
        '.psd', '.pdf',
        '.txt', '.doc', '.docx', '.csv', '.xls', '.xlsx',
        '.zip', '.rar', '.tar', '.gz','.mp3','.mp4','.wma'
    ],
    defaultFolderS3: 'uploads/',
    //config nodemailer
    mailer_config: {
        service: 'Gmail',
        auth: {
            user: 'app@mcbooks.vn',
            pass: '123123123e'
        },
        from: 'app@mcbooks.vn'
    },
    //set time expires for token of reset password
    timeExpires: 600000 // 600000 milisecond = 10 minute
};
