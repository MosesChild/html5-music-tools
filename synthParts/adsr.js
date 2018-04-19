
const adsrSettings = { // for initialization only!
   // amount: { value: 1, min: 0, max: 1, step: 0.01 },
    delay: {value: 0, min: 0, max: 5, step: .05},
    attack: { value: 0.01, min: 0, max: 5, step: 0.01 },
    decay: { value: 0.01, min: 0.01, max: 5, step: 0.01 },
    sustain: { value: 0.8, min: 0, max: 1, step: 0.01 },
    release: { value: 0.5, min: 0, max: 5, step: 0.05 }
  };

// makeSources should take: settingsObject?, controlElements? 
/*
const makeSources=(faderGroup)=>{
    const sources={};
    const controlList=faderGroup.getElementsByClassName("slider");
    for (control of controlList){ 
    }

    const keys=Object.keys(object);
    keys.forEach(key=> sources[key]=ConstantSource(key));
    return sources;
}
*/

/* two types of ADSR... One that controls a gain node... another that controls a 
constantNode...  for proper setup...
    -must make explicit at ADSR creation? "local","master"
    -set at creation or after creation of Master constantNodes?  

    What is ideal future setup of 'make it yourself' audio components...  
        Pick components from Modules (and get optional interfaces)?
            Advantages
                encourages easy encorporation by developers and 
                    hobbyist into their own programs.
                could create drag-n-drop interface with packager that 
                    makes production code.
        Make interfaces and set them to any (suitable) available component?
            Advantages
                Making interfaces the starting place has the advantage of
                already having a GUI to add selection of components to...
        Ideally, BOTH...  
            Start by picking components, but 
            enable further experimentation by
                modifying control assignments...
                easy changing of audio routing...
                easy branching of current controls...
*/
/* all components have:
component,
instance,
environmentAddress,
internal audioComponent(s); which have connections...
Better code would re-use a base makeAudioComponent...*/
//const componentTypes={ ADSR : [gain], LFO: [gain,osc], constantSource[constantSource]}

//gain: audioContext.createGain(),

//comp.gain.owner=comp.instance;
const display_ADSR_listeners = o => ({
    amount(e){ o.gain.gain.setValueAtTime(e, audioContext.currentTIme) = e; o.adsrDisplay(); },
    freq(e){ o.osc.frequency.setValueAtTime(e, audioContext.currentTime) = e; o.adsrDisplay(); },
    attack(e){ o.attack=e; o.adsrDisplay(); },
    delay(e){ o.delay=e; o.adsrDisplay(); },
    decay(e){ o.decay=e; o.adsrDisplay(); },
    sustain(e){ o.sustain=e; o.adsrDisplay(); },
    release(e){ o.release=e; o.adsrDisplay(); }
});

const E=(instance)=>{if (!instance){return Environment} return _.find(Environment, instance)}

const LFOtrigger = (interface=false, name="lfoTrigger")=>{
    const ADSR=makeADSR(interface,name)
    ADSR.osc = audioContext.createOscillator();
    if (interface){
        ADSR.interface.faders.appendChild(simpleFader("frequency"))
    }
    
}

const makeADSR= ({
    interface=false, 
    name="adsr"
    }={}) => {
    const comp=makeAudioComponent("ADSR", name);
    var adsr={
        gain: audioContext.createGain(),
        amount: 1, //adsrSettings["amount"].value,
        delay: adsrSettings.delay.value,
        attack: adsrSettings.attack.value,
        decay: adsrSettings.decay.value,
        sustain: adsrSettings.sustain.value,
        release: adsrSettings.release.value,
        trigger(){
            var time=audioContext.currentTime;
            let adsr=this.gain.gain;
            adsr.cancelScheduledValues(time+this.delay);
             //attack
             adsr.setValueAtTime(0.01, time+this.delay);
             adsr.setTargetAtTime(.5, time + this.delay ,this.attack);
             //decay
             adsr.setValueAtTime(.5, time+this.delay+this.attack);
             adsr.setTargetAtTime(this.sustain*.5, (time + this.delay + this.attack), this.decay);
        },
        triggerRelease(){
            var time=audioContext.currentTime;
            let adsr=this.gain.gain;
            adsr.cancelScheduledValues( time );
            adsr.setValueAtTime( adsr.value, time );
            adsr.linearRampToValueAtTime(0, ( time + this.release ));
        }
    };
    adsr.gain.gain.setValueAtTime(0,audioContext.currentTime);
    adsr=Object.assign(comp,adsr)
    if (interface){
        adsr=Object.assign(adsr, ADSRinterface(name));
        adsr.init();
        adsr.controls=display_ADSR_listeners(adsr);
    }
    return adsr;
}

