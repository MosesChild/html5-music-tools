
const adsrSettings = { // for initialization only!
   // amount: { value: 1, min: 0, max: 1, step: 0.01 },
    delay: {value: 0, min: 0, max: 5, step: .05},
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

 const adsrDisplay=(canvas)=>{
     time=[this.delay, this.attack, this.decay, this.release]
    const peak=0; yZero=150;// to make easier to read the flipped y.
    //flip y coordinate (sustain) by subtracting from height;
    const sustain=150-this.sustain*150;
    const ctx = canvas.getContext("2d");
    var totalTime=time.reduce((accum,time)=>accum+time);
    var sustainLength=totalTime*0.2;
    const showSeconds=Math.floor(totalTime+sustainLength)+1;
    //console.log(totalTime,sustainLength, showSeconds)
    sustainLength=showSeconds-totalTime;
    time.splice(2, 0, sustainLength);
    // add 20% to display sustain...
    
    var unit=300/showSeconds;
    var unitTime=time.map(t=>t=t*unit);
    var delay=unitTime[0], attack=unitTime[1], decay=unitTime[2], 
        sustainLength=unitTime[3],release=unitTime[4];
    //console.log(unitTime, totalTime);
    //console.log(sustain)

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
        let y_offset= this.delay>0 ? 10 : 0;
        ctx.fillStyle= 'rgb(255,176,0)'

    ctx.fillText("delay "+this.delay, x_offset, y_offset-2);

    ctx.fillText("attack "+this.attack, x_offset, y_offset+12);
    ctx.fillText("decay "+this.decay, x_offset, y_offset+24);
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
    ctx.lineTo(delay+attack+decay+sustainLength, sustain)
    ctx.lineTo(delay+attack+decay+sustainLength+release, yZero);

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


const ADSRinterface={interface: {
    trigger: makeTrigger(), 
    faders: makeFaderGroup([adsrSettings,"Delay", "Att",  "Dec", "Sus", "Rel"]),
    display: createElement("canvas",{className: "adsr_display"}),
    wrapper: createElement("div", {className:"adsr"})
    },
    initInterface(){
        const r=this.interface;
        setOwner(r.faders, this.instance);
        groupLabel(r.faders,"ADSR");
        r.wrapper.appendChild(r.trigger.triggerPad);
        r.wrapper.appendChild(r.display);
        r.wrapper.appendChild(r.faders);
        r.wrapper=draggableComponentWrapper(r.wrapper,this.instance);
        document.body.appendChild(r.wrapper);
    }
}
/*
function makeADSRinterface(adsr){
    const instance=adsr.instance;
    const trigger=makeTrigger(adsr.instance); 
    const faders = makeFaderGroup([adsrSettings,"Delay", "Att",  "Dec", "Sus", "Rel"]);
    const display=createElement("canvas",{className: "adsr_display"});
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
*/

const master_ADSR_listeners =(canvas)=> ({
    amount(e){ this.gain.gain.value = e; adsrDisplay(canvas);},
    attack(e){ this.attack=e; adsrDisplay(canvas); },
    delay(e){ this.delay=e; adsrDisplay(canvas); },
    decay(e){ this.decay=e; adsrDisplay(canvas); },
    sustain(e){this.sustain=e; adsrDisplay(canvas); },
    release(e){this.release=e; adsrDisplay(canvas); }
});

const makeADSR= (interface=false, instance=defaultInstance("adsr")) => ({
    gain: audioContext.createGain(),
    instance: instance,
    amount: 1, //adsrSettings["amount"].value,
    delay: adsrSettings.delay.value,
    attack: adsrSettings.attack.value,
    decay: adsrSettings.decay.value,
    sustain: adsrSettings.sustain.value,
    release: adsrSettings.release.value,
    init(){
        Environment[this.instance]=this;
        if (interface){
            Object.assign(this, ADSRinterface);
            this.initInterface();
            this.controls=master_ADSR_listeners(this.interface.display);
            this.adsrDisplay = adsrDisplay.bind(this);
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
