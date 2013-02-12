Vostopia Facebook Integration
=============================

Example node.js app for using the vostopia avatar/shop system in a 
Facebook Canvas application. 

In a Nutshell
-------------

In order to automatically sign in vostopia users on facebook, the vostopia
api needs an oauth token for the logged in facebook user. This is passed to the 
vostopia api by implementing a javascript method called GetVostopiaParameters in 
the web surround, that sends the oauth back to a specified GameObject in Unity.

    <script type="text/javascript">
        function GetVostopiaParameters(obj, meth)
        {
            var unity = GetUnity();
            var params = {
                auth: {
                    method: "facebook",
                    oauthToken: "[facebook oauth token]"
                }
            };
            unity.SendMessage(obj, meth, JSON.stringify(params));
        }
    </script>

On a canvas app, the oauthToken is included in the signed_request that is 
POSTed to your canvas app url. 


Getting started with Heroku
---------------------------

The simplest way of getting the example running is by deploying it to 
heroku. 

Before we start, make sure you have the heroku toolbelt installed and configured 
(https://toolbelt.heroku.com/)

Get the vostopia facebook integration project from github
> git clone https://github.com/kvantetore/vostopia-facebook.git

Then, in the vostopia-facebook folder, create a heroku app. 
    $ heroku apps:create
    Creating vostopia-facebook... done, stack is cedar
    http://vostopia-facebook.herokuapp.com/ | git@heroku.com:vostopia-facebook.git
    Git remote heroku added
Heroku will generate a unique app name and url for your app.

Push the vostopia-facebook app to heroku
    git push heroku master

When the app has started, you can visit the app on https://[your-app-name].herokuapp.com.
The app relies on being hosted inside a facebook canvas, so navigating to your app will return a
"No Facebook Authentication Detected" error message.


Set Up Facebook App
-------------------

With the example app running on heroku, It's now time to set up a facebook canvas app to point to it.

Create a new facebook app on https://developers.facebook.com/apps/.

Enable "App on Facebook", and set the "Secure Canvas Url" to https://[your-app-name].herokuapp.com. 
Note the https. Facebook canvas apps works best when they are served over https, and it will be required
by October 1.

After you have created the facebook app, update your environment variables, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET,
and FACEBOOK_APP_NAMESPACE with the corresponding values. 
    $ heroku config:set FACEBOOK_APP_ID=[your-facebook-app-id]
    $ heroku config:set FACEBOOK_APP_SECRET=[your-facebook-secret] 
    $ heroku config:set FACEBOOK_APP_NAMESPACE=[your-facebook-namespace]

To enable purchasing virtual currency with Facebook Credits, you must complete the company information, 
and set the "Payments Callback URL" to the vostopia server.

For the production server, the url is
   https://vostopia.com/en/[your-vostopia-gameId]/accounts/facebookCreditsCallback


Set Up Unity Project
--------------------

Make sure you have a VostopiaApiController in your scene. On the VostopiaApiController.ShopSettings set
PaymentProvider to FACEBOOK, and set the Facebook App Id to the facebook app id created above. 

This allows vostopia authentication to initialize the facebook javascript sdk in order to enable
facebook payments.

As long as you are in the editor, the vostopia authentication dialog will still appear, but in the webplayer
on facebook, it is able to take advantage of the GetVostopiaParameters function to automatically log the
facebook user in.

To see it live, build your project as a webplayer and replace "public/unity/webplayer.unity3d" with the built binary.
Commit and push to heroku to update the live version

    git commit public/unity/webplayer.unity3d -m "Updated webplayer"
    git push heroku master

Your facebook canvas app should now automatically sign in your vostopia user. For facebook users without 
a prior vostopia user, a new one will be created transparently.
