const rateLimit = require('express-rate-limit');

// Ограничение запросов с одного IP-адреса
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Слишком много запросов с этого IP, пожалуйста, подождите 15 минут.',
});

module.exports = limiter;
