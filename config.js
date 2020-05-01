'use strict';
// use with mlab database
exports.PORT=process.env.PORT || 8080;
exports.DATABASE_URL = process.env.DATABASE_URL; 
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.ALPHA_KEY1 = process.env.ALPHA_KEY1;
exports.ALPHA_KEY2 = process.env.ALPHA_KEY2;
exports.ALPHA_KEY3 = process.env.ALPHA_KEY3;
exports.NEWS_KEY = process.env.NEWS_KEY;