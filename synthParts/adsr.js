
const adsrSettings = { // for initialization only!
   // amount: { value: 1, min: 0, max: 1, step: 0.01 },
    delay: {value: 0, min: 0, max: 5, step: 'any'},
    attack: { value: 0.01, min: 0, max: 5, step: 0.01 },
    decay: { value: 0.2, min: 0, max: 5, step: 0.01 },
    sustain: { value: 0.8, min: 0, max: 1, step: 0.01 },
    release: { value: 0.5, min: 0, max: 5, step: 0.05 }
  };

  function envelope (destination, value, delay, attackDuration, decayDuration, sustain){
    var time=audioContext.currentTime;
   // console.log(destination, time, attackDuration);
    // destination.setValueAtTime(0, time);
     destination.cancelScheduledValues(time+delay);
     destination.linearRampToValueAtTime(value, (time + delay + attackDuration));
     destination.linearRampToValueAtTime(0,time+delay);
     destination.linearRampToValueAtTime(value * sustain, (time + delay + attackDuration + decayDuration));
 }
 
 function envelopeRelease (destination,  releaseTime) {
     console.log("envelopeRelease", destination.value, releaseTime);
    var time=audioContext.currentTime;
    destination.cancelScheduledValues(time);
    destination.setValueAtTime(destination.value,time);
    destination.linearRampToValueAtTime(0, (time + releaseTime));
 }

 function adsrDisplay(vals){
    const time=[this.delay, this.attack, this.decay, this.release];
    const peak=0; yZero=150;// to make easier to read the flipped y.
    //flip y coordinate (sustain) by subtracting from height;
    const sustain=150-this.sustain*150;
    const ctx= this.display.getContext("2d");
    var totalTime=time.reduce((accum,time)=>accum+time);
    var sustainLength=totalTime*0.2;
    const showSeconds=Math.floor(totalTime+sustainLength)+1;
    console.log(totalTime,sustainLength, showSeconds)

    time.splice(2, 0, sustainLength);
    // add 20% to display sustain...
    
    var unit=300/showSeconds;
    var unitTime=time.map(t=>t=t*unit);
    var delay=unitTime[0], attack=unitTime[1], decay=unitTime[2], 
        sustainLength=unitTime[3],release=unitTime[4];
    console.log(unitTime, totalTime);
    console.log(sustain)

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
            console.log("unit,tick",unit,tick)
    }
})();
ctx.strokeStyle ='rgb(255,176,0)';
    
    
    ctx.lineWidth = 2;
   // ctx.strokeStyle = "rgb(51, 255, 0)";      
    ctx.beginPath();
    ctx.moveTo(0,yZero);
    ctx.lineTo(delay,yZero)
    ctx.lineTo(delay+attack, peak);
    ctx.lineTo(delay+attack+decay, sustain);
    ctx.lineTo(delay+attack+decay+sustainLength, sustain)
    ctx.lineTo(delay+attack+decay+sustainLength+release, yZero);
 //   ctx.closePath();
    ctx.stroke();
}

function makeTrigger(destination){
    const triggerPad=createElement('div',{className:'trigger'});
    const trigger={
        triggerPad: triggerPad,
        destination: destination,
        mousePressed(event) {
            if (event.buttons & 1) {
                triggerPad.classList.add("hit");  
                console.log(Environment, destination)
                Environment[destination].trigger();
            }
        },
        mouseReleased(event) {
            triggerPad.classList.remove("hit");
            console.log(this.destination)
            Environment[destination].triggerRelease();
        },       
        setDestination(destination){
            this.destination=destination
        },        
    }
    triggerPad.addEventListener("mousedown", trigger.mousePressed, false);
    triggerPad.addEventListener("mouseup", trigger.mouseReleased, false);
    triggerPad.addEventListener("mouseover", trigger.mousePressed, false);
    triggerPad.addEventListener("mouseleave", trigger.mouseReleased, false);
    return trigger;
}


function addADSRinterface(adsr){
    const instance=adsr.instance;
    const trigger=makeTrigger(adsr.instance); 
    const faders = makeFaderGroup([adsrSettings,"Delay", "Att",  "Dec", "Sus", "Rel"]);
    const display=createElement("canvas",{className: "adsr_display"})
    var wrapper = createElement("div", {className:"adsr"});
    adsr.adsrDisplay=adsrDisplay.bind(adsr);
    groupLabel(faders,"ADSR");
    setOwner(faders, instance);
    wrapper.appendChild(trigger.triggerPad);
    wrapper.appendChild(display);
    wrapper.appendChild(faders);
    wrapper=draggableComponentWrapper(wrapper,this.instance);
    document.body.appendChild(wrapper);
    Environment[instance]= Object.assign(adsr, {interface: wrapper, display: display});
    return Environment[instance];
}


const ADSR_listeners=(adsr)=> ({
    amount(e){adsr.adsrDisplay(); adsr.gain.gain.value = e},
    // not strictly necessary... this control is overriding vca,
    // instead it should be changing the scale of the output...   
    attack(e){adsr.adsrDisplay(); adsr.attack=e;},
    delay(e){adsr.adsrDisplay(); adsr.delay=e},
    decay(e){adsr.adsrDisplay(); adsr.decay=e;},
    sustain(e){adsr.adsrDisplay(); adsr.sustain=e;},
    release(e){adsr.adsrDisplay(); adsr.release=e;},
});

const makeADSR=() => ({
    gain: audioContext.createGain(),
    instance: defaultInstance("adsr"),
    amount: 1, //adsrSettings["amount"].value,
    delay: adsrSettings.delay.value,
    attack: adsrSettings.attack.value,
    decay: adsrSettings.decay.value,
    sustain: adsrSettings.sustain.value,
    release: adsrSettings.release.value,
    inputs: {"gain":this.gain},
    outputs: {"gain":this.gain, "connected":[]},

    init(controls=true){
        Environment[this.instance]=this;
        this.controls=ADSR_listeners(this);
        if (controls){
            addADSRinterface(this);
        }
    },
    trigger(){
        envelope( this.gain.gain, this.amount, this.delay, this.attack, this.decay, this.sustain);
    },
    triggerRelease(){ envelopeRelease( this.gain.gain, this.release ) },
});




/*
const scope2=makeScope();
const adsr=makeADSR();
adsr.init();


const E=Environment;
const scope3=makeScope();

const LFO1=makeLFO();
LFO1.init();
LFO.osc.connect(adsr.gain);

*/
