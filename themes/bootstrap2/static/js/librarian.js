import { statusAppend, sanitiseKey, lowerize, isDoi, storkInit } from './util.js';
import { openGitHub, uploadFile } from './github.js';

let addButton = document.getElementById('add-button');
var stork_input = document.getElementById('stork-input');
let dropArea = document.getElementById('drop-area');
let dt = [];
let bibStr = "";

var bibFile;

window.storkInit = storkInit;

stork_input.addEventListener("change", updateSearch, false);
stork_input.addEventListener("paste", detectPaste, false);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {dropArea.addEventListener(eventName, preventDefaults, false)});
['dragenter', 'dragover'].forEach(eventName => {dropArea.addEventListener(eventName, highlight, false)});
['dragleave', 'drop'].forEach(eventName => {dropArea.addEventListener(eventName, unhighlight, false)});
dropArea.addEventListener('drop', handleDrop, false)

const target = document.querySelector("div.target");

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

function highlight(e) {
  dropArea.classList.add('highlight')
}

function unhighlight(e) {
  dropArea.classList.remove('highlight')
}

function handleDrop(e) {
  dt = e.dataTransfer;
  var len = dt.files.length;

  // if (len != 1) {
  //   console.log("not supported: dropped files #" + len);
  //   return;
  // }

  for (var i = 0; i < len; ++i) {
    var theFile = dt.files[i];
    var fileName = theFile.name;

    statusAppend("processing dropped file #" + i + ": " + fileName);

    if (fileName.endsWith(".bib") || fileName.endsWith(".txt") || fileName.endsWith(".rst")) {
      uploadBib(theFile);
    }
    else if (
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".epub") ||
      fileName.endsWith(".mobi") ||
      fileName.endsWith(".azw3") ||
      fileName.endsWith(".jpg")   
      ) {
      uploadFile("librarian", theFile);
    }
    else {
      statusAppend("unsupported format: " + fileName);
    }
  }
}

const copyBib = async () => {
  try {
    let text = document.getElementById('bib').innerHTML;
    await navigator.clipboard.writeText(text);
    statusAppend('Content copied to clipboard');
  } catch (err) {
    statusAppend('Failed to copy: ', err);
  }
}

function triggerStorkSearch(str) {
  console.log('triggerStorkSearch: ' + str);
  stork_input.value = str;
  stork_input.dispatchEvent(new Event('input', { bubbles: true }));
}

function outFunc() {
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copy to clipboard";
}

function confirmBib() {
  uploadBib(dt, true);
}

async function processBib(aBibStr, fileName, force = false) {

  var bibStr = aBibStr.trim();
  console.log("processBib: " + bibStr);
  statusAppend("processing bib: " + bibStr);

  try {
    var bibJSONs = bibtexParse.toJSON(bibStr);
    
    for (var bibJSON of bibJSONs) {
      console.log(bibJSON);

      var key = bibJSON.citationKey;
      console.log("key: " + key);

      var sanitisedKey = sanitiseKey(key);
      bibJSON.citationKey = sanitisedKey;

      bibJSON.entryTags = lowerize(bibJSON.entryTags);
      var tags = bibJSON.entryTags;
      console.log("tags: " + JSON.stringify(tags));

      var title = "";

      if ("title" in tags) {
        title = tags["title"];
      }
      else {
        title = "";
      }

      console.log("title: " + title);

      var searchString = title; //key + " " + title;
      var searchResults = stork.search("sitesearch", searchString);

      if (!force && (searchResults.total_hit_count > 0 && searchResults.results[0].score > 2000)) {
        console.log("bib already exists: " + searchResults.total_hit_count);
        console.log("results: ");
        console.log(searchResults.results)

        stork.search("sitesearch", searchString);
        // triggerStorkSearch(str);
        addButton.style.display = "block";

      }
      else {

        // date-added    = "2018-12-22 10:50:04 +0100",
        var currentdate = new Date(); 
        var datetime =
          currentdate.getFullYear() + "-" +
          (currentdate.getMonth()+1) + "-" +
          currentdate.getDate() + " " +
          currentdate.getHours() + ":" +
          currentdate.getMinutes() + ":" +
          currentdate.getSeconds() +
          " +0100";

        bibJSON.entryTags["date-added"] = datetime;
        console.log(datetime);
        
        var bibStr = bibtexParse.toBibtex([bibJSON], false);
        bibStr = bibStr.trim();
        console.log(bibStr);

        var url = openGitHub("librarian", key, fileName, bibStr);
        addButton.style.display = "none";
      
      }
    }
  } catch (err) {
    console.error('Failed to parse bib: ', err);
  }
}

async function uploadBib(bibFile, force = false) {
  console.log("uploadBib: " + bibFile + ", force: " + force);

  if (force) {
    processBib(bibStr, "", force);
  }
  else {
    let fileName = "";
    
    var reader = new FileReader();
    reader.readAsText(bibFile, "UTF-8");
    reader.onload = function (evt) {
      var bibStr = evt.target.result;

      if (bibFile.name !== null) {
        fileName = bibFile.name;
      }
      
      console.log("File name: " + fileName);
      processBib(bibStr, fileName, force);

    }
    reader.onerror = function (evt) {
      console.log("error reading file");
    }
  }
}

async function getBib(articleUrl) {

    articleUrl = articleUrl.trim();

    // https://doi.org/10.1007/s10883-019-09441-w
    // dx.doi.org/10.2140/obs.2019.2.119
    if (articleUrl.includes("doi.org")) {

      if (!articleUrl.startsWith("https://")) {
        articleUrl = "https://" + articleUrl;
      }

      doi2bib(articleUrl, bibStr => { processBib(bibStr, ""); });
    }
    else if (isDoi(articleUrl)) {
      console.log("naked doi detected: " + articleUrl);
      articleUrl = "https://doi.org/" + articleUrl;
      doi2bib(articleUrl, bibStr => { processBib(bibStr, ""); });
    }
    else {
      statusAppend("URL not recognised: " + articleUrl);
    }
}

async function updateSearch() {
  console.log("stork update search: " + stork_input.value);
  getBib(stork_input.value);
}

function detectPaste(event) {
  // event.preventDefault();
  let paste = (event.clipboardData || window.clipboardData).getData("text");
  processBib(paste, "");
};
