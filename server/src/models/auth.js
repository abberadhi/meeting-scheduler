var passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var graph = require('./graph');
var fs = require('fs');
const resizeImg = require('resize-img');
const userModel = require('./database/user');

// Configure passport

// In-memory storage of logged-in users
// For demo purposes only, production apps should store
// this in a reliable storage
var users = {};

// Passport calls serializeUser and deserializeUser to
// manage users
passport.serializeUser(function(user, done) {
  // Use the OID property of the user as a key
  users[user.profile.oid] = user;
  done(null, user.profile.oid);
});

passport.deserializeUser(function(id, done) {
  done(null, users[id]);
});

// <ConfigureOAuth2Snippet>
// Configure simple-oauth2
const oauth2 = require('simple-oauth2').create({
  client: {
    id: process.env.OAUTH_APP_ID,
    secret: process.env.OAUTH_APP_PASSWORD
  },
  auth: {
    tokenHost: process.env.OAUTH_AUTHORITY,
    authorizePath: process.env.OAUTH_AUTHORIZE_ENDPOINT,
    tokenPath: process.env.OAUTH_TOKEN_ENDPOINT
  }
});


// Callback function called once the sign-in is complete
// and an access token has been obtained
// <SignInCompleteSnippet>
// TODO
// CHECK IF USER IS REGISTERED, OTHERWISE REGISTER THEM
async function signInComplete(iss, sub, profile, accessToken, refreshToken, params, done) {
  if (!profile.oid) {
    return done(new Error("No OID found in user profile."));
  }

  try{
    const data = await graph.getUserDetails(accessToken);

    
    const user = data['responses'][0]['body'];

    // If image exists, save it.
    const image = data['responses'][1];
    if (image.status == 200) {
      savePicture(user.id, image['body'])
    }

    if (user) {
      // Add properties to profile
      profile['email'] = user.mail ? user.mail : user.userPrincipalName;

      // add user to database if they don't exist
      if (!await userModel.userExists(user.id)) {
        await userModel.registerUser(user.id, user.displayName, profile['email']);
        console.log("User " + user.displayName + " created");
      }

    }
  } catch (err) {
    return done(err);
  }

  // Create a simple-oauth2 token from raw tokens
  let oauthToken = oauth2.accessToken.create(params);

  // Save the profile and tokens in user storage
  users[profile.oid] = { profile, oauthToken };
  return done(null, users[profile.oid]);
}

// Configure OIDC strategy
passport.use(new OIDCStrategy(
  {
    identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
    clientID: process.env.OAUTH_APP_ID,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: process.env.OAUTH_REDIRECT_URI,
    allowHttpForRedirectUrl: true,
    clientSecret: process.env.OAUTH_APP_PASSWORD,
    validateIssuer: false,
    passReqToCallback: false,
    scope: process.env.OAUTH_SCOPES.split(' ')
  },
  signInComplete
));

let savePicture = async (id, base64Image) => {
  const imageBufferData = Buffer.from(base64Image, `base64`)
  const image = await resizeImg(imageBufferData, {
    width: 64,
    height: 64
  });


  fs.writeFile(`../server/avatars/${id}.png`, image, function(err) {
    console.log('File created');
    console.log(err);
  });
};
