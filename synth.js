
var audioContext = audioContext ? audioContext : new AudioContext;
/*
const makeSynthInterface=(master)=>({
  waveSelector: makeSelector( "waveform", "sine", "triangle", "sawtooth", "square" ),
  masterADSR: makeADSR,
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
*/
const ConstantSource=(instance="constantSource")=>{
    const constantSource = audioContext.createConstantSource();
    const source= {
    component: "constantSource",
    instance: defaultInstance(instance),
    output: constantSource,
    set input(e){this.output.offset.value=e}
    }
    constantSource.start();
    return source;
  //  Environment[source.component][source.instance]=source;
};

const makeSources=(object)=>{
    const sources={};
    const keys=Object.keys(object);
    keys.forEach(key=> sources[key]=ConstantSource(key));
    return sources;
}


const makeMasterVoice =(instance="voice")=> ({
    instance: defaultInstance(instance),
    component: "voice",
    osc: audioContext.createOscillator(),
    vcaInterface: {...ADSRinterface},
    portamentoTime: 0.01,
    controls: {vca: makeSources(adsrSettings)},
    adsr: makeADSR({interface:true}),

    moreControls: {
        
       portamento(e){this.portamentoTime(e)},
     //  delay(e){this.adsr.interface},
    },
    note(frequency){
        this.osc.frequency.cancelScheduledValues(audioContext.currentTime)
        this.osc.frequency.setTargetAtTime(Number(frequency), audioContext.currentTime,this.portamentoTime,);
       // this.adsr.trigger();
    },
    trigger(){
       // this.adsr.trigger.call(adsr);
    },
    release(){
      //  this.adsr.triggerRelease();
    },
    init(){
        registerComponent(this);
      //  console.log("adsr",this.adsr);
     //   this.adsr.init();
      //  this.osc.connect(this.adsr.gain);
        
       // setFaderGroup()
        
        this.vcaInterface.initInterface();

       // this.osc.connect(this.adsr.gain);
        this.osc.start();
      //  this.adsr.gain.connect(audioContext.destination);

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


Module.makeKeyboard(5)


const voice=makeMasterVoice();
voice.init();
//voice.gain.connect(audioContext.destination)
/*
const constantNode=audioContext.createConstantSource();
constantNode.start();
*/
//const scope=makeScope(/*Environment.voice0.controls.attack.output*/);
//scope.init();
//document.body.appendChild(scope.wrapper);



function playNote(frequency) {
    console.log("playNote", frequency);
    Environment.voice.voice0.note(frequency);
}

function releaseNote(frequency){
    voice.release();
};