const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.json()
    ),
    transports: [
        // Write to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Write to error log file
        new winston.transports.File({
            filename: path.join(__dirname, 'error.log'),
            level: 'error'
        }),
        // Write to combined log file
        new winston.transports.File({
            filename: path.join(__dirname, 'combined.log')
        })
    ]
});

module.exports = logger;
