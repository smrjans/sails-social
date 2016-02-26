/// <reference path="../../typings/tsd.d.ts" />
/**
 * TestController
 *
 * @description :: Server-side logic for managing Tests
 * @help 		:: See http://links.sailsjs.org/docs/controllers
 */
var TestController = (function () {
    function TestController() {
    }
    TestController.prototype.index = function (req, res) {
        res.status(200).send('OK1');
    };
    return TestController;
})();
exports.TestController = TestController;
module.exports = new TestController();
