# imgtvos

App to run imgur on Apple TV (tvOS) using TVML (Television Markup Language) and JavaScript.

## Running

In the client-server tvOS application, the JavaScript code is contained in the server your app connects to. For test purposes we will run a simple server on our development machine.

Open the Terminal app, enter the imgtv directory and start the Python-based web server:
$ python -m SimpleHTTPServer 9001

Go back to your Xcode project and build and run. You should be greeted with the tvOS TVML app.