import { statusAppend } from './util.js';
let val = hello();  // val is "Hello";

let addButton = document.getElementById('add-button');
var stork_input = document.getElementById('stork-input');
let dropArea = document.getElementById('drop-area');
let status = document.getElementById('status');
let dt = [];
let bibStr = "";

var bibFile;

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

  if (len != 1) {
    console.log("not supported: dropped files #" + len);
    return;
  }

  var theFile = dt.files[0];
  var fileName = theFile.name;

  if (fileName.endsWith(".bib") || fileName.endsWith(".txt")) {
    uploadBib(dt);
  }
  else if (fileName.endsWith(".pdf")) {
    uploadPdf(theFile);
  }
  else {
    console.log("unsupported format: " + fileName);
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

  newKey = key.replaceAll("/", "_");
  newKey = newKey.replaceAll(":", "_");
  console.log("sanitising key " + key + " --> " + newKey);

  return newKey;
  
}

// TODO: check that the key does not exist already in the repo
async function openGitHub(key, fileName, bibStr) {

  sanitisedKey = sanitiseKey(key);
  
  // create filename from key if not present
  if (fileName == "") {
    fileName = sanitisedKey + ".bib";
  }

  url = "https://github.com/lclem/librarian/new/main/library/entries/";
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

  bibStr = aBibStr.trim();
  console.log("processBib: " + bibStr);
  statusAppend("processing bib: " + bibStr);

  try {
    bibJSONs = bibtexParse.toJSON(bibStr);

    for (bibJSON of bibJSONs) {
      console.log(bibJSON);

      key = bibJSON.citationKey;
      console.log("key: " + key);

      sanitisedKey = sanitiseKey(key);
      bibJSON.citationKey = sanitisedKey;

      bibJSON.entryTags = lowerize(bibJSON.entryTags);
      tags = bibJSON.entryTags;
      console.log("tags: " + JSON.stringify(tags));

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
        
        bibStr = bibtexParse.toBibtex([bibJSON], false);
        bibStr = bibStr.trim();
        console.log(bibStr);

        openGitHub(key, fileName, bibStr);
      }
    }
  } catch (err) {
    console.error('Failed to parse bib: ', err);
  }
}

async function uploadBib(inp, force = false) {
  console.log("uploadBib: " + inp + ", force: " + force);

  if (force) {
    processBib(bibStr, "", force);
  }
  else {
    bibFile = inp.files[0];

    let fileName = "";
    
    var reader = new FileReader();
    reader.readAsText(bibFile, "UTF-8");
    reader.onload = function (evt) {
      bibStr = evt.target.result;

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

  xmlhttp = getXmlHttp();
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

// TODO: if we are creating a new bib entry,
// then also automatically add the dropped pdf to the corresponding git folder

async function uploadPdf(thePdf) {

  console.log(thePdf);
  var fileName = thePdf.name;

  // if we are on an article page,
  // dropping a PDF means "add this PDF to this entry"
  if(document.getElementById('title_label') != null){ // && document.getElementById('PDF_label') == null) {

    const articleUrl = document.getElementById('article_url');
    console.log("PDF dropped on article page, url: " + articleUrl);

    pdfContents = await toBase64(thePdf);
    pdfContents = pdfContents.slice(pdfContents.indexOf(",") + 1);
    // console.log("pdfContents: " + pdfContents);

    var rootFolder = document.getElementById('article_rootfolder').getAttribute("href");
    console.log("rootFolder: " + rootFolder);
    path = "library/entries/" + rootFolder.split("/").slice(-1) + "/";

    fileName = encodeURIComponent(fileName);
    putRequest = 'PUT /repos/lclem/librarian/contents/' + path + fileName;
    statusAppend("put request: " + putRequest);

    const result = await octokit.request(putRequest, {
      accept: 'application/vnd.github+json',
      owner: 'lclem',
      repo: 'librarian',
      path: fileName,
      message: 'PDF upload',
      committer: {
        name: 'Lorenzo C',
        email: 'clementelorenzo@gmail.com'
      },
      content: pdfContents,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log(result.data);
    window.open(rootFolder, "_blank");
    
    commitUrl = result.data.commit.html_url;
    statusAppend(commitUrl);
  }
}

function detectPaste(event) {
  // event.preventDefault();
  let paste = (event.clipboardData || window.clipboardData).getData("text");
  processBib(paste, "");
};
