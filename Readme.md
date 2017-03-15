# imgtvos

App to run imgur on Apple TV (tvOS) using TVML (Television Markup Language) and JavaScript.

## Running

### API Keys

You need to register the app for API keys: http://api.imgur.com/#register.

Add the client_id to OAUTH_CONSUMER_KEY variable in js/imgur.js.

In the client-server tvOS application, the JavaScript code is contained in the server your app connects to. For test purposes we will run a simple server on our development machine.

Open the Terminal app, enter the imgtv directory and start the Python-based web server:
$ python -m SimpleHTTPServer 9001

Go back to your Xcode project and build and run. You should be greeted with the tvOS TVML app.