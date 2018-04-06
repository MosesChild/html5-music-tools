/***************************   Oscs  *********************************/

const LFOSettings = {
    frequency: {value: 3, min: 0, max: 20, step : 0.02},
    amount: { value: 100, min: 0, max: 100, step: 1 },
  };

const makeLFOinterface = () => {
  //  const LFOselect = makeSelector ("LFO type","vibrato","tremolo","both","none");
    const lfoWaveform = makeSelector( "waveform", "sine", "triangle", "sawtooth", "square", "custom");
    const lfoFaderGroup = faderGroup("LFO", "Frequency","Amount");
    const wrapper=createElement("div",{className:"LFO"});
  //  wrapper.appendChild(LFOselect);
    wrapper.appendChild(lfoWaveform);
    wrapper.appendChild(lfoFaderGroup);
    groupLabel(lfoFaderGroup, "LFO");
    document.body.appendChild(wrapper);
    setFaderGroup(lfoFaderGroup, LFOSettings);
    return wrapper;
}

const lfoControls=(lfo)=> ({
        amount(e){lfo.gain.gain.value = e},
        frequency(e){lfo.osc.frequency.setValueAtTime(e, audioContext.currentTime) },
        attack(e){ lfo.attack=e;},
        decay(e){lfo.decay=e;},
        sustain(e){lfo.sustain=e;},
        release(e){lfo.release=e;},
        LFOtype(e){lfo.osc.frequency.type=e },
        waveform(e){lfo.osc.type=e; },
});
const makeLFO=() => ({
        name: "LFO",
        scope: makeScope(),
        instance: defaultInstance("LFO"),
        interface: makeLFOinterface(),
        osc: audioContext.createOscillator(),
        gain: audioContext.createGain(),
        state:"vibrato",/*
        frequency: LFOSettings.frequency.value,
        amount: LFOSettings.amount.value,
*/
        init(){
            Environment[this.instance]=this;
            this.interface.prepend(this.scope.canvas);
            this.interface=draggableComponentWrapper(this.interface, this.instance);
            document.body.appendChild(this.interface);
            this.controls= lfoControls(this);
            this.inputs={"frequency":this.osc.frequency,"detune":this.osc.detune, "gain":this.gain},
            this.outputs= {"osc": this.osc, "gain": this.gain};
            this.osc.connect(this.gain);
            this.osc.connect(this.scope.analyser);
            
            console.log("setOwner", this);
            let controlGroup=this.interface.getElementsByClassName("controlGroup");
            for (control of controlGroup){
                console.log(control, this)
                setOwner(control, this);
            }
            this.osc.frequency.value = 3;
            this.osc.type = "sine";
            this.gain.gain.value = 100;            
            this.osc.start();
        },
        disconnect(destination){

        },
        connection(destination){
            console.log("connecting", destination);
            this.gain.connect(destination);
        },
        toString: function () {
            return "freq="+this.osc.frequency.value.toFixed(1) +
                    " amp="+this.gain.gain.value.toFixed(2);
        }
});

const connect=(source,destination)=>{
    if (source instanceof AudioNode&& destination instanceof AudioNode){
        Environment.connections.push()
        source.connect(destination);
    }
}



