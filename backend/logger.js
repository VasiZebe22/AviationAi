const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Write all logs with importance level of 'error' or less to 'error.log'
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs with importance level of 'info' or less to 'combined.log'
        new winston.transports.File({ filename: 'logs/combined.log' }),
        // Write to console with custom format
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

module.exports = logger;
