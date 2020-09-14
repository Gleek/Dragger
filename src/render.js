// In renderer process (web page).
const {ipcRenderer} = require('electron');
const Handlebars = require('handlebars');
const {getClassNameForExtension}  = require('font-awesome-filetypes');

ipcRenderer.send('ready');
const source = document.getElementById("file-template").innerHTML;
const fileTemplate = Handlebars.compile(source);
const emptySource = document.getElementById("empty-template").innerHTML;
const emptyTemplate = Handlebars.compile(emptySource);
Handlebars.registerHelper('escape', function(variable) {
  return variable.replace(/(['"])/g, '\\$1');
});
// When files are received
let files = null;
ipcRenderer.on('files', (event, arg) => {
  console.log("files_received", arg);
  files = arg;
  renderFiles();
});

const renderFiles = () =>  {
  if (!files || files.length == 0) {
    const html =emptyTemplate();
    document.getElementById("dropzone").innerHTML = html;
    return;
  }
  document.getElementById("dropzone").innerHTML = "";
  files.forEach(file => {
    const extension = file.ext;
    const filename = file.name;
    const icon =  getClassNameForExtension(extension);
    console.log("Icon found for file.ext", icon)
    const context = {icon: icon, name: file.name, fullname: file.path};
    const html = fileTemplate(context);
    document.getElementById("dropzone").innerHTML += html;
  });
};

const onDrag = (event, filePath) => {
  event.preventDefault();
  console.log("Dragging");
  ipcRenderer.send('ondragstart', filePath);
};

const removeAllFiles = () => {
  files = [];
  updateFiles();
};

const removeFile = (fileName) => {
  console.log("removing");
  files = files.filter(file => file.path != fileName);
  updateFiles();
};
document.ondragover = document.ondrop = (ev) => {
  ev.preventDefault();
};


const updateFiles = () => {
  ipcRenderer.send('update_files', files.map(file => file.path));
};

const onDrop = (event) => {
  event.preventDefault();
  const recfiles = [...event.dataTransfer.files];
  ipcRenderer.send(
    'dropped_files',
    recfiles.map(file => file.path)
  );
};
