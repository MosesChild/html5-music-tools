var audioContext = audioContext ? audioContext : new AudioContext;

makeKeyboard(5);
const lfo=makeLFO();
lfo.init();

const adsr=makeADSR();
adsr.init();

lfo.osc.connect(lfo.gain);


const carrier=audioContext.createOscillator();

carrier.connect(adsr.gain);
carrier.start();
lfo.gain.connect(carrier.frequency);
adsr.gain.connect(audioContext.destination)


function playNote(target) {
    console.log(target.dataset.frequency, carrier)
  carrier.frequency.setValueAtTime(target.dataset.frequency, audioContext.currentTime);
  adsr.trigger();

}
function releaseNote(target){
    carrier.gain.setValueAtTime(0, audioContext.currentTime)
    adsr.triggerRelease();

}