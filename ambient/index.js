// Maps ambient sound levels to spectrum output on neopixel LEDs.
// Calibrate to the max ambient level with soundMax:
'use strict';

// require modules
var tessel      = require('tessel');
var ambientlib  = require('ambient-attx4');
var Neopixels   = require('neopixels');

// Tessel wifi
var wifi        = require('wifi-cc3000');
var led         = require('tessel-led');
var http        = require('http');
var url         = require('url'); 

// initializing modules
var ambient     = ambientlib.use(tessel.port['A']);
var neopixels   = new Neopixels();

// setting constants
var soundMax    = 0.200;
var soundMin    = 0.035;
var leds        = 60;
var threshold   = 0.01;
var color       = 
                {
                  off: [0x00, 0x00, 0x00],
                  green: [0xFF, 0x00, 0x00],
                  red: [0x00, 0xFF, 0x00],
                  blue: [0x00, 0x00, 0xFF],
                  purple: [0x00, 0xFF, 0xFF],
                  yellow: [0xFF, 0xFF, 0x00],
                  cyan: [0xFF, 0x00, 0xFF]
                };

var flag      = false;



//connect online

// Initialise. **********************************************************************
var server; 
var connected = false;                       // Indicates whether we're connected to Wifi; start by assuming No
var seconds   = 30;                            // How long to wait before trying to start HTTP
var network   = 'Online2G';                      // SSID
var pass      = 'carrot2g';                       // Wifi Password
var security  = 'wpa2';                       // Wifi Security mode

// when ready
ambient.on('ready', function () {
  // ready animation for fun
  neopixels.animate( leds, Buffer.concat(tracer(leds)) );

  //color.green //color.red //color.cyan
  //pulse(leds, color.red, color.off);

  ambient.setSoundTrigger(threshold);
  console.log("ambient is ready");
  ambient.on('sound-trigger', function(data) {

  neopixels.animate( leds, Buffer.concat(setAll(leds, convertColor(data))) );

  });

});



// error logging
ambient.on('error', function (err) {
  console.log(err);
});

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




function convertColor (decimal) {
  var halfway = (soundMax + soundMin) / 2;
  var output = [0x00, 0x00, 0x00]; // GRB off
  decimal = decimal > soundMax ? soundMax : decimal;
  if ( decimal === halfway ) {
    output[0] = 0xFF; // G
    console.log("sound was tripped here 1");
  } else if ( decimal > halfway ) {
    output[1] = (decimal-halfway)/(halfway) * 0xFF; // R
    output[0] = 0xFF - output[1]; // G
    console.log("sound was tripped here 2");
  } else if (decimal > soundMin ) {
    output[0] = decimal / halfway * 0xFF; // G
    output[2] = 0xFF - output[0]; // B
    console.log("sound was tripped here 3");
  }
  return output;
}



// set leds to color
function setAll (numLEDs, color) {
  var buf = new Buffer(numLEDs * 3);
  for (var i = 0; i < buf.length; i += 3) {
    buf[i] = color[0];
    buf[i+1] = color[1];
    buf[i+2] = color[2];
  }
  return [buf];
}



// An example animation
function tracer(numLEDs) {
  var trail = 5;
  var arr = new Array(numLEDs);
  for (var i = 0; i < numLEDs; i++) 
  {
    var buf = new Buffer(numLEDs * 3);
    buf.fill(0);
    for (var col = 0; col < 3; col++)
    {
      for (var k = 0; k < trail; k++) 
      {
        buf[(3*(i+numLEDs*col/3)+col+1 +3*k)] = 0xFF*(trail-k)/trail;
      }
    }
    arr[i] = buf;
  }
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
  }
  return newArr;
}



function pulse(numLEDs, color1, color2){

    console.log("starting pulsing");

    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color1)) );
      }, 1000
    );
    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color2)) );
      }, 1500
    );

    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color1)) );
      }, 2000
    );
    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color2)) );
      }, 2500
    );

    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color1)) );
      }, 3000
    );
    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color2)) );
      }, 3500
    );

    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color1)) );
      }, 4000
    );
    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color2)) );
      }, 4500
    );

    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color1)) );
      }, 5000
    );
    setTimeout(
      function(){
        neopixels.animate( numLEDs, Buffer.concat(setAll(numLEDs, color2)) );
      }, 5500
    );
}


// Initiates the HTTP server listening. **********************************************
function httpListen()
{
    led.blue.show();
    server = http.createServer();
    server.listen(80);

    // HTTP server event handler ********************************************************
    server.on('request', function (req, res) {

        led.blue.hide();
        led.red.show();
        setTimeout(function(){
          led.red.hide();
        }, 5000);


        console.log("http called");
        pulse(leds, color.red, color.off);
        ambient.clearSoundTrigger();
        setTimeout(function(){
          console.log("return to sound trigger");
          led.blue.hide();
          led.blue.show();
          ambient.setSoundTrigger(threshold);
        }, 6000);
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