const ADSRinterface=(name)=> ({
    interface: {
        triggerPad: createElement('div',{className:'trigger'}),
        faders: faderGroup("Delay", "Att",  "Dec", "Sus", "Rel"),
        display: createElement("canvas",{className: "adsr_display"}),
    },
    menu(){ componentMenu.apply(this);},
    show(){show.apply(this)},
    hide(){hide.apply(this)},
    init(){
        const r=this.interface;  
        const interface=wrapChildren(r.display, r.faders, r.triggerPad);
        interface.className="component";
        interface.dataset.component=this.component;
        interface.dataset.instance=this.instance;
        addTriggerEnvelopesEvents(r.triggerPad,this);
        groupLabel(interface, name);
        setFaderGroup(this.interface.faders, adsrSettings);
        document.body.appendChild(interface)
        this.adsrDisplay();
    },
    adsrDisplay(){adsrDisplay.call(this)}
})

const addTriggerEnvelopesEvents = (element,adsr) =>{
    const triggerDown = (event)=> {
        if (event.buttons & 1) {
            element.classList.add("hit");  
            adsr.trigger.call(adsr);
        }
    };
    const triggerUp = (event) => {
        element.classList.remove("hit");
        adsr.triggerRelease.call(adsr);
    };
    element.addEventListener("mousedown", triggerDown, false);
    element.addEventListener("mouseup", triggerUp, false);
    element.addEventListener("mouseover", triggerDown, false);
    element.addEventListener("mouseleave", triggerUp, false);
}

function adsrDisplay(){
    const peak=0; yZero=150;// to make easier to read the flipped y.
    //flip y coordinate (sustain) by subtracting from height;
    const sustain=150-this.sustain*150;
    const ctx = this.interface.display.getContext("2d");
    const time=[this.delay, this.attack, this.decay, this.release]
    const summedRampTime=time.reduce((accum,time)=>accum+time)
    const totalTime=Math.floor(summedRampTime)+1 ;
    const sustainLength=totalTime-summedRampTime>0.2 ? 
        totalTime-summedRampTime : (totalTime-summedRampTime)+1
    const showSeconds=summedRampTime+sustainLength;     
    const unit=300/showSeconds;
    var delay=this.delay*unit, 
        attack=this.attack*unit, 
        decay=this.decay*unit, 
        sustainTime=sustainLength*unit, 
        release=this.release*unit;

    // clear previous vals
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,300,150);

    // make second ticks;
    (()=>{            
        for (let tick=0; tick<showSeconds; tick++){ 
            ctx.beginPath();
            ctx.moveTo(unit*tick,145);
            ctx.lineTo(unit*tick,150);
            ctx.closePath()
            ctx.stroke();
            ctx.fillStyle= 'rgb(255,176,0)'
            ctx.fillText(tick+"s",unit*tick+3, 145)
       //     console.log("unit,tick",unit,tick)
        }
    })();
        // show important values!
        let x_offset=240;
        let y_offset= delay>0 ? 10 : 0;
        ctx.fillStyle= 'rgb(255,176,0)'

    ctx.fillText("delay "+this.delay, x_offset, y_offset-2);

    ctx.fillText("attack "+this.attack, x_offset, y_offset+12);
    ctx.fillText("decay "+ this.decay, x_offset, y_offset+24);
    ctx.fillText("sustain "+this.sustain, x_offset, y_offset+36);
    ctx.fillText("release "+this.release, x_offset, y_offset+48);
        

    ctx.strokeStyle ='rgb(255,176,0)';
    
    
    ctx.lineWidth = 2;
   // ctx.strokeStyle = "rgb(51, 255, 0)";      
    ctx.beginPath();
    ctx.moveTo(0,yZero);
    ctx.lineTo(delay,yZero)
    ctx.lineTo(delay+attack, peak);
    ctx.lineTo(delay+attack+decay, sustain);
    ctx.lineTo(delay+attack+decay+sustainTime, sustain)
    ctx.lineTo(delay+attack+decay+sustainTime+release, yZero);

    ctx.stroke();
}

