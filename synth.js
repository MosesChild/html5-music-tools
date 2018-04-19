var audioContext = audioContext ? audioContext : new AudioContext();

const synthSettings={
  volume: {default: .5 ,min: 0, max: 1, step:.01},
  portamento: {default: .5, min: 0, max: 1, step:.01}
}



const synthInterface =(obj)=> {
  const waveform=makeSelector("waveform", "sine", "triangle", "sawtooth", "square");
  const masterGroup=faderGroup("volume","portamento");
  const interface=wrapChildren(waveform,masterGroup);
  groupLabel(interface,"voice")
  interface.className="component";
  interface.dataset.component=obj.component;
  interface.dataset.instance=obj.instance;

  setFaderGroup(masterGroup, synthSettings)
  document.body.appendChild(interface);

  return {
    interface: { interface},
    menu(){ componentMenu.apply(this);},
    show(){show.apply(this)},
    hide(){hide.apply(this)}
  }
};
const masterVoice_listeners =(obj)=> ({
    waveform(e) {
      obj.osc.type = e;
    },
    portamento(e) {
      obj.portamentoTime=e;
    },
    volume(e){
      obj.masterVolume.gain.setValueAtTime(e,audioContext.currentTime)
    }
});

const makeMasterVoice = (instance = "voice") => {
  const masterVoice={
      instance: defaultInstance(instance),
      component: "voice",
      portamentoTime: 0.01,
      osc: audioContext.createOscillator(),
      vca: makeADSR({ interface: true, name:"vca"}),
      vco : makeADSR({interface: true, name:"vco" }),
      lfo: makeLFO({name: "tremolo", interface: true}),
     // lfo2: makeLFO({name: "tremolo", interface: true}),
      masterVolume: audioContext.createGain(),
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
      Object.assign(masterVoice, masterVoice_listeners(masterVoice));
      Object.assign(masterVoice, synthInterface(masterVoice));
    //  masterVoice.lfo.gain.connect(masterVoice.osc.frequency);      
      masterVoice.osc.start();
      masterVoice.osc.connect(masterVoice.vca.gain);
    //  masterVoice.vca.gain.connect(masterVoice.masterVolume);
      masterVoice.vca.gain.connect(masterVoice.lfo.out);
      masterVoice.lfo.out.connect(masterVoice.masterVolume);
      masterVoice.masterVolume.connect(audioContext.destination);
      console.log("voice initialized!", masterVoice);
      return masterVoice;
}

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

const keyboard=Module.makeKeyboard(5);
const voice = makeMasterVoice();
const scope = makeScope({audioNode: voice.masterVolume, interface:true});
console.log(voice)



function playNote(frequency) {
  console.log("playNote", frequency);
  Environment.voice.voice0.note(frequency);

}

function releaseNote(frequency) {
  Environment.voice.voice0.release();
}
