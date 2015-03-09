// Foundational.
var tessel = require('tessel');

// Tessel wifi
var wifi = require('wifi-cc3000');

// Tessel LED library
var led = require('tessel-led');

// To be able to listen.  And eventually hit another site.
var http = require('http');
var url = require('url');  //I'd like to use this...but req.url is undefined.

// Initialise. **********************************************************************
var server; 

var connected = false;                       // Indicates whether we're connected to Wifi; start by assuming No
var seconds = 30;                            // How long to wait before trying to start HTTP
var network = 'Online2G';                      // SSID
var pass = 'carrot2g';                       // Wifi Password
var security = 'wpa2';                       // Wifi Security mode

// reset the wifi chip just so we don't start in a weird state from any last running code
wifi.reset(function(){
    setTimeout(function(){
        if (!wifi.isConnected()) {
            console.log("not connecting after reset");
            // if its not connected, it could be in the middle of a retry attempt
            // first disconnect then on `disconnect` event we will retry connect
            wifi.disconnect();
        }
    }, 20*1000); 
});

// Startup stuff.  ******************************************************************
console.log('Starting up...');
led.green.flash(seconds * 4 - 1, 125, 125);   // Handy to know it is now running (when code is pushed)

// Wifi event handlers **************************************************************
wifi.on('connect', function (res) {
    console.log('Wifi is now on.', res);
    setTimeout(function(){
        httpListen();
    }, 1000);
});

wifi.on('disconnect', function (res) {
    console.log('Disconnected!');
    led.blue.hide();
    // close the server
    if (server) {
        server.close(function(){
            wifiConnect();
        });
    } else {
        wifiConnect();
    }
    
});

wifi.on('timeout', function(res){
    console.log("timed out");
    led.blue.hide();
    // try to reconnect
    wifiConnect();
});

wifi.on('error', function(res){
    led.blue.hide();
    console.log("wifi error", res);
});


// Just tell me that it did its thing. ***********************************************
/*
relay.on('latch', function(channel, value) {
  console.log('latch on relay channel ' + channel + ' switched to', value);
});
*/

// Initiates the HTTP server listening. **********************************************
function httpListen()
{
    console.log('Listening...');
    led.blue.show();
    
    server = http.createServer();
    server.listen(80);

    // HTTP server event handler ********************************************************
    server.on('request', function (req, res) {
        console.log('HTTP GET received...responding...');
        res.writeHead( 200, {'Content-Type': 'text/plain'} );
        console.log('req.url=' + req.url);
        console.log(url.parse(req.url, true).query["action"]);
        console.log('Flipping on and off...');
        console.log('Relay work initiated...');
        res.end('Toggled off/on!');
    });

    server.on('error', function(){
        server.close(function(){
            wifi.reset();
        });
    })
}

// Real Wifi connect attempt *********************************************************
function wifiConnect(){
    console.log('Connecting to Wifi...');
    wifi.connect({
        security: security
        , ssid: network
        , password: pass
        , timeout: 30 // in seconds
    });
}
