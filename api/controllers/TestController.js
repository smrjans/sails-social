/// <reference path="../../typings/tsd.d.ts" />
/**
 * TestController
 *
 * @description :: Server-side logic for managing Tests
 * @help 		:: See http://links.sailsjs.org/docs/controllers
 */
export class TestController {
    index(req, res) {
        res.status(200).send('OK1');
    }
}
module.exports = new TestController();
