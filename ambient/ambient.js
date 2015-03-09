var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['A']);
var Neopixels = require('neopixels');
var art = require('./index.js')
var neopixels = new Neopixels();
var s = art.init(neopixels, 8, 8);

s.setPixel(0, 1, {x:0, y:1, r:10, g:10, b:200});
s.setPixel(0, 1, {x:0, y:1, r:200, g:0, b:0, o:0.3});
s.hLine({x:1, y:2, l:5, r:10, g:90, b:10, o:0.9});
s.vLine({x:2, y:4, l:-4, r:10, g:15, b:150, o:0.3});

var turn = false;
var inter = 200;


ambient.on('ready', function () {



  setInterval( function () {

    var f = 0.02;

    ambient.getLightLevel( function(err, ldata) {
      if (err) throw err;
      ambient.getSoundLevel( function(err, sdata) {
        if (err) throw err;
        //console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));

        f = parseInt(parseFloat(sdata.toFixed(8)) * 100);

          console.log(sdata.toFixed(8));

        //track frequency levels

        //trigger somehting is reached do something else

        
          
        //console.log(Math.pow(f, 10));
        f = Math.pow(f, 10);

//Math.pow(f, 10)

          var op = {
            x:Math.floor(Math.random() * 8),
            y:Math.floor(Math.random() * 8),
            l:Math.floor(2 + Math.random() * 6),
            r:Math.random() * 40 + 3,
            g:Math.random() * 40 + 3,
            b:Math.random() * 40 + 3,
            o:Math.random()
          };
          s.fade({percent:f});
          if (turn) {
            s.hLine(op);
          } else {
            s.vLine(op);
          }
          turn = !turn;
          s.render();




        inter = f * 100;

       // console.log(inter);
    });
  });





  }, inter);

});





ambient.on('error', function (err) {
  console.log(err)
});