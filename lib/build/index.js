
const path = require('path');
const fs = require('fs');
const projectRootPath = process.cwd();

const settingMatchKey = '{#settings}'
const mainMatchKey = '{#main}'
const engineMatchKey = '{#cocosengine}'
const projectMatchKey = '{#project}'
const resMapMatchKey = '{#resMap}'
const ttfMapMatchKey = '{#ttfMap}'

const fileByteList = ['.png', '.jpg', '.mp3', '.ttf', '.plist', 'txt'];

const base64PrefixList = {
  '.png' : 'data:image/png;base64,',
  '.jpg' : 'data:image/jpeg;base64,',
  '.mp3' : '',
  '.ttf' : '',
  '.plist' : 'data:text/plist;base64,'
}


htmlPath = projectRootPath + '/build/web-mobile/index.html'
newHtmlPath = './index.html'
settingScrPath = projectRootPath + '/build/web-mobile/src/settings.js'
mainScrPath = projectRootPath + '/build/web-mobile/main.js'
engineScrPath = projectRootPath + '/build/web-mobile/cocos2d-js-min.js'
projectScrPath = projectRootPath + '/build/web-mobile/assets/main/index.js'
resPath = projectRootPath + '/build/web-mobile/assets'
indexInternalScrPath = projectRootPath + '/build/web-mobile/assets/internal/index.js'



function read_in_chunks (filePath) {

  const extName = path.extname(filePath);


  if(fileByteList.includes(extName)) {
    // console.log(fs.readFileSync(filePath))
    return base64PrefixList[extName]+fs.readFileSync(filePath).toString('base64')
  }
 
  
  return fs.readFileSync(filePath).toString()

}

function addPlistSupport(mainStr) {
  return mainStr.replace("json: jsonBufferHandler,", "json: jsonBufferHandler, plist: jsonBufferHandler,")
}


function fixEngineError(engineStr) {
  return engineStr.replace("t.content instanceof Image", "t.content.tagName === \"IMG\"")
}

function getResMap(jsonObj, path, resPath) {
 

  const fileList = fs.readdirSync(path);

  fileList.forEach((fileName)=>{
    let absPath = path + '/' + fileName;
    const state = fs.statSync(absPath);
    const isdir = state.isDirectory();
  
    if(isdir) {
      getResMap(jsonObj, absPath, resPath)
    } else if(state.isFile() && !absPath.includes("main/index.js")) {
      let dataStr = read_in_chunks(absPath);

      if(dataStr) {
        absPath = absPath.replace(resPath + '/', '');
        jsonObj[absPath] = dataStr
      }
    } 


  })


}



function getResMapScript(resPath) {
  let jsonObj = {}
  getResMap(jsonObj, resPath, resPath);
  return "window.resMap = "+JSON.stringify(jsonObj)
}


function writeToPath(path, data) {
  fs.writeFileSync(path, data)
  const stat = fs.statSync(path);
  const size = Math.ceil(stat.size * 1000 / (1024 * 1024)) / 1000
  console.log("===================  All Done! =================== ")
  console.log(`Target file = ${path}, with size ${size}M`)

}



function integrate() {
  let htmlStr = read_in_chunks(htmlPath);
  let settingsStr = read_in_chunks(settingScrPath);
  let projectStr = read_in_chunks(projectScrPath);

  let mainStr = read_in_chunks(mainScrPath);
  mainStr = addPlistSupport(mainStr);

  let engineStr = read_in_chunks(engineScrPath)
  engineStr = fixEngineError(engineStr);

  
  htmlStr = htmlStr.replace(settingMatchKey, settingsStr);
  htmlStr = htmlStr.replace(projectMatchKey, projectStr);
  htmlStr = htmlStr.replace(mainMatchKey, mainStr);
  htmlStr = htmlStr.replace(engineMatchKey, engineStr)

  let resStr = getResMapScript(resPath)

  htmlStr = htmlStr.replace(resMapMatchKey, resStr)
  writeToPath(newHtmlPath, htmlStr)

 
}


module.exports = {
  integrate
}  
