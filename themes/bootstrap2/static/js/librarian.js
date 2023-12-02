import { statusAppend } from './util.js';
// import "./bibtexParse.js";

//{toBibtex, toJSON}

let addButton = document.getElementById('add-button');
var stork_input = document.getElementById('stork-input');
let dropArea = document.getElementById('drop-area');
let dt = [];
let bibStr = "";

var bibFile;

async function storkInit(siteurl) {
		stork.initialize(siteurl + "/theme/js/stork-1.6/stork.wasm");
		const options = {showScores: false};
		
		const deferred = async function() {
      stork.register("sitesearch", siteurl + "/search-index.st", options);
      console.log("stork initialised");
      };
		
		deferred();
}

// export the function
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
      fileName.endsWith(".azw3")   
      ) {
      uploadFile(theFile);
    }
    else {
      console.log("unsupported format: " + fileName);
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

function isDoi(str) {
    var rx = /^10\.[0-9][0-9][0-9][0-9][0-9]*\//;
    var matches = rx.exec(str);
    return matches !== null && matches.length > 0;
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

// TODO: improve
function sanitiseKey(key) {

  var newKey = key.replaceAll("/", "_");
  newKey = newKey.replaceAll(":", "_");
  console.log("sanitising key " + key + " --> " + newKey);

  return newKey;
  
}

// TODO: check that the key does not exist already in the repo
async function openGitHub(key, fileName, bibStr) {

  var sanitisedKey = sanitiseKey(key);
  
  // create filename from key if not present
  if (fileName == "") {
    fileName = sanitisedKey + ".bib";
  }

  var url = "https://github.com/lclem/librarian/new/main/library/entries/";
  url += sanitisedKey + "?filename=" + fileName + "&value=";
  url += encodeURIComponent(bibStr);

  statusAppend("openGitHub, key:" + sanitisedKey + ", fileName: " + fileName + ", bibStr: " + bibStr + " = " + url);

  window.open(url, "_blank");
  addButton.style.display = "none";
}

const lowerize = obj =>
  Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {});

async function processBib(aBibStr, fileName, force = false) {

  var bibStr = aBibStr.trim();
  console.log("processBib: " + bibStr);
  statusAppend("processing bib: " + bibStr);

  try {
    var bibJSONs = bibtexParse.toJSON(bibStr);

    for (bibJSON of bibJSONs) {
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

      searchString = title; //key + " " + title;
      searchResults = stork.search("sitesearch", searchString);

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

        openGitHub(key, fileName, bibStr);
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

function getXmlHttp() {
  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
  }
  else {// code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return xmlhttp;
}

// given a url fetch its contents and invoke the callback function on the result
async function getWebPage(theUrl, callback) {

  statusAppend("getting url: " + theUrl);

  var xmlhttp = getXmlHttp();
  xmlhttp.onreadystatechange = async function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let res = xmlhttp.responseText;
      console.log("res: " + res);
      callback(res);
    }
    else {
      statusAppend("status: " + xmlhttp.status);
    }
  }

  try {
    xmlhttp.open("GET", theUrl, false);
    xmlhttp.send();
  } catch (err) {
    statusAppend('GET error: ', err);
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

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

async function uploadFile(theFile) {

  console.log(theFile);
  var fileName = theFile.name;

  // if we are on an article page,
  // dropping a file means "add this PDF to this entry"
  if(document.getElementById('title_label') != null){

    const articleUrl = document.getElementById('article_url');
    console.log("file dropped on article page, url: " + articleUrl);

    var fileContents = await toBase64(theFile);
    fileContents = fileContents.slice(fileContents.indexOf(",") + 1);

    var rootFolder = document.getElementById('article_rootfolder').getAttribute("href");
    console.log("rootFolder: " + rootFolder);
    var path = "library/entries/" + rootFolder.split("/").slice(-1) + "/";

    var fileName = encodeURIComponent(fileName);
    const putRequest = 'PUT /repos/lclem/librarian/contents/' + path + fileName;
    statusAppend("put request: " + putRequest);

    const result = await octokit.request(putRequest, {
      accept: 'application/vnd.github+json',
      owner: 'lclem',
      repo: 'librarian',
      path: fileName,
      message: 'file upload',
      committer: {
        name: 'Lorenzo C',
        email: 'clementelorenzo@gmail.com'
      },
      content: fileContents,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log(result.data);
    window.open(rootFolder, "_blank");
    
    const commitUrl = result.data.commit.html_url;
    statusAppend(commitUrl);
  }
}

function detectPaste(event) {
  // event.preventDefault();
  let paste = (event.clipboardData || window.clipboardData).getData("text");
  processBib(paste, "");
};
