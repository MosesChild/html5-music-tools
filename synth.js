var audioContext = audioContext ? audioContext : new AudioContext;

const makeSynthInterface=()=>({
  waveSelector: makeSelector( "waveform", "sine", "triangle", "sawtooth", "square" ),
  fader: simpleFader()
});

function doIt(array, callback){
    array.forEach(element=>callback(element))
};

const makeVoice =()=> ({
    osc: audioContext.createOscillator(),
    adsr: makeADSR(),
    note(frequency){
        this.osc.frequency.setValueAtTime(frequency,audioContext.currentTime);
        console.log("note", this.osc.frequency.value, frequency);
        this.adsr.trigger();
    },
    release(){
        this.adsr.triggerRelease();
    },
    init(){
        voice.osc.disconnect();
        voice.osc.connect(voice.adsr.gain);
        voice.osc.start();
        console.log("voice initialized!");
    }
});
const voiceFactory=(count)=>{
    const voices=[];
    for (let i=0; i<count; i++){
        voice=makeVoice();
        voice.init();
        voices.push(voice);
    }
    return voices;
}

function wrapChildren(...args){
    const wrapper=createElement('div');   
    args.forEach(component=>wrapper.appendChild(component));
    return wrapper;
}
function wrapInterface(interface){
    const wrapper=createElement('div'); 
    const args=Object.entries(interface);  
    args.forEach(component=>{
        wrapper.appendChild(component[1]);
    });
    return wrapper;
}

const makeSynth=(instance=defaultInstance("synth"))=>({
    masterVolume: audioContext.createGain(),
    interface: makeSynthInterface(),
    voices: voiceFactory(8),
    init(){
        // document.body.appendChild(wrapper);
    //    masterVolume.connect(audioContext.destination)
    console.log("synth init", this.voices[0]);
        Environment[this.instance]=this ;
        //setOwner(this.interface, this.instance);
    }
});

makeKeyboard(5);
const lfo=makeLFO();

lfo.init();
/*
const adsr=makeADSR();
adsr.init();

lfo.osc.connect(lfo.gain);
const carrier=audioContext.createOscillator();

carrier.connect(adsr.gain);
carrier.start();
lfo.gain.connect(carrier.frequency);
*/
synth=makeSynth();
synth.init();

//adsr.gain.connect(audioContext.destination)


function playNote(frequency) {
    console.log("playNote", frequency);
    synth.voices[0].note(frequency);
    //adsr.trigger();
}

function releaseNote(frequency){
    synth.voices[0].release();
    //carrier.gain.setValueAtTime(0, audioContext.currentTime)

    //adsr.triggerRelease();
}
