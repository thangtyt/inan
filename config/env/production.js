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
        host: 'ec2-54-243-124-240.compute-1.amazonaws.com',
        port: '5432',
        database: 'd8r3pqlfg6fm4n',
        username: 'kiqmjhxlaycxkv',
        password: 'e8e4956acaed84e65c970a82d082e6488f7a241ae5ad9de861fcf10a769bf413',
        dialect: 'postgres',
        dialectOptions: {
            ssl: true
        },
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
