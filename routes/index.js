var base64url = require('b64url');
var crypto = require('crypto');
var querystring = require('querystring');
var request = require('request');

var config = require('../config');

var facebook_app_id = config.get("FACEBOOK_APP_ID");
var facebook_app_secret = config.get("FACEBOOK_APP_SECRET");
var facebook_app_namespace = config.get("FACEBOOK_APP_NAMESPACE");

function parse_signed_request(signed_request, secret) {
    encoded_data = signed_request.split('.',2);
    // decode the data
    sig = encoded_data[0];
    json = base64url.decode(encoded_data[1]);
    data = JSON.parse(json); // ERROR Occurs Here!

    // check algorithm - not relevant to error
    if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
        console.error('Unknown algorithm. Expected HMAC-SHA256');
        return null;
    }

    //// check sig - not relevant to error
    if (secret)
    {
        expected_sig = crypto.createHmac('sha256',secret).update(encoded_data[1]).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace('=','');
        if (sig !== expected_sig) {
            console.error('Bad signed JSON Signature!');
            return null;
        }
    }

    return data;
}

function check_auth(req, callback)
{
  //callback is called with an oauth token as the only parameter
  //if no oauth token is available, it is called without parameters

  var oauth_token = "";
  if (req.body.signed_request)
  {
    //parse signed_request token sent by facebook to verify the user
    //has authorized our app
    var signed_request = parse_signed_request(req.body.signed_request);
    oauth_token = signed_request.oauth_token;
    callback(oauth_token);
  }
  else if (req.query["code"])
  {
    // if we don't have a signed request, but an auth code, verify it
    // and trade it for an access token
    var code = req.query["code"];
    var qs = querystring.stringify({
      client_id: facebook_app_id,
      redirect_uri: "https://apps.facebook.com/" + facebook_app_namespace,
      client_secret: facebook_app_secret,
      code: code
    });
	  var graph_url = "https://graph.facebook.com/oauth/access_token?" + qs;
    var client = request(graph_url, function (error, response, body)
    {
      fbresponse = querystring.parse(body);
      callback(fbresponse["access_token"]);
    });
  }
  else
  {
    //callback without oauth token
    callback()
  }
}

exports.index = function(req, res) {
  check_auth(req, function (oauth_token) {
    if (oauth_token)
    {
      //render webplayer
      res.render('index', { 
        title: 'Vostopia Facebook Integration',
        webplayer_url: '/unity/webplayer.unity3d',
        webplayer_width: 640,
        webplayer_height: 480,
    
        oauth_token: oauth_token
      });
    }
    else
    {
      // user is either not logged in or not authorized, redirect user to fb oauth url.   
      var qs = querystring.stringify({
          client_id: facebook_app_id,
          redirect_uri: "https://apps.facebook.com/" + facebook_app_namespace,
          scope: "email"
      });
      var oauth_url = 'https://www.facebook.com/dialog/oauth/?' + qs;
      
      res.render('unauthorized', {
        oauth_url: oauth_url
      })
    }
  });
};
