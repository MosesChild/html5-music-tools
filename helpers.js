const Environment={};


// call this registerInstance,
const defaultInstance = (instance="unknown") => {
  const instanceNumber=Environment[instance] ? Environment[instance].length : 0;
  if (Environment[instance]){
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

const draggableComponentWrapper = (component, instance) => {
  const wrapper = createElement("div", { className: "wrapper" });
  const topPanel = createElement("div", { className: "topPanel" });
  const defaultSizes = {
    keyboard: { width: "80vw", height: "20vh" },
    sampler: { width: "40vh", height: "20vh" },
    sequencer: { width: "80vw", height: "15vh" },
    menu: { width: "10vh" },
    LFO: { width: "40vh"}
  };
  if (instance){
  // topPanel should be flex-container, justify content space-between(css);
  let menu = createElement("i", {
    className: "material-icons menuIcon",
    id: instance + "_menu",
    textContent: "menu"
  });
  topPanel.appendChild(menu);
  }
  const handle = createElement("i", {
    className: "material-icons handle",
    textContent: "drag_handle"
  });

  const cname = component.className;
  if (defaultSizes[cname]) {
    wrapper.style.width = defaultSizes[cname].width;
    if (defaultSizes[cname].height) {
      wrapper.style.height = defaultSizes[cname].height;
    }
  }
  topPanel.appendChild(handle);
  wrapper.appendChild(topPanel);
  wrapper.appendChild(component);
  return wrapper;
};

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

const createMaterialIconToggleButton=(toggleClassName, iconName1, iconName2, toggleEvent1,toggleEvent2)=>{
  
}
const classToggler = (instanceID, className) => {
  const instance=$("."+instanceID)
  const currentItem= instance.getElementsByClassName(className)[0];
  currentItem.classList.toggle("toggleOn");
}
const eventChanger = (event1,event2=event1, toggleClass, icon1, icon2) => {
  if (toggleClass.contains("toggleOn")){
    toggleClass.lastChild=makeMaterialIcon(icon2);
    event1();
  } else {
    toggleClass.lastChild=makeMaterialIcon(icon1);
    event2();
  }
};

const createPanel = (idIconNameArray, id) => {
  var panel = createElement("p", { className: "panel", id: id });
  //panelheader = panel.appendChild(createElement("i",{className: "material-icons header", textContent: "drag_handle"}))

  idIconNameArray.forEach(button => {
    btn = createMaterialIconButton(button[0], button[1], button[3]);
    panel.appendChild(btn);
  });
  //dragElement(panel);
  return panel;
};

const menu = list => {
  //first get version that creates a list...
  const radioList = makeList(list);
  radioList.className = "menu";
  let dragmenu = draggableComponentWrapper(radioList);

  document.body.appendChild(dragmenu);
  console.log("menu", dragmenu);
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
  const draggable=draggableComponentWrapper(wrapper);
  return draggable;
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
function changeComponentProperty(e){
  const componentInfo=e.target.closest('.controlGroup')
  const component=componentInfo.dataset.component;
  const instance=componentInfo.dataset.owner;
  const property=e.target.dataset.property;
  
  const max=e.target.max;
  //console.log("max",max);
  //const value=Number(e.target.value)
  // this value could get curve here!
  const value=faderCurve(Number(e.target.value), max);
  const method=Environment[component][instance]["controls"][property];
  method(value);
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

function selectOption(e){
  const instance=e.target.closest('.controlGroup').dataset.owner;
  const method=Environment[type][instance]["controls"][e.target.dataset.property];
  const value=e.target.value;
  console.log(instance, method, value);
  method(value);
}



function makeSelector (name, values){
  var componentName=name.replace (/[ ]/gi, "");
  var wrap = createElement("div",{className:"controlGroup"});
  var selector = createElement("select");
  for (var i = 1; i < arguments.length; i++) {
      let option = document.createElement("option");
      option.value = arguments[i];
      option.textContent = arguments[i];
      selector.append(option);
  }
  console.log("componentName",componentName)
  selector.onchange=selectOption;
  selector.dataset.property=componentName;
  groupLabel(wrap, name);
  wrap.appendChild(selector);
  document.body.appendChild(wrap);
  return wrap;
};


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
const controlGroup = createElement("div", { className: "controlGroup", /*id: defaultInstance("controlGroup")*/});
  args.forEach(element=> controlGroup.appendChild( simpleFader( element ) ) );
  return controlGroup;
};

function setFaderGroup(faderGroup, faderSettings) {
  const rangeSettings = Object.keys(faderSettings);
  const faders = faderGroup.getElementsByTagName("input");
  let index = 0;
  for (slider of faders) {
      const property=rangeSettings[index];
      onRangeChange(slider, changeComponentProperty);
      slider.dataset.property=property;
    Object.assign(slider, faderSettings[property]);
    index++;
  }
}

function groupLabel(group, label) {
  label = createElement("span", {
    textContent: label,
    className: "groupLabel"
  });
  group.prepend(label);
}
function setOwner(controlGroup, component, instance){
    console.log(instance,controlGroup);
    controlGroup.dataset.owner=instance;
    controlGroup.dataset.component=component;
}



const getAudioSamples=()=>{
  var audioSamples=document.getElementsByClassName("sample");  
  const patchList = $(".patchList");
  while (patchList.hasChildNodes()) {
    patchList.removeChild(patchList.lastChild);
  }
  console.log("getPatchNames", audioSamples);
  for(sample of audioSamples){
    console.log(sample);
    var audioDup=sample.cloneNode();
    audioDup.className="";
    audioDup.controls=true;
    patchList.appendChild(audioDup);
  };
}

window.onload = function() {
  interact(".panel").draggable({
    onmove: dragMoveListener
  });
  interact(".wrapper")
    .draggable({
      allowFrom: ".handle",
      onmove: dragMoveListener
    })
    .resizable({
      preserveAspectRatio: false,
      ignoreFrom: [".key", ".handle"],
      edges: { left: true, right: true, bottom: false, top: true }
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
};
$ = selector => {
  const nodeList = document.querySelectorAll(selector);
  if (nodeList.length === 1) {
    return nodeList[0];
  } else {
    return nodeList;
  }
};


