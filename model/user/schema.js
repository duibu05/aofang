const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  account: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String },
  role: {
    type: { type: String, default: 'admin' },
    name: { type: String }
  },
  status: { type: Number, enum: [0, 1], default: 1 },
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    timestamp: { type: Number, default: Date.now() },
    updatedAt: {
      type: Date,
      default: Date.now()
    },
  }
});

userSchema.pre('save', function(next) {
  this.meta.createdAt = new Date();
  this.meta.timestamp = Date.now();

  next();
})

userSchema.pre('save', function (next) {
  let user = this;

  if (!this.isNew)
    user.meta.updatedAt = Date.now();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    })
  })
});

userSchema.post('find', function (results) {
  for (let i = 0, len = results.length; i < len; i++) {
    results[i].password = ''
  }
});

userSchema.methods = {
  comparePassword(password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) return cb(err);
      cb(null, isMatch);
    })
  }
};

userSchema.statics = {
  hashPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) reject(err);
    
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) reject(err);
          resolve(hash);
        })
      })
    })
  }
}

module.exports =  userSchema;
