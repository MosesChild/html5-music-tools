/***************************   Oscs  *********************************/

const LFOSettings = {
    frequency: {value: 3, min: 0, max: 20, step : 0.02},
    amount: { value: 100, min: 0, max: 100, step: 1 },
  };


const makeLFOinterface = (object) => {
    //const LFOselect = makeSelector ("LFO type","vibrato","tremolo","both","none");
    const label= createElement("span", {textContent: "LFO", className: "groupLabel"} );
    const lfoWaveform = makeSelector( "waveform", "sine", "triangle", "sawtooth", "square", "custom");
    const lfoFaderGroup = makeFaderGroup([LFOSettings,"Frequency","Amount"]);
    
    var interface= wrapChildren(label, lfoWaveform, lfoFaderGroup);
    interface.className="LFO"
    //let controlGroup=interface.getElementsByClassName("controlGroup");
    setOwner(lfoWaveform, object.component, object.instance);
    setOwner(lfoFaderGroup, object.component, object.instance);
    interface=draggableComponentWrapper( interface, object.instance );
    document.body.appendChild(interface);
    return interface;
}

const lfoControls=(lfo)=> ({
        amount(e){lfo.gain.gain.value = e;},
        frequency(e){lfo.osc.frequency.setValueAtTime(e, audioContext.currentTime) },
        attack(e){lfo.attack=e;},
        decay(e){lfo.decay=e;},
        sustain(e){lfo.sustain=e;},
        release(e){lfo.release=e;},
        LFOtype(e){lfo.osc.frequency.type=e },
        waveform(e){lfo.osc.type=e; },
});

const makeLFO=({interface=false,instance="lfo"}={}) => ({
        component:"lfo",
        instance: defaultInstance(instance),
        osc: audioContext.createOscillator(),
        gain: audioContext.createGain(),
        state:"vibrato",/*
        frequency: LFOSettings.frequency.value,
        amount: LFOSettings.amount.value,
*/
        init(){
            
            this.osc.connect(this.gain);
            Object.assign(this, lfoControls(this));
         //   this.controls= lfoControls(this);
            this.osc.frequency.value = 3;
            this.osc.type = "sine";
            this.gain.gain.value = 100;            
            this.osc.start();
            registerComponent(this);            
            if (interface===true){
            this.interface=makeLFOinterface(this);
            }
            
        },
        toString: function () {
            return "freq="+this.osc.frequency.value.toFixed(1) +
                    " amp="+this.gain.gain.value.toFixed(2);
        }
});

const connect=(source,destination)=>{
    if (source instanceof AudioNode&& destination instanceof AudioNode){
        Environment.connections.push();
        source.connect(destination);
    }
}



