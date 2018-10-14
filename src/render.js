// In renderer process (web page).
const {ipcRenderer} = require('electron');
const Handlebars = require('handlebars');
const typeIcons = require('./typeicons.json');
ipcRenderer.send('ready');
const source = document.getElementById("file-template").innerHTML;
const fileTemplate = Handlebars.compile(source);
const emptySource = document.getElementById("empty-template").innerHTML;
const emptyTemplate = Handlebars.compile(emptySource);
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
    console.log(typeIcons);
    const extension = file.split('.').pop();
    const filename = file.split('/').pop();
    const icon =  typeIcons[extension] || typeIcons["default"];
    const context = {icon: icon, name: filename, fullname: file};
    const html = fileTemplate(context);
    document.getElementById("dropzone").innerHTML += html;
  });
};

const onDrag = (event, filePath) => {
  event.preventDefault();
  ipcRenderer.send('ondragstart', filePath);
};
const onDragEnd = (event, filePath) => {
  console.log("drag end", filePath);
};

const removeAllFiles = () => {
  files = [];
  renderFiles();
};

const removeFile = (fileName) => {
  files = files.filter(file => file != fileName);
  renderFiles();
};
