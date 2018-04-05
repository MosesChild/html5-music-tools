

function makeADSR_canvas(attack,decay,sustain,release){
const canvas=createElement("canvas",{className:"scope", id: instance});
const ctx= canvas.getContext("2d");
ctx.lineWidth = 2;
ctx.strokeStyle = "rgb(51, 255, 0)";      
ctx.beginPath();
ctx.lineTo(attack, 150);
ctx.lineTo(attack+decay, sustain);
ctx.lineTo(attack+decay+release, 0)
}

