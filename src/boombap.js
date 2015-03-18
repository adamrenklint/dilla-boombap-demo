// Set up the dilla object
var Dilla = require('dilla');
var Context = window.AudioContext || window.webkitAudioContext;
var audioContext = new Context();
var dilla = new Dilla(audioContext, {
  'tempo': 88
});

// Display playback position
var position = document.getElementById('position');
var play = document.getElementById('play');
var stop = document.getElementById('stop');
function draw () {
  position.innerText = dilla.position();

  if (dilla.clock._state.playing) {
    play.className = 'control hidden';
    stop.className = 'control';
  }
  else {
    play.className = 'control';
    stop.className = 'control hidden';
  }
  window.requestAnimationFrame(draw);
}
play.addEventListener('click', dilla.start.bind(dilla));
stop.addEventListener('click', dilla.stop.bind(dilla));

// Object to hold our sound buffers
var sounds = {};

// Load a sound and make it playable buffer
function loadSound (name, done) {
  var request = new XMLHttpRequest();
  request.open('GET', 'sounds/' + name + '.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = function soundWasLoaded () {
    audioContext.decodeAudioData(request.response, function (buffer) {
      sounds[name] = buffer;
      done();
    });
  };
  request.send();
}

// The names of the sounds we'll be using
var soundNames = [
  'kick', 'snare', 'hihat',
  'plong1', 'plong2',
  'string1', 'string2', 'string3',
  'bass'
];

// Load all sounds, and then start the playback
function loadNextSound () {
  var soundName = soundNames.shift();
  if (!soundName) return start();
  loadSound(soundName, loadNextSound);
}

// Start playback and drawing the current position
function start () {
  var loading = document.getElementById('loading');
  loading.parentNode.removeChild(loading);
  draw();
  dilla.start();
}

// Add master compressor
var compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -15;
compressor.knee.value = 30;
compressor.ratio.value = 12;
compressor.reduction.value = -20;
compressor.attack.value = 0;
compressor.release.value = 0.25;

// Add master reverb
var Reverb = require('soundbank-reverb');
var reverb = Reverb(audioContext);
reverb.time = 1;
reverb.wet.value = 0.1;
reverb.dry.value = 1;
reverb.filterType = 'highpass';
reverb.cutoff.value = 1000; //Hz

// Connect them to our output
compressor.connect(reverb);
reverb.connect(audioContext.destination);

// The most important function, starts or stops a sound buffer
function onStep (step) {
  if (step.event === 'start') onStart(step);
  if (step.event === 'stop') onStop(step);
}

function onStart (step) {
  // Create source and assign the sound buffer
  var source = audioContext.createBufferSource();
  source.buffer = sounds[step.id];
  source.playbackRate.value = step.args.rate || 1;
  // Setup gain and save a reference to it
  var gainNode = source.gainNode = audioContext.createGain();
  gainVolume = step.args.gain || 1;
  // If not oneshot, small fade in attack
  if (step.args.duration) {
    source.gainNode.gain.setValueAtTime(0, step.time);
    source.gainNode.gain.linearRampToValueAtTime(gainVolume, step.time + 0.01);
  } else {
    gainNode.gain.value = gainVolume;
  }
  // Hook up the nodes and start playback
  source.connect(gainNode);
  gainNode.connect(compressor);
  source.start(step.time);
  // Save a reference for use in stop step event
  step.args.source = source;
}

function onStop (step) {
  var source = step.args.source;
  var gainVolume = step.args.gain || 1;
  // Small fade out release
  source.gainNode.gain.setValueAtTime(gainVolume, step.time);
  source.gainNode.gain.linearRampToValueAtTime(0, step.time + 0.01);
}

// Attach the onStep callback to the "step" event
dilla.on('step', onStep);

// The notes for our kick
dilla.set('kick', [
  ['1.1.01'],
  ['1.1.51', { 'gain': 0.8 }],
  ['1.2.88'],
  ['1.3.75'],
  ['1.4.72', { 'gain': 0.8 }],
  ['2.1.51', { 'gain': 0.7 }],
  ['2.3.51', { 'gain': 0.8 }],
  ['2.3.88']
]);

dilla.set('snare', [
  ['1.1.91'],
  ['1.3.91'],
  ['2.1.91'],
  ['2.4.03']
]);

dilla.set('hihat', [
  ['*.1.01', { 'gain': 0.7 }],
  ['*.2.01', { 'gain': 0.8 }],
  ['*.3.01', { 'gain': 0.7 }],
  ['*.4.01', { 'gain': 0.8 }],
  ['*.4.53', { 'gain': 0.6 }]
]);

dilla.set('plong1', [
  ['1.1.01', { 'duration': 95 }]
]);

dilla.set('plong2', [
  ['1.4.90', { 'duration': 60, 'gain': 0.4 }],
  ['2.1.52', { 'duration': 60, 'gain': 0.7 }]
]);

dilla.set('string1', [
  ['1.3.75', { 'duration': 90, 'gain': 0.6 }],
  ['1.4.52', { 'duration': 90, 'gain': 0.2 }],
  ['2.3.25', { 'duration': 70, 'gain': 0.6 }],
  ['2.4.01', { 'duration': 85, 'gain': 0.3 }],
  ['2.4.75', { 'duration': 85, 'gain': 0.1 }]
]);

dilla.set('string2', [
  ['2.2.50', { 'duration': 70, 'gain': 0.6 }]
]);

dilla.set('string3', [
  ['1.2.05', { 'duration': 45, 'gain': 0.6 }],
  ['1.2.51', { 'duration': 45, 'gain': 0.4 }],
  ['1.3.05', { 'duration': 45, 'gain': 0.2 }],
  ['1.3.51', { 'duration': 45, 'gain': 0.05 }],
  ['2.2.05', { 'duration': 45, 'gain': 0.6 }]
]);

dilla.set('bass', [
  ['1.1.01', { 'duration': 60, 'gain': 0.8, 'rate': 0.55 }],
  ['1.2.72', { 'duration': 15, 'gain': 0.5, 'rate': 0.55 }],
  ['1.3.02', { 'duration': 40, 'gain': 0.8, 'rate': 0.55 }],
  ['1.4.01', { 'duration': 40, 'gain': 0.6, 'rate': 0.64 }],
  ['1.4.51', { 'duration': 100, 'gain': 0.8, 'rate': 0.74 }],
  ['2.3.51', { 'duration': 60, 'gain': 0.8, 'rate': 0.46 }],
  ['2.4.51', { 'duration': 40, 'gain': 0.8, 'rate': 0.52 }]
]);

// Start loading the sounds, sets it all off
loadNextSound();
