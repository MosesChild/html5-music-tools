var audioContext = audioContext ? audioContext : new AudioContext;

function makeSynthInterface(){
    const wrapper=createElement('div');
    makeSelector( "waveform", "sine", "triangle", "sawtooth", "square" );
}


const voiceFactory=(objects, count)=>{
    const voices=[];
    const masterVolume=audioContext.createGain();
    for (let i=0; i<count; i++){
        const voice = audioContext.createOscillator();
        const adsr = makeADSR();
        voice.connect(adsr.gain);
    }
}

const makeSynth=()=>({
    instance: defaultInstance("synth"),
    interface: makeSynthInterface(),
    voices: new Array(8).forEach(element => makeVoice("sine")),
    init(){
        Environment[this.instance]=this; 
        //setOwner(this.interface, this.instance);
    }
});

makeKeyboard(5);
const lfo=makeLFO();
lfo.init();

const adsr=makeADSR();
adsr.init();
/*
lfo.osc.connect(lfo.gain);


const carrier=audioContext.createOscillator();

carrier.connect(adsr.gain);
carrier.start();
lfo.gain.connect(carrier.frequency);
*/
synth=makeSynth();
synth.init();

adsr.gain.connect(audioContext.destination)


function playNote(frequency) {
    console.log(frequency);
    carrier.frequency.setValueAtTime(frequency, audioContext.currentTime);
    adsr.trigger();
}

function releaseNote(frequency){
    //carrier.gain.setValueAtTime(0, audioContext.currentTime)
    console.log()
    adsr.triggerRelease();
}
