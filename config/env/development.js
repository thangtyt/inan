'use strict';

module.exports = {
    /**
     * Uncomment to override config in development environment
     */
    port: process.env.PORT || 5000,
    db: {
        host: 'nodejsdb2.cgrt7780r6hk.ap-southeast-1.rds.amazonaws.com',
        port: '5432',
        database: 'inanphat',
        username: 'thangnv',
        password: 'khaiminh11092006',
        logging: false
    },
    //db: {
    //    host: 'localhost',
    //    port: '5432',
    //    database: 'printer_db',
    //    username: 'postgres',
    //    password: 'admin',
    //    dialect: 'postgres',
    //    logging: true
    //},
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
            user: 'thangtyt@gmail.com',
            pass: 'Khaiminh11092006'
        },
        from: 'thangtyt@gmail.com'
    },
    token : {
        timeExpires: 3600000
    }
};
