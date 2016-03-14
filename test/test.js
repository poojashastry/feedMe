var assert = require('assert');
var lib = require("../lib/feedme.js");
var credentials = require('../config/credentials.js');
var crypto = require('crypto');
var input, encryptResult, decryptResult;


/**
 * Test AES 256 Cookie Encryption
 */
describe('#encrypt()',function(){
	it('input should have same value as decrypt',function(){
		input = "sampleInput";
		encryptResult = lib.feedMe.encrypt(input);
		decryptResult = lib.feedMe.decrypt(encryptResult);
		assert.equal(input,decryptResult, "Decryption is not done correctly");
	});
});