const config = {
  environment: process.env.NODE_ENV || 'dev',
  server: {
    port: process.env.PORT || 3000
  },
  mongo: {
    url: process.env.MONGO_DB_URI || 'mongodb://localhost/aofang-zh-db'
  },
  qiniu: {
    access_key: process.env.QINIU_KEY || 'key',
    secret_key: process.env.QINIU_SECRET || 'secret',
    bucket: 'kaoping',
    host:'http://upload-na0.qiniu.com/'
  }
};

module.exports = config;
