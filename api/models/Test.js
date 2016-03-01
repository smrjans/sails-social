/**
 * Twitter.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
export var sails;
(function (sails) {
    var models;
    (function (models) {
        class Test {
            constructor() {
                this.attributes = {};
                this.connection = 'someMongodbServer';
            }
        }
        models.Test = Test;
        module.exports = new Test();
    })(models = sails.models || (sails.models = {}));
})(sails || (sails = {}));
