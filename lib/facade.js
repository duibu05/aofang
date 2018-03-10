const mongoose = require('mongoose');

class Facade {
  constructor(name, schema) {
    this.model = mongoose.model(name, schema);
  }

  create(body) {
    const model = new this.model(body);
    return model.save();
  }

  count(...args) {
    const keyword = args[0].keyword || '';
    delete args[0].page;
    delete args[0].limit;
    delete args[0].sort;
    delete args[0].keyword;
    
    let query
    
    if(keyword) {
      let reg = new RegExp(keyword);

      query = this.model.count({
        $or : [ //多条件，数组
          { title : { $regex : reg }},
          { email : { $regex : reg }},
          { name : { $regex : reg }},
          { nickname : { $regex : reg }}
        ]
      })
    } else {
      query = this.model.count(...args)
    }

    return query.exec();
  }

  find(...args) {
    const page = +args[0].page || 0,
        limit = +args[0].limit || 0,
        sort = args[0].sort || '',
        keyword = args[0].keyword || '';
    
    delete args[0].page;
    delete args[0].limit;
    delete args[0].sort;
    delete args[0].keyword;

    let query

    if(keyword) {
      let reg = new RegExp(keyword);

      query = this.model.find({
        $or : [ //多条件，数组
          { title : { $regex : reg }},
          { email : { $regex : reg }},
          { name : { $regex : reg }},
          { nickname : { $regex : reg }}
        ]
      })
    } else {
      query = this.model.find(...args)
    }

    if(sort) {
      query.sort(sort)
    } else {
      query.sort('-timestamp')
    }

    if(page && limit) {
      query.skip((page - 1) * limit).limit(limit)
    }

    return query
      .exec();
  }

  findOne(...args) {
    return this.model
      .findOne(...args)
      .exec();
  }

  findById(...args) {
    return this.model
      .findById(...args)
      .exec();
  }

  update(...args) {
    return this.model
      .update(...args)
      .exec();
  }

  remove(...args) {
    return this.model
      .remove(...args)
      .exec();
  }
}

module.exports = Facade;
