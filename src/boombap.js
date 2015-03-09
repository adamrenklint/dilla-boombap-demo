// Set up the dilla object
var Dilla = require('dilla');
var audioContext = new AudioContext();
var dilla = new Dilla(audioContext, {
  'tempo': 88
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
  ['1.1.49'],
  ['1.3.01'],
  ['2.1.01'],
  ['2.3.01']
]);

dilla.set('snare', [
  ['1.2.01'],
  ['1.4.01'],
  ['2.2.01'],
  ['2.4.01']
]);

dilla.set('hihat', [
  ['1.1.01'],
  ['1.1.49'],
  ['1.2.01'],
  ['1.2.49'],
  ['1.3.01'],
  ['1.3.49'],
  ['1.4.01'],
  ['1.4.49'],
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

function playSound (step) {
  
  if (step.event === 'start') {
    var source = audioContext.createBufferSource();
    source.buffer = sounds[step.id];
    // var gainNode = this.context.createGain();
    // var gain = this.gain;
    // if (note.gain) gain = gain * note.gain;
    // gainNode.gain.value = gain;
    // source.connect(gainNode);
    // gainNode.connect(this.destination);
    source.connect(audioContext.destination);
    // self.playingNote = note;  
    
    source.start(step.time);
  }
}