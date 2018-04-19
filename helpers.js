const Environment= {};

const defaultInstance = (instance) => {
  var instanceNumber=Environment[instance] ? 
      Object.keys(Environment[instance]).length : 0;
  //console.log(instanceNumber);
  if (instanceNumber){
    while (Environment[instance][instance+instanceNumber]){
      instance+instanceNumber++;
    } 
  }
  return instance+instanceNumber;
}
const registerComponent=(component)=>{
  Environment[component.component]? 
    Environment[component.component][component.instance]=component
    : Environment[component.component] = { [ component.instance ] : component }
    return Environment[component.component][component.instance]
}

const makeAudioComponent=(component, name, interface=false)=>{
  const comp= {       
      component,
      name,
      instance:defaultInstance(component),
      connections: [],
      /*connect(internalNode, destinationNode){
          // should check internalNode exists internally!...
          console.log(internalNode, destinationNode)
          try {(internalNode.connect(destinationNode));
          this.connections=_.unionBy([{[internalNode.constructor.name] : destinationNode}],this.connections);
          }
          catch(e){console.log(e)};
      },/*
      findNodes(){
          _.filter(Environment.lfo.vibrato0, function (o){return o instanceof AudioNode}, [0])
      }*/
  }
  registerComponent(comp);
  return comp
}

const createElement = (element, attributesObj) => {
  var newElement = document.createElement(element);
  if (attributesObj) {
    const attributeNames = Object.keys(attributesObj);
    attributeNames.forEach(
      attribute => (newElement[attribute] = attributesObj[attribute])
    );
  }
  return newElement;
};

function wrapChildren(...args) {
  const wrapper = createElement("div");
  args.forEach(component => wrapper.appendChild(component));
  return wrapper;
}

const makeMaterialIcon=(iconName=>createElement("i",{className: "material-icons", textContent:iconName}));

const createMaterialIconButton = (className, iconName, eventHandler) => {
  const button=createElement("a",{className:className, href:"#"});
  const icon=makeMaterialIcon(iconName);
  button.appendChild(icon);
  if (eventHandler) { 
    button.onclick = eventHandler;
  }
  return button;
};

const makeButtons = (array) => {
  const group=[];
  array.forEach(item => group.push(createElement("button", { textContent: item, value: item })));
  return group;
};


function makeMultiSelector(array){
  const wrapper=createElement("div",{className:"menu"});
  const selections=createElement("ul",{className:""});
  array.forEach(item =>{ 
    const line = selections.appendChild(createElement("li", {textContent: item}))
  });  
  wrapper.appendChild(selections);
  wrapper.appendChild(createElement('button',{className:"done", textContent:"done"}))
}
function setMultiSelector(HTMLcomponent, selectedArray){
  const inputs=HTMLcomponent.getElementsByClassName('li');
  for (item of items){
    if (selectedArray.includes(item.textContent)){
      item.classList.add("selected");
    }
  }
}
function onRangeChange(r, f) {
  // continuous control of slider thanks to https://stackoverflow.com/questions/18544890 ...Andrew Willems !
  var n, c, m;
  r.addEventListener("input", function(e) {
    n = 1;
    c = e.target.value;
    if (c != m) f(e);
    m = c;
  });
  r.addEventListener("change", function(e) {
    if (!n) f(e);
  });
}
const changeComponentProperty=(e)=>{
  const componentInfo=e.target.closest('.component');
  const component=componentInfo.dataset.component;
  const instance=componentInfo.dataset.instance;
  const property=e.target.dataset.property;
  //const max=e.target.max;
  //console.log("max",max);
  const value=Number(e.target.value)
  // this value could get curve here!

 // const value=faderCurve(Number(e.target.value), max);
 console.log("change", component, instance, property, value)

 const method=Environment[component][instance][property];
  if (typeof method==="function"){
    method(value);
  } else {
    Environment[component][instance]["controls"][property](value);
  }

}

