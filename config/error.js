"use strict";

let winston = require('arrowjs').winston;

module.exports = {
    logFolder: 'log',
    winstonLog: {
        transports: [
            new winston.transports.Console({
                prettyPrint: true,
                colorize: true,
                silent: false,
                timestamp: false
            }),
            new winston.transports.File({
                level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
                filename: 'logs.log',
                maxsize: 1024 * 1024 * 10, // 10MB
                name: "default-log"
            }),
            new winston.transports.File({
                level: "error",
                filename: '/error.log',
                maxsize: 1024 * 1024 * 10, // 10MB
                name: "error-log"
            })
        ],
        exceptionHandlers: [
            new winston.transports.File({
                filename: 'exceptions.log'
            }),
            new winston.transports.Console({
                prettyPrint: true,
                colorize: true,
                silent: false,
                timestamp: false
            })
        ]
    },
    fault_tolerant: {
        logdata: ["body", "query"],
        render: '',
        redirect: '500'
    },
    error: {
        "403": {
            render: "/themes/backend/adminLTE/layouts/_403.twig"
        },
        "404": {
            render: "/themes/backend/adminLTE/layouts/_404.twig"
        },
        "500": {
            render: "/themes/backend/adminLTE/layouts/_500.twig"
        }
    }
};