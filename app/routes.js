module.exports = function(app, passport){
	/* HOME page*/
	app.get('/', function(req, res){
		res.render('index.ejs');
	});

	/* LOGIN */
	app.get('/login', function(req, res){
		res.render('login.ejs', {message: req.flash('loginMessage')});
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash: true
	}));

	/* SIGNUP */
	app.get('/signup', function(req, res){
		res.render('signup.ejs', {message: req.flash('signupMessage')});
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	/* HOME PAGE SECTION */
	// we want this protected, so you have to be logged in to visit
	// we will use route middleware to verify this (isLoggedIn())
	app.get('/home', isLoggedIn, function(req, res){
		res.render('home.ejs');
	});

	/* PROFILE SECTION */
	// we want this protected, so you have to be logged in to visit
	// we will use route middleware to verify this (isLoggedIn())
	app.get('/profile', isLoggedIn, function(req, res){
		res.render('profile-twads.ejs', {
			user: req.user // get the user from session and pass to template
		});
	});

	// /* FACEBOOK */
	// app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
	// app.get('/auth/facebook/callback', passport.authenticate('facebook', {
	// 	successRedirect: '/profile',
	// 	failureRedirect: '/'
	// }));

	/* TWITTER */
	app.get('/auth/twitter', passport.authorize('twitter',{scope: 'email'}));

	// callback after twitter has authenticated the user
	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));

	/* INSTAGRAM */
	app.get('/auth/instagram', passport.authenticate('instagram', {scope: 'basic'}));
	app.get('/auth/instagram/callback', passport.authenticate('instagram', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));

	// /* GOOGLE */
	// app.get('/auth/google', passport.authenticate('google', {profile: 'email'}));
	// app.get('/auth/google/callback', passport.authenticate('google', {
	// 	successRedirect: '/profile',
	// 	failureRedirect: '/'
	// }));

	/* LOGOUT */
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	/************************************************************************** 
		AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT)
	**************************************************************************/
	// locally
	app.get('/connect/local', function(req, res){
		res.render('connect-local.ejs', {message: req.flash('loginMessage')});
	});
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/connect/local',
		failureFlash: true
	}));

	// // facebook
	// app.get('/connect/facebook', passport.authorize('facebook',{scope: 'email'}));
	// app.get('/connect/facebook/callback', passport.authorize('facebook', {
	// 	successRedirect: '/profile',
	// 	failureRedirect: '/'
	// }));

	// twitter
	app.get('/connect/twitter', passport.authorize('twitter',{scope: 'email'}));
	app.get('/connect/twitter/callback', passport.authorize('twitter', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));

	// instagram
	app.get('/connect/instagram', passport.authorize('instagram',{scope: 'likes'}));
	app.get('/connect/instagram/callback', passport.authorize('instagram', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));

	// // google
	// app.get('/connect/google', passport.authorize('google',{scope: 'profile'}));
	// app.get('/connect/google/callback', passport.authorize('google', {
	// 	successRedirect: '/profile',
	// 	failureRedirect: '/'
	// }));

	/************************************************************************** 
		UNLINK ACCOUNTS
	**************************************************************************/
	// local
	app.get('/unlink/local', function(req, res){
		var user = req.user;
		user.local.email = undefined;
		user.local.password = undefined;
		user.save(function(err){
			res.redirect('/profile');
		});
	});

	// // facebook
	// app.get('/unlink/facebook', function(req, res){
	// 	var user = req.user;
	// 	user.facebook.token = undefined;
	// 	user.save(function(err){
	// 		res.redirect('/profile');
	// 	});
	// });

	// twitter
	app.get('/unlink/twitter', function(req, res){
		var user = req.user;
		user.twitter.token = undefined;
		user.save(function(err){
			res.redirect('/profile');
		});
	});

	// instagram
	app.get('/unlink/instagram', function(req, res){
		var user = req.user;
		user.instagram.token = undefined;
		user.save(function(err){
			res.redirect('/profile');
		});
	});

	// // google
	// app.get('/unlink/google', function(req, res){
	// 	var user = req.user;
	// 	user.google.token = undefined;
	// 	user.save(function(err){
	// 		res.redirect('/profile');
	// 	});
	// });
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated())
		return next();

	res.redirect('/');
}