function faderCurve(value, max, steep=10){
  value=value/max;
  var x=Number((Math.pow(value, 2) * max).toFixed(7));
  return x
  //console.log("fader curve value", value, x)

  //steep>=2 and assumes value 0-100...outputs 0-1
  var coFactor=steep-1;
 // value=value/100
  var gain=multiplier*(Math.pow(10,steep)*value-1)/coFactor//  10^(x)-1)/9
  return gain;
}

const selectOption=(e)=>{
  const selection=e.target.dataset.selection
  const option=e.target.closest('.component');
  const component=option.dataset.component;
  const instance=option.dataset.instance;
  //const method=Environment[component][instance][selection]();
  const value=e.target.value;
  console.log(component, instance, selection, value);
  console.log(Environment[component][instance])
  Environment[component][instance][selection](value)

  //method(value);
}

function makeSelector (name, values){
  var componentName=name.replace (/[ ]/gi, "");
  var wrap = createElement("div",{className:"controlGroup"});
  var selector = createElement("select",{className:"selector"});
  for (var i = 1; i < arguments.length; i++) {
      let option = document.createElement("option");
      option.value = arguments[i];
      option.textContent = arguments[i];
      selector.append(option);
  }
  console.log("componentName",componentName)
  selector.onchange=selectOption;
  selector.dataset.selection=componentName;
  groupLabel(wrap, name);
  wrap.appendChild(selector);
  document.body.appendChild(wrap);
  return wrap;
};
/* right-click on fader for master options...
  disconnect - all
  connect to different device (requires Environment);
  connect to multiple devices (requires Environment and adds constantNode...
*/

const makeConstantSource=(instance="constantSource")=>({
  component: "constantSource",
  instance: instance==="constantSource" ? defaultInstance(instance) : instance,
  constantSource: audioContext.createConstantSource(),
  controls: { [instance](e) {
    Environment.constantSource[instance]["constantSource"].offset.value=-e } 
  },
  init(){
    registerComponent(this);
    this.constantSource.start();
  }
})

const simpleFader = (name) => {
  const fader = createElement("div", { className: "fader" });
  const slider = createElement("input", { type: "range",className:"slider" });
  const faderWrapper = createElement("div", { className: "sliderWrapper" });
  const label = createElement("span", { textContent: name });
  fader.appendChild(label);
  fader.appendChild(faderWrapper);
  faderWrapper.appendChild(slider);
  return fader;
};

const makeFaderGroup = ([faderSettings, ...args]) => {
  console.log("makeFaderGroup", faderSettings);
  const faders=faderGroup(...args);
  console.log(faders);
  setFaderGroup(faders, faderSettings);
  return faders;
}

function faderGroup(...args) {
const faderGroup = createElement("div", { className: "faderGroup"});
  args.forEach(element=> faderGroup.appendChild( simpleFader( element ) ) );
  return faderGroup;
};

function setFaderGroup(faderGroup, faderSettings) {
  const rangeSettings = Object.keys(faderSettings);
  const faders = faderGroup.getElementsByTagName("input");
  let index = 0;
  for (slider of faders) {
      const property=rangeSettings[index];
      onRangeChange(slider, changeComponentProperty);
      /* this is the important part... 
       set the input-range(slider) dataset.property to the 
       name of the listener on the component that you want! */
      slider.dataset.property=property;    
    Object.assign(slider, faderSettings[property]);
    index++;
  }
}

function groupLabel(group, label, className="groupLabel") {
  label = createElement("span", {
    textContent: label,
    className: className,
  });
  group.prepend(label);
}



const makeTopPanel = (o) => {
  const panel=createElement("div", { className: "topPanel"});
  const menuIcon = createElement("i", {
    className: "material-icons menuIcon",
    textContent: "menu",
  });
  const resizeIcon = createElement("img", {
    className: "handle", src: "./resize-icon-small.gif", style:"background-color:green"
    , alt: "resize component"
  });
  menuIcon.dataset.instance = o.instance;
  menuIcon.dataset.component = o.component;
  panel.appendChild(menuIcon);
  panel.appendChild(resizeIcon);
  return panel;
}


const draggableComponentWrapper = (interface, obj) => {
  const wrapper = createElement("div", { className: "wrapper" });
  const topPanel=makeTopPanel(obj);
  
  const defaultSizes = {
    keyboard: { width: "95vw", height: "20vh" },
    sampler: { width: "40vh", height: "20vh" },
    stepsContainer: { width: "80vw", height: "15vh" },
    menu: { width: "10vh" },
    LFO: { width: "300px"},
    ADSR: { width: "300px"},
    voice: { width: "300px"}
  };
  const cname = interface.className;
  

  if (defaultSizes[cname]) {
    wrapper.style.width = defaultSizes[cname].width;
    if (defaultSizes[cname].height) {
      wrapper.style.height = defaultSizes[cname].height;
    }
  } else {
    if (interface.style.width){ wrapper.style.width=interface.style.width}
    if (interface.style.height){ wrapper.style.height=interface.style.height}
  }
  
  wrapper.appendChild(topPanel);
  wrapper.appendChild(interface);
  return wrapper;
};

function hide(){
  let parent=this.interface.inner.parentNode;
  if (parent.lastChild && parent.lastChild===this.interface.inner){
      this.interface.inner=parent.removeChild(this.interface.inner);
  }
}

function show(){
  this.interface.wrapper.appendChild(this.interface.inner);
}


function componentMenu(selectionListener, ...args){
  // use like : componentMenu.call(this);
  const options=makeButtons(...args);
  let menu=createElement("div",{className:"componentMenu", instance: defaultInstance("menu") });
  options.forEach(option=>{
      menu.appendChild(option);
  })
  menu.addEventListener("click", selectionListener);
  return menu;
}

const makeSelectionListener=(o, methods)=>{
  return function (e){ 
    const value=e.target.value;
    const menu=e.target.parentNode;
    const container=menu.parentNode; 
    container.removeChild(menu);
    try {methods[value].call(o)
}
  catch(e){
    const comp=menu.closest('div.wrapper');
    const instance=comp.instance;
    const component=comp.component;
    Environment[component][instance][value]()}
  }
}

window.onload = function() {
  interact(".panel").draggable({
    ignoreFrom: [".metro_volume_wrapper"],
    onmove: dragMoveListener
  });
  interact(".wrapper")
    .draggable({
      allowFrom: ".topPanel",
     // ignoreFrom: [".handle"],
      onmove: dragMoveListener
    })
    .resizable({
      allowFrom: ".handle",
      preserveAspectRatio: false,
  //    ignoreFrom: [".key", ".handle"],
        edges: { left: true, bottom: true, right: true,  top: true }
    })
    .on("resizemove", function(event) {
      var target = event.target,
        x = parseFloat(target.getAttribute("data-x")) || 0,
        y = parseFloat(target.getAttribute("data-y")) || 0;

      // update the element's style
      target.style.width = event.rect.width + "px";
      target.style.height = event.rect.height + "px";

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      target.style.webkitTransform = target.style.transform =
        "translate(" + x + "px," + y + "px)";

      target.setAttribute("data-x", x);
      target.setAttribute("data-y", y);
    });

  function dragMoveListener(event) {
    var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
      y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform = target.style.transform =
      "translate(" + x + "px, " + y + "px)";

    // update the position attributes
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  }
  document.body.addEventListener("click", openMenu, true);
};

$ = selector => {
  const nodeList = document.querySelectorAll(selector);
  if (nodeList.length === 1) {
    return nodeList[0];
  } else {
    return nodeList;
  }
};

const openMenu=(e)=>{
  if (e.target.classList.contains("menuIcon")){
    const component=e.target.dataset.component;
    const instance=e.target.dataset.instance;
    Environment[component][instance].menu()
  //  console.log("menuIcon", e.target);
  }
}
/* menu needs: 
scope,
connected to...from?
insert?
change interface settings Range...
*/





