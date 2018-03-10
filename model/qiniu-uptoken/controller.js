const QINIU_CONF = require('../../config').qiniu,
      qiniuUpTokenFacade = require('./facade'),
      qiniu = require("qiniu");


//需要填写你的 Access Key 和 Secret Key
const mac = new qiniu.auth.digest.Mac(QINIU_CONF.access_key, QINIU_CONF.secret_key);

//构建客户端上传策略函数
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy({
    scope: bucket
  });
  return putPolicy.uploadToken(mac);
}


exports.uptoken = function(req, res, next) {
  qiniuUpTokenFacade.findOne().then(doc => {
    if(doc) {
      res.json({ code: 0, data: doc });
    } else {
      token = uptoken(QINIU_CONF.bucket);
      qiniuUpTokenFacade.create({ token: token })
      res.json({code:0, data: { token: token }});
    }
  }).catch(err => {
    next(err)
  })
};

