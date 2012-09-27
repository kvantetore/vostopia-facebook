var base64url = require('b64url');
var crypto = require('crypto');

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

exports.index = function(req, res) {
  //parse signed_request token sent by facebook to verify the user
  //has authorized our app
  var authorized = false;
  var signed_request = {};
  if (req.body.signed_request)
  {
    signed_request = parse_signed_request(req.body.signed_request);
    if (signed_request.oauth_token)
    {
        authorized = true;
    }
  }

  if (authorized)
  {
    //render webplayer
    res.render('index', { 
      title: 'Vostopia Facebook Integration',
      webplayer_url: '/unity/webplayer.unity3d',
      webplayer_width: 640,
      webplayer_height: 480,
  
      signed_request: signed_request
    });
  }
  else
  {
    //render an unauthorized screen
    res.render('unauthorized', {
      title: 'Unauthorized'
    })
  }
};
