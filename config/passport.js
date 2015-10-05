var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../app/models/user');

var configAuth = require('./auth');

module.exports = function(passport){

	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

	/* LOCAL SIGNUP */
	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password. We will override with email
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		// asynchronous. User.findOne won't fire unless data is sent back
		process.nextTick(function(){
			User.findOne({'local.email': email}, function(err, user){
				if(err)
					return done(err);
				if(user){
					return done(null, false, req.flash('signupMessage', 'There already exists a user with that email address. Please use a different one.'))
				}else{
					var newUser = new User();
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);
					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}));

	/* LOCAL LOGIN */
	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password. We will override with email
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		// asynchronous. User.findOne won't fire unless data is sent back
		process.nextTick(function(){
			User.findOne({'local.email': email}, function(err, user){
				if(err)
					return done(err);
				if(!user){
					return done(null, false, req.flash('loginMessage', 'No user found.'));
				}
				if(!user.isValidPassword(password))
					return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

				return done(null, user);
			});
		});
	}));

	// /* FACEBOOK */
	// passport.use(new FacebookStrategy({
	// 	clientID: configAuth.facebookAuth.clientID,
	// 	clientSecret: configAuth.facebookAuth.clientSecret,
	// 	callbackURL: configAuth.facebookAuth.callbackURL,
	// 	passReqToCallback: true
	// },
	// // FB will send back the token and profile
	// function(req, token, refreshToken, profile, done){
	// 	// asynchronous
	// 	process.nextTick(function() {
	// 		if(!req.user){
	// 			User.findOne({'facebook.id': profile.id}, function(err, user){
	// 				if(err)
	// 					return done(err);
	// 				if(user){
	// 					// if there is a user id, but no token (user left but wants to come back)
	// 					if(!user.facebook.token){
	// 						user.facebook.token = token;
	// 						user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	// 						user.facebook.email = profile.emails[0].value;

	// 						user.save(function(err){
	// 							if(err)
	// 								throw err;
	// 							return done(null, user);
	// 						});
	// 					}

	// 					return done(null, user);
	// 				}else{
	// 					var newUser = new User();
	// 					newUser.facebook.id = profile.id;
	// 					newUser.facebook.token = token;
	// 					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	// 					newUser.facebook.email = profile.emails[0].value;

	// 					newUser.save(function(err){
	// 						if(err)
	// 							throw err;
	// 						return done(null, newUser);
	// 					});
	// 				}
	// 			});
	// 		}else{
	// 			// user already exists and is logged in, we have to link accounts
	// 			var user = req.user;

	// 			user.facebook.id = profile.id;
	// 			user.facebook.token = token;
	// 			user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	// 			user.facebook.email = profile.emails[0].value;

	// 			user.save(function(err){
	// 				if(err)
	// 					throw err;
	// 				return done(null,user);
	// 			});
	// 		}
	// 	});
	// }));

	/* TWITTER */
	passport.use(new TwitterStrategy({
		consumerKey: configAuth.twitterAuth.consumerKey,
		consumerSecret: configAuth.twitterAuth.consumerSecret,
		callbackURL: configAuth.twitterAuth.callbackURL,
		passReqToCallback: true
	},
	function(req, token, refreshToken, profile, done){
		
		// asynchronous
		process.nextTick(function() {
			
			if(!req.user){
				
				User.findOne({'twitter.id': profile.id}, function(err, user){
					
					if(err)
						return done(err);
					
					if(user){
						
						// if there is a user id, but no token (user left but wants to come back)
						if(!user.twitter.token){
							user.twitter.token = token;
							user.twitter.username = profile.username;
							user.twitter.displayName = profile.displayName;

							user.save(function(err){
								if(err)
									throw err;
								return done(null, user);
							});
						}
					
						return done(null, user);
					
					}else{
						
						var newUser = new User();
						newUser.twitter.id = profile.id;
						newUser.twitter.token = token;
						newUser.twitter.username = profile.username;
						newUser.twitter.displayName = profile.displayName;

						newUser.save(function(err){
							if(err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			
			}else{
				
				// user already exists and is logged in, we have to link accounts
				var user = req.user;

				// update user credentials
				user.twitter.id = profile.id;
				user.twitter.token = token;
				user.twitter.username = profile.username;
				user.twitter.displayName = profile.displayName;

				user.save(function(err){
					if(err)
						throw err;
					return done(null,user);
				});
			}
		});
	}));

	/* INSTAGRAM */
	passport.use(new InstagramStrategy({
		clientID: configAuth.instagramAuth.clientID,
		clientSecret: configAuth.instagramAuth.clientSecret,
		callbackURL: configAuth.instagramAuth.callbackURL,
		passReqToCallback: true
	},
	function(req, token, refreshToken, profile, done){
		// asynchronous
		process.nextTick(function() {
			if(!req.user){
				User.findOne({'instagram.id': profile.id}, function(err, user){
					if(err)
						return done(err);
					if(user){
						// if there is a user id, but no token (user left but wants to come back)
						if(!user.instagram.token){
							user.instagram.token = token;
							user.instagram.username = profile.username;
							user.instagram.displayName = profile.displayName;

							user.save(function(err){
								if(err)
									throw err;
								return done(null, user);
							});
						}
						return done(null, user);
					}else{
						var newUser = new User();
						newUser.instagram.id = profile.id;
						newUser.instagram.token = token;
						newUser.instagram.username = profile.username;
						newUser.instagram.displayName = profile.displayName;

						newUser.save(function(err){
							if(err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			}else{
				// user already exists and is logged in, we have to link accounts
				var user = req.user;

				user.instagram.id = profile.id;
				user.instagram.token = token;
				user.instagram.username = profile.username;
				user.instagram.displayName = profile.displayName;

				user.save(function(err){
					if(err)
						throw err;
					return done(null,user);
				});
			}
		});
	}));

	// /* GOOGLE */
	// passport.use(new GoogleStrategy({
	// 	clientID: configAuth.googleAuth.clientID,
	// 	clientSecret: configAuth.googleAuth.clientSecret,
	// 	callbackURL: configAuth.googleAuth.callbackURL,
	// 	passReqToCallback: true
	// },
	// function(req, token, refreshToken, profile, done){
	// 	// asynchronous
	// 	process.nextTick(function() {
	// 		if(!req.user){
	// 			User.findOne({'google.id': profile.id}, function(err, user){
	// 				if(err)
	// 					return done(err);
	// 				if(user){
	// 					// if there is a user id, but no token (user left but wants to come back)
	// 					if(!user.google.token){
	// 						user.google.token = token;
	// 						user.google.name = profile.displayName;
	// 						user.google.email = profile.emails[0].value;

	// 						user.save(function(err){
	// 							if(err)
	// 								throw err;
	// 							return done(null, user);
	// 						});
	// 					}
	// 					return done(null, user);
	// 				}else{
	// 					var newUser = new User();
	// 					newUser.google.id = profile.id;
	// 					newUser.google.token = token;
	// 					newUser.google.name = profile.displayName;
	// 					newUser.google.email = profile.emails[0].value;

	// 					newUser.save(function(err){
	// 						if(err)
	// 							throw err;
	// 						return done(null, newUser);
	// 					});
	// 				}
	// 			});
	// 		}else{
	// 			// user already exists and is logged in, we have to link accounts
	// 			var user = req.user;

	// 			user.google.id = profile.id;
	// 			user.google.token = token;
	// 			user.google.name = profile.displayName;
	// 			user.google.email = profile.emails[0].value;

	// 			user.save(function(err){
	// 				if(err)
	// 					throw err;
	// 				return done(null,user);
	// 			});
	// 		}
	// 	});
	// }));
}