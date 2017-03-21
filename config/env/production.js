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
        host: 'nodejsdb2.cgrt7780r6hk.ap-southeast-1.rds.amazonaws.com',
        port: '5432',
        database: 'inanphat',
        username: 'thangnv',
        password: 'khaiminh11092006',
        logging: false
    },
    redis: {
        host: 'localhost',
        port: '6379'
    },


    extensions: [
        '.jpg', '.jpeg', '.gif', '.png', '.bmp',
        '.psd', '.pdf',
        '.txt', '.doc', '.docx', '.csv', '.xls', '.xlsx',
        '.zip', '.rar', '.tar', '.gz','.mp3','.mp4','.wma'
    ],
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
