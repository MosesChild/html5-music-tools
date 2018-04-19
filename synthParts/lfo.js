/***************************   Oscs  *********************************/

const LFOSettings = {
    frequency: {value: 3, min: 0, max: 20, step : 0.02},
    amount: { value: 1, min: -1, max: 1, step: .01 },
  };

const makeLFOinterface = (object) => {
    //const LFOselect = makeSelector ("LFO type","vibrato","tremolo","both","none");
    const label= createElement("span", {textContent: object.name, className: "groupLabel"} );
    const lfoWaveform = makeSelector( "waveform", "sine", "triangle", "sawtooth", "square", "custom");
    const lfoFaderGroup = makeFaderGroup([LFOSettings,"Frequency","Amount"]);
    const interface= wrapChildren(label, lfoWaveform, lfoFaderGroup);
    interface.className="component";
    interface.dataset.component=object.component;
    interface.dataset.instance=object.instance;
    // interface.className="LFO"
    document.body.appendChild(interface);

    return {
        interface: {
        interface,
        },
        menu(){ const listener=makeSelectionListener(object, {hide, show} );
        const menu= componentMenu(listener, ["show", "hide", "scope", "component"]);
        console.log(menu)
        this.interface.wrapper.prepend(menu);
        }
    }
     
}

const lfoControls= lfo => ({
        amount(e){lfo.gain.gain.setValueAtTime(e, audioContext.currentTime)},
        frequency(e){lfo.osc.frequency.setValueAtTime(e, audioContext.currentTime) },
        LFOtype(e){
            let LFOtype=e},
        waveform(e){lfo.osc.type=e; },
});

const makeLFO=({interface=false, name="lfo"}={}) => {
    const comp=makeAudioComponent("LFO",name);
    var lfo={
        osc: audioContext.createOscillator(),
        gain: audioContext.createGain(),
        out: audioContext.createGain(),
    }

    // pitch output : frequency;
    lfo.osc.connect(lfo.gain);
    lfo.gain.connect(lfo.out.gain);
    lfo = Object.assign(comp, lfo);
    lfo = Object.assign(lfo, lfoControls(lfo));
    lfo.osc.frequency.value = 3;
    lfo.osc.type = "sine";
 //   lfo.gain.gain.value = 1;            
    lfo.osc.start();
    if (interface===true){
        lfo=Object.assign(lfo, makeLFOinterface(lfo));
    }
    return lfo;
};


function makeVoiceInput(){
    const mic=makeAudioComponent("mic");
    mic.scope=makeScope({});
    navigator.mediaDevices.getUserMedia({audio:true})
	.then(stream => {
//		rec = new MediaRecorder(stream);
mic.source = audioContext.createMediaStreamSource(stream);
mic.source.connect(mic.scope.analyser);
mic.gain=audioContext.createGain()
mic.source.connect(mic.gain);
//mic.gain.connect(audioContext.destination);



	})
	.catch(e=>console.log(e));



return mic;
}

