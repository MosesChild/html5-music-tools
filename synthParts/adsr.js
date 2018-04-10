
const adsrSettings = { // for initialization only!
   // amount: { value: 1, min: 0, max: 1, step: 0.01 },
    delay: {value: 0, min: 0, max: 5, step: .05},
    attack: { value: 0.01, min: 0, max: 5, step: 0.01 },
    decay: { value: 0.1, min: 0, max: 5, step: 0.1 },
    sustain: { value: 0.8, min: 0, max: 1, step: 0.01 },
    release: { value: 0.5, min: 0, max: 5, step: 0.05 }
  };

const display_ADSR_listeners = o => ({
    amount(e){ o.gain.gain.value = e; o.adsrDisplay(); },
    attack(e){ o.attack=e; o.adsrDisplay(); },
    delay(e){ o.delay=e; o.adsrDisplay(); },
    decay(e){ o.decay=e; o.adsrDisplay(); },
    sustain(e){ o.sustain=e; o.adsrDisplay(); },
    release(e){ o.release=e; o.adsrDisplay(); }
});


const makeADSR= (interface=false, instance=defaultInstance("adsr") ) => ({
    component:"adsr",
    gain: audioContext.createGain(),
    instance: instance,
    amount: 1, //adsrSettings["amount"].value,
    delay: adsrSettings.delay.value,
    attack: adsrSettings.attack.value,
    decay: adsrSettings.decay.value,
    sustain: adsrSettings.sustain.value,
    release: adsrSettings.release.value,
    controls: {
        amount(e){ this.gain.gain.value = e},
        attack(e){ this.attack=e},
        delay(e){ this.delay=e},
        decay(e){ this.decay=e},
        sustain(e){this.sustain=e },
        release(e){this.release=e }
    },
    init(){
        Environment[this.component][this.instance]=this;
        if (interface){
            Object.assign(this, ADSRinterface);
            this.initInterface();
            this.controls=display_ADSR_listeners(this);
        }
        this.gain.gain.setValueAtTime(0,audioContext.currentTime)
        this.gain.connect(audioContext.destination)
    },
    trigger(){
            var time=audioContext.currentTime;
            let adsr=this.gain.gain;
           // this.triggerRelease();
            adsr.cancelScheduledValues(time+this.delay);
          //   adsr.setValueAtTime(0, time);
             //attack
             adsr.setValueAtTime(0.01, time+this.delay);
             adsr.setTargetAtTime(1, time + this.delay ,this.attack);
             //decay
             adsr.setTargetAtTime(this.sustain, (time + this.delay + this.attack), this.decay);
    },
    triggerRelease(){
        var time=audioContext.currentTime;
        let adsr=this.gain.gain;
        adsr.cancelScheduledValues( time );
        adsr.setValueAtTime( adsr.value, time );
        adsr.linearRampToValueAtTime(0, ( time + this.release ));
    }
});

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

const ADSRinterface={interface: {
    triggerPad: createElement('div',{className:'trigger'}),
    faders: faderGroup("Delay", "Att",  "Dec", "Sus", "Rel"),
    display: createElement("canvas",{className: "adsr_display"}),
    wrapper: createElement("div", {className:"adsr"}),
    },
    initInterface(){
        const r=this.interface;  
        addTriggerEnvelopesEvents(r.triggerPad,this);
        setOwner(r.faders, this.component, this.instance);
        groupLabel(r.faders,"ADSR");
        r.wrapper.appendChild(r.display);
        r.wrapper.appendChild(r.triggerPad);
        r.wrapper.appendChild(r.faders);
        r.wrapper=draggableComponentWrapper(r.wrapper,this.instance);
        document.body.appendChild(r.wrapper);
        setFaderGroup(this.interface.faders, adsrSettings);
        this.adsrDisplay();
    },
    adsrDisplay(){
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
}


