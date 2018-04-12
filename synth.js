var audioContext = audioContext ? audioContext : new AudioContext();

const synthInterface =(obj)=> {
  const waveform=makeSelector("waveform", "sine", "triangle", "sawtooth", "square");
  const masterGroup=faderGroup("master","portamento");
  const wrapper=wrapChildren(waveform,masterGroup);
  interface=draggableComponentWrapper(wrapper, obj.instance)
  setOwner(waveform, obj.component, obj.instance);
  setOwner(masterGroup, obj.component, obj.instance);
  document.body.appendChild(interface);
  return {
  masterGroup
  }
};
const masterVoice_listeners =(obj)=> ({
    waveform(e) {
      obj.osc.type = e;
    },
    portamento(e) {
      obj.portamentoTime(e);
    }
});


const makeGainInterface=(obj)=>{
    const fader=simpleFader("gain");
    const wrapper=draggableComponentWrapper(fader, obj.instance);
    wrapper.append(fader)
    fader.dataset.property="gain";
    fader.dataset.instance=obj.instance;
    fader.dataset.component=obj.component;
    fader.className="controlGroup";
    document.body.appendChild(wrapper);
    obj.interface=wrapper;
};

const makeGain=({input, instance="gain", output=audioContext.destination }={})=>{
    const gainNode= audioContext.createGain();
   /* if (input){
        input.connect(gainNode);
    }*/
    gainNode.connect(output);
    const gainComponent={
        gainNode,
        instance,
        component:"gain",
    }
    gainComponent.interface = makeGainInterface(gainComponent);
}
const makeMasterVoice = (instance = "voice") => {
const masterVoice={
    instance: defaultInstance(instance),
    component: "voice",
    portamentoTime: 0.01,
    volume(){},
    osc: audioContext.createOscillator(),
    vca: makeADSR({ interface: true}),
    pitchEnvelope : makeADSR({interface: true }),
    lfo: makeLFO({instance: "vibrato", interface: true}),
    lfo2: makeLFO({instance: "tremolo", interface: true}),
    note(frequency) {
      this.osc.frequency.cancelScheduledValues(audioContext.currentTime);
      this.osc.frequency.setTargetAtTime(
        Number(frequency),
        audioContext.currentTime,
        this.portamentoTime
      );
      this.vca.trigger();
    },
    trigger() {
      this.vca.trigger();
    },
    release() {
      this.vca.triggerRelease();
    }
}

      registerComponent(masterVoice);
      let listeners=masterVoice_listeners(masterVoice);
      Object.assign(masterVoice, listeners);

      synthInterface(masterVoice);

      masterVoice.lfo.init();
      masterVoice.lfo2.init();


      masterVoice.lfo.gain.connect(masterVoice.osc.frequency);
      //masterVoice.lfo2.gain.connect(masterVoice.vca.gain);
      masterVoice.vca.init();
      //this.pitchEnvelope.init();
      masterVoice.osc.connect(masterVoice.vca.gain);
      masterVoice.vca.gain.connect(audioContext.destination);
      masterVoice.osc.start();
  
      console.log("voice initialized!", masterVoice);
    }
/*
const makeMasterVoice = (instance = "voice") => ({

  instance: defaultInstance(instance),
  component: "voice",
  portamentoTime: 0.01,
  osc: audioContext.createOscillator(),
  vca: makeADSR({ interface: true}),
  pitchEnvelope : makeADSR({interface: true }),
  lfo: makeLFO({instance: "vibrato", interface: true}),
  lfo2: makeLFO({instance: "tremolo", interface: true}),

  note(frequency) {
    this.osc.frequency.cancelScheduledValues(audioContext.currentTime);
    this.osc.frequency.setTargetAtTime(
      Number(frequency),
      audioContext.currentTime,
      this.portamentoTime
    );
    this.vca.trigger();
  },
  trigger() {
    this.vca.trigger();
  },
  release() {
    this.vca.triggerRelease();
  },
  init() {
      //  setOwner(this.wave, this.component, this.instance);
    registerComponent(this);
    let listeners=masterVoice_listeners(this);
    Object.assign(this, listeners)
    // this.interface=makeSynthInterface( this.component, this.instance);
    synthInterface(this);
    this.lfo.init();
    this.lfo2.init();
    //  console.log("adsr",this.adsr);
    this.lfo.gain.connect(this.osc.frequency);
    this.lfo2.gain.connect(this.vca.gain);
    //this.vca.init();
    //this.pitchEnvelope.init();
    this.osc.connect(this.vca.gain);
    this.vca.gain.connect(audioContext.destination);
    this.osc.start();

    console.log("voice initialized!", this);
  }
});
/*
const voiceFactory = count => {
  const voices = [];
  for (let i = 0; i < count; i++) {
    voice = makeVoice();
    voice.init();
    voices.push(voice);
  }
  return voices;
};
function doIt(array, callback) {
  array.forEach(element => callback(element));
}
*/
function wrapChildren(...args) {
  const wrapper = createElement("div");
  args.forEach(component => wrapper.appendChild(component));
  return wrapper;
}

Module.makeKeyboard(5);

const voice = makeMasterVoice();
voice.init();

const scope = makeScope(Environment.voice.voice0.vca.gain);
scope.init();

function playNote(frequency) {
  console.log("playNote", frequency);
  Environment.voice.voice0.note(frequency);
}

function releaseNote(frequency) {
  Environment.voice.voice0.release();
}
