/***************************   Oscs  *********************************/

const LFOSettings = {
    frequency: {value: 3, min: 0, max: 20, step : 0.02},
    amount: { value: 100, min: 0, max: 100, step: 1 },
  };


const makeLFOinterface = (lfo) => {
    //const LFOselect = makeSelector ("LFO type","vibrato","tremolo","both","none");
    const scope=lfo.scope.interface;
    const label= createElement("span", {textContent: "LFO", className: "groupLabel"} );
    const lfoWaveform = makeSelector( "waveform", "sine", "triangle", "sawtooth", "square", "custom");
    const lfoFaderGroup = makeFaderGroup([LFOSettings,"Frequency","Amount"]);
    var interface= wrapChildren(scope,label, lfoWaveform, lfoFaderGroup);
    let controlGroup=interface.getElementsByClassName("controlGroup");
    setOwner(lfoWaveform,lfo);
    setOwner(lfoFaderGroup,lfo);
    interface=draggableComponentWrapper( interface, lfo.instance );
    document.body.appendChild(interface);
    return interface;
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


const makeLFO=(instance=defaultInstance("LFO"), makeInterface=true ) => ({
        name: "LFO",
        instance: instance,
        osc: audioContext.createOscillator(),
        gain: audioContext.createGain(),
        state:"vibrato",/*
        frequency: LFOSettings.frequency.value,
        amount: LFOSettings.amount.value,

*/
        init(){
            Environment[this.instance]=this;
            this.osc.connect(this.gain);
            this.controls= lfoControls(this);
            this.osc.frequency.value = 3;
            this.osc.type = "sine";
            this.gain.gain.value = 100;            
            this.osc.start();            
            if (makeInterface===true){
            this.scope=makeScope(this.gain);
            this.interface=makeLFOinterface(this,this.scope.interface);
            } 
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
        Environment.connections.push();
        source.connect(destination);
    }
}



