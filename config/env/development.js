'use strict';

module.exports = {
    /**
     * Uncomment to override config in development environment
     */
    port: process.env.PORT || 5000,
    db: {
        host: '103.28.39.214',
        port: '5432',
        database: 'inanphat',
        username: 'postgres',
        password: 'inanphat',
        dialect: 'postgres',
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
            user: 'thangtyt@gmail.com',
            pass: 'Khaiminh11092006'
        },
        from: 'thangtyt@gmail.com'
    },
    token : {
        timeExpires: 3600000
    }
};
