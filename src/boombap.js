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
  'plong1', 'plong2',
  'bass'
];

function loadNextSound () {
  var soundName = soundNames.shift();
  if (!soundName) return start();
  loadSound(soundName, loadNextSound);
}

function start () {
  var loading = document.getElementById('loading');
  loading.parentNode.removeChild(loading);
  dilla.start();
}

dilla.on('step', playSound);

// master compressor
var compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -15;
compressor.knee.value = 30;
compressor.ratio.value = 12;
compressor.reduction.value = -20;
compressor.attack.value = 0;
compressor.release.value = 0.25;

// master reverb
var Reverb = require('soundbank-reverb')
var reverb = Reverb(audioContext)
reverb.time = 1;
reverb.wet.value = 0.1;
reverb.dry.value = 1;
reverb.filterType = 'highpass'
reverb.cutoff.value = 1000 //Hz
reverb.connect(audioContext.destination);

compressor.connect(reverb);

var sources = {};

function playSound (step) {

  if (step.event === 'start') {
    var source = audioContext.createBufferSource();
    source.buffer = sounds[step.id];
    source.playbackRate.value = step.args[3] || 1;

    var gainNode = audioContext.createGain();
    gainNode.gain.value = step.args[2] || 1;
    source.connect(gainNode);
    gainNode.connect(compressor);

    source.start(step.time);
    sources[step.id + step.args[0]] = source;
  }
  else if (step.event === 'stop') {
    var source = sources[step.id + step.args[0]];
    if (source) {
      sources[step.id + step.args[0]] = null;
      source.stop(step.time);
    }
  }
}

dilla.set('kick', [
  ['1.1.01'],
  ['1.1.51', null, 0.8],
  ['1.2.88'],
  ['1.3.75'],
  ['1.4.72', null, 0.7],
  ['2.1.51', null, 0.7],
  ['2.3.51', null, 0.8],
  ['2.3.88']
]);

dilla.set('bass', [
  ['1.1.01', 60, 1, 0.55],
  ['1.2.72', 15, 0.7, 0.55],
  ['1.3.02', 40, 1, 0.55],
  ['1.4.01', 40, 0.8, 0.64],
  ['1.4.51', 100, 1, 0.74],
  ['2.3.51', 60, 1, 0.46],
  ['2.4.51', 40, 1, 0.52]
]);

dilla.set('snare', [
  ['1.1.94'],
  ['1.3.94'],
  ['2.1.94'],
  ['2.4.03']
]);

dilla.set('hihat', [
  ['1.1.01', null, 0.7],
  ['1.2.01', null, 0.8],
  ['1.3.01', null, 0.7],
  ['1.4.01', null, 0.8],
  ['1.4.53', null, 0.6],
  ['2.1.01', null, 0.7],
  ['2.2.01', null, 0.8],
  ['2.3.01', null, 0.7],
  ['2.4.01', null, 0.8],
  ['2.4.53', null, 0.5]
]);

dilla.set('sound1', [
  ['1.3.75', 90, 0.6],
  ['1.4.52', 90, 0.2],
  ['2.3.25', 70, 0.6],
  ['2.4.01', 85, 0.3],
  ['2.4.75', 85, 0.1]
]);

dilla.set('sound2', [
  ['2.2.50', 70, 0.6]
]);

dilla.set('sound4', [
  ['1.2.05', 45, 0.6],
  ['1.2.51', 45, 0.4],
  ['1.3.05', 45, 0.2],
  ['1.3.51', 45, 0.05],
  ['2.2.05', 45, 0.6]
]);

dilla.set('plong1', [
  ['1.1.01', 95]
]);

dilla.set('plong2', [
  ['1.4.90', 60, 0.4],
  ['2.1.52', 60, 0.7]
]);

loadNextSound();