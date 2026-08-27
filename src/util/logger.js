const path = require('path');
const winston = require('winston');
const config = require('../config');

const COLORIZE = config.NODE_ENV === 'development';

function createLogger(filePath) {
  const fileName = path.basename(filePath);

  const formats = [
    winston.format.label({ label: fileName }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
  ];

  if (COLORIZE) {
    formats.push(winston.format.colorize());
  }

  formats.push(
    winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
  );

  return winston.createLogger({
    level: config.LOG_LEVEL || 'info',
    format: winston.format.combine(...formats),
    transports: [new winston.transports.Console()],
  });
}

module.exports = createLogger;
