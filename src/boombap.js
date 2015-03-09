// Set up the dilla object
var Dilla = require('dilla');
var audioContext = new AudioContext();
var dilla = new Dilla(audioContext, {
  'tempo': 88,
  'loopLength': 1
});

// Display playback position
var position = document.getElementById('position');
function draw () {
  position.innerText = dilla.position();
  window.requestAnimationFrame(draw);
}
draw();

var sounds = {};
function loadSound (name, done) {
  var request = new XMLHttpRequest();
  request.open('GET', 'sounds/' + name + '.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function soundWasLoaded () {
    audioContext.decodeAudioData(request.response, function (buffer) {
      sounds[name] = buffer;
      done();
    });
  }

  request.send();
}

var soundNames = ['kick', 'snare', 'hihat'];

function loadNextSound () {
  var soundName = soundNames.shift();
  if (!soundName) return start();
  loadSound(soundName, loadNextSound);
}

loadNextSound();


function start () {
  dilla.start();
}

dilla.set('kick', [
  ['1.1.01'],
  ['1.1.51'],
  ['1.2.88'],
  ['2.1.01'],
  ['2.3.01']
]);

dilla.set('snare', [
  ['1.1.94'],
  ['1.3.94'],
  ['2.1.94'],
  ['2.3.94']
]);

dilla.set('hihat', [
  ['1.1.01'],
  // ['1.1.51'],
  ['1.2.01'],
  // ['1.2.49'],
  ['1.3.01'],
  // ['1.3.49'],
  ['1.4.01'],
  ['1.4.52'],
  ['2.1.01'],
  ['2.1.49'],
  ['2.2.01'],
  ['2.2.49'],
  ['2.3.01'],
  ['2.3.49'],
  ['2.4.01'],
  ['2.4.49']
]);

dilla.on('step', playSound);

var compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -10;
compressor.knee.value = 30;
compressor.ratio.value = 12;
compressor.reduction.value = -20;
compressor.attack.value = 0;
compressor.release.value = 0.25;
compressor.connect(audioContext.destination);

function playSound (step) {
  
  if (step.event === 'start') {
    var source = audioContext.createBufferSource();
    source.buffer = sounds[step.id];
    
    var gainNode = audioContext.createGain();
    // var gain = this.gain;
    // if (note.gain) gain = gain * note.gain;
    gainNode.gain.value = step.id === 'hihat' ? 0.7 : 1;
    source.connect(gainNode);
    gainNode.connect(compressor);

    // if (step.id === 'hihat') {
    // //   // source.connect(compressor);
    //   source.connect(bitcrushNode);
    //   bitcrushNode.connect(audioContext.destination);  
    // //   source.connect(audioContext.destination);
    // } else {
    // source.connect(audioContext.destination);
    // source.connect(compressor);
    // }
    

    // source.connect(audioContext.destination);
    // self.playingNote = note;  
    
    source.start(step.time);
  }
}