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

var soundNames = [
  'kick', 'snare', 'hihat',
  'sound1', 'sound2', 'sound3', 'sound4',
  'pling', 'plong'
];

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
  ['2.3.51'],
  ['2.3.88']
]);

dilla.set('snare', [
  ['1.1.94'],
  ['1.3.94'],
  ['2.1.94'],
  ['2.4.03']
]);

dilla.set('hihat', [
  ['1.1.01'],
  ['1.2.01'],
  ['1.3.01'],
  ['1.4.01'],
  ['1.4.53'],
  ['2.1.01'],
  ['2.2.01'],
  ['2.3.01'],
  ['2.4.01'],
  ['2.4.53']
]);

dilla.set('sound1', [
  ['1.3.25', 88]
]);

dilla.set('sound2', [
  ['1.2.50', 70]
]);

dilla.set('sound4', [
  ['1.2.05', 45]
]);

dilla.set('pling', [
  ['1.1.01', 95],
  ['1.4.72', 24],
  ['2.3.25', 24]
]);

dilla.set('plong', [
  ['2.1.01', 95],
  ['2.1.48', 150],
  ['2.3.48', 150]
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

var sources = {};

function playSound (step) {
  
  if (step.event === 'start') {
    var source = audioContext.createBufferSource();
    source.buffer = sounds[step.id];
    
    var gainNode = audioContext.createGain();
    // var gain = this.gain;
    // if (note.gain) gain = gain * note.gain;
    gainNode.gain.value = step.id === 'kick' || step.id === 'snare' ? 1 : 0.7;
    source.connect(gainNode);
    gainNode.connect(compressor);
    // source.connect(audioContext.destination);

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

    sources[step.id + step.args[0]] = source;
    // console.log(step.id + step.args[0])
  }
  else if (step.event === 'stop') {
    var source = sources[step.id + step.args[0]];
    if (source) {
      sources[step.id + step.args[0]] = null;
      source.stop(step.time);
    }
  }
}