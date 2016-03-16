var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var credentials = require("../config/credentials.js");

var db = mongojs(credentials.connectionString,  ['users', 'feeds']);

exports.feedMe = {

	encrypt : function(input) {
		var cipher = crypto.createCipher(credentials.algorithm,credentials.secretPassword)
	  	var crypted = cipher.update(input,'utf8','hex')
	  	crypted += cipher.final('hex');
	  	return crypted;
	},

	decrypt : function(input) {
	  var decipher = crypto.createDecipher(credentials.algorithm,credentials.secretPassword)
	  var dec = decipher.update(input,'hex','utf8')
	  dec += decipher.final('utf8');
	  return dec;
	},

	login : function(req, res) {
		if(req.cookies.feedMe_username != undefined && req.cookies.feedMe_pwd != undefined){
			res.redirect('/myfeed');
		}
		else{
			res.render('login');
		}
	},

	myFeed : function(req, res) {
		if(req.cookies.feedMe_username === undefined || req.cookies.feedMe_pwd === undefined){
			res.render('login',{message:"Please login!"});
		} else{
			res.render('viewfeeds');
		}
	},

	deleteFeed : function(req, res) {
		var username = req.cookies.feedMe_username;
		var password = req.cookies.feedMe_pwd;
		var url = req.body['url'];
		var userLookup = { 
			name:username
		};
		db.feeds.find(userLookup,function(err,data){
			if(err){
				console.log(err);
			} else {
				if(data.length == 0){
					res.send("Something went wrong");
				} else{
					db.feeds.update({name: username},{ $pull : { feeds : { $in: [url] } } });
					res.send("Action Complete");
				}
			}
		});
	},

	logout : function(req, res) {
		res.clearCookie("feedMe_username");
		res.clearCookie("feedMe_pwd");
		res.redirect('/login');
	},

	getFeeds : function(req, res) {
		console.log(this);
		var username = req.cookies.feedMe_username;
		var pwd = decrypt(req.cookies.feedMe_pwd);
		var userLookup = {
			name:username
		};
		db.users.find(userLookup,function(err,data){
			if(err) {
				console.log(error);
			} else{
				if (data.length == 0){
					res.send({message:'User does not exist'});
				} else {
					var dbPassword = data[0].password;
					var message;
					bcrypt.compare(pwd,dbPassword, function(err, result) {
						if(err){
							console.log(err);
						} else {
							if (result == true) {
								var user = {
									name: username
								};
								db.feeds.find(user,function(err,data){
									if(err){
										res.send({message:"No feeds found"});
									} else {
										if(!data || data.length === 0) {
											res.send({message: "No feeds"});
											return;
										}
										if(data[0].feeds.length == 0){
											message = "No feeds found. Add feeds to get started!";
										} else{
											message = "Fetching feeds..";
										}
										var d = {
											dbFeeds: data[0],
											message:message
										};
										res.send(d);
									}
								});
							} else {
								res.redirect('/logout',{message:'Something went wrong. Try Logging in again'});
							}
						}	
					});
				}
			}
		});
	},

	saveFeeds : function(req, res) {
		var urls = req.body['feeds'];
		var user = {
			name: req.cookies.feedMe_username
		};
		if(!Array.isArray(urls)) {
			urls = new Array();
			urls[0] = req.body['feeds'];
		}
		var entry = {
			name: req.cookies.feedMe_username,
			feeds: urls
		};
		db.feeds.find(user,function(err,result){
			if(err){
				console.log(err);
			} else {
				if(result.length > 0){
					db.feeds.update(user,{ $addToSet: { feeds: { $each: urls } } });
					res.send({message:"Successfully Added Feeds"});
				} else{
					db.feeds.insert(entry);
					res.send({message:"Successfully Added user and Feeds"});
				}
			}
		});
	},

	loginUser : function(req, res) {
		var user = {};
		user.name = req.body.username;
		user.password = req.body.password;
		var userLookup = {
			name:user.name,
		};
		db.users.find(userLookup,function(err,data) {
			if(err){
				console.log(error);
			} else {
				if (data.length == 0) {
					res.render('login',{message:'User does not exist'});
				} else{
					var response = res;
					var dbPassword = data[0].password;
					bcrypt.compare(user.password,dbPassword, function(err, result) {
						if (err){
							console.log(err);
						} else{
							if (result == true) {
								console.log(this);
								res.cookie('feedMe_username',user.name);
								res.cookie('feedMe_pwd', encrypt(user.password));
								res.redirect('/myfeed');
							} else {
								res.render('login',{message:'Incorrect Password'});
							}
						}	
					});
				}
			}

		});
	},

	registerUser : function(req, res) {
		var user = {
			name : req.body.username,
			password : req.body.password,
			confirmpassword : req.body.confirmpassword,
		};
		if(user.name === "" || user.password === "" || user.confirmpassword === "") {
			res.render('register',{message: "All fields need to be filled"});
			return;
		}
		var searchUser = {
			name: user.name
		};
		if(user.password != user.confirmpassword) {
			res.render('register',{message: "Passwords must match"});
		} else {
			db.users.find(searchUser,function(err,result) {
				if (err) {
					console.log(err);
				} else {
					if (result.length == 0) {
						bcrypt.hash(user.password, null, null, function(err, hash) {
							// Store hash in your password DB.
							db.users.insert({name: user.name,password: hash});
						});
						res.redirect('login');
					} else {
						res.render('register',{message:'Username Exists'});
					}
				}
			});
		}
	}
};

var encrypt = this.feedMe.encrypt;
var decrypt = this.feedMe.decrypt;