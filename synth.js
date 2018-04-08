var audioContext = audioContext ? audioContext : new AudioContext;

const makeSynthInterface=(master)=>({
  waveSelector: makeSelector( "waveform", "sine", "triangle", "sawtooth", "square" ),
  masterADSR: makeADSR(),
  fader: simpleFader(),
  init(){
    setOwner(this.waveSelector, master);
    setOwner(this.adsr, master)
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
function doIt(array, callback){
    array.forEach(element=>callback(element))
};

const makeVoice =(instance="voice")=> ({
    instance: instance,
    osc: audioContext.createOscillator(),
    gain: audioContext.createGain(), //makeADSR(),
    trigger(){
        this.adsr.trigger();
    },
    release(){
        this.adsr.triggerRelease();
    },
    init(){
       // Environment[this.instance]=this;
      //  this.osc.disconnect();
     //   const interface = makeADSRinterface();
     //   document.body.appendChild(interface);
     console.log(this)
        this.osc.connect(this.gain);
        this.osc.start();
        this.osc.frequency.value= 120;
        console.log("voice initialized!", this);
    }
});

const makeSynth=(instance=defaultInstance("synth"))=>({
    instance: instance,
    masterVolume: audioContext.createGain(),
    adsr: makeADSR(),
    voices: voiceFactory(8),
    init(){
        this.adsr.init();
        this.interface= makeSynthInterface(this);
        this.interface.init();

        document.body.appendChild(this.interface);
    //    masterVolume.connect(audioContext.destination)
    console.log("synth init", this.voices[0]);
        Environment[this.instance]=this ;
        //setOwner(this.interface, this.instance);
    }
});


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



makeKeyboard(5);
var adsr=makeADSR(true);

adsr.init();

/*

const adsr=makeADSR(true);
adsr.init();

lfo.osc.connect(lfo.gain);
const carrier=audioContext.createOscillator();

carrier.connect(adsr.gain);
carrier.start();
lfo.gain.connect(carrier.frequency);

//synth=makeSynth();
//synth.init();
const voice=makeVoice();
voice.init();
Object.assign(voice, ADSRinterface);
voice.interface.init();

*/
//adsr.gain.connect(audioContext.destination)


function playNote(frequency) {
    console.log("playNote", frequency);
    voice.osc.frequency.value=frequency;
    voice.trigger();
   // synth.voices[0];
    //adsr.trigger();
}

function releaseNote(frequency){
   // synth.voices[0].release();
    //carrier.gain.setValueAtTime(0, audioContext.currentTime);
    //adsr.triggerRelease();
};