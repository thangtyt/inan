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
        host: 'ec2-54-225-236-102.compute-1.amazonaws.com',
        port: '5432',
        database: 'dikmicpu1tfvq',
        username: 'vilkjlacngwnke',
        password: '48a63851c2c1ef572d37d64b14b5fc0b284071bc6eec6fa65e33214a8117ad65',
        native: true,
        ssl:true,
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
