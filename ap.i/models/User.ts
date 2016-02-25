/*
/!*var Q = require('q');
import Promise = Q.Promise;*!/
var sails = require('sails');
import Model = sails.Model;
//var Q = require('Q');

var _ = require('lodash');
var crypto = require('crypto');

/!** @module User *!/
export class User extends Model{
  attributes = {
    username: {
      type: 'string',
      unique: true,
      index: true,
      notNull: true
    },
    email: {
      type: 'email',
      unique: true,
      index: true
    },
    passports: {
      collection: 'Passport',
      via: 'user'
    },

    getGravatarUrl: function () {
      var md5 = crypto.createHash('md5');
      md5.update(this.email || '');
      return 'https://gravatar.com/avatar/'+ md5.digest('hex');
    },

    toJSON: function () {
      var user = (<any>this).toObject();
      delete user.password;
      user.gravatarUrl = this.getGravatarUrl();
      return user;
    }
  }

  beforeCreate(user, next) {
    if (_.isEmpty(user.username)) {
      user.username = user.email;
    }
    next();
  }

  /!**
   * Register a new User with a passport
   *!/
  register(user) {
    return new Promise((resolve, reject) =>{
      sails.services.passport.protocols.local.createUser(user, function (error, created) {
        if (error) return reject(error);

        resolve(created);
      });
    });
  }
}
*/
