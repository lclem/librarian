let status = document.getElementById('status');

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export async function storkInit(siteurl) {
  stork.initialize(siteurl + "/theme/js/stork-1.6/stork.wasm");
  var options = {showScores: false};
  
  const deferred = async function() {
    stork.register("sitesearch", siteurl + "/search-index.st", options);
    console.log("stork initialised");
  };
  
  deferred();
}

export function statusAppend(str) {
  console.log(str);
  status.innerText = str + "\n" + status.innerText;
}

export const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

export function isDoi(str) {
  var rx = /^10\.[0-9][0-9][0-9][0-9][0-9]*\//;
  var matches = rx.exec(str);
  return matches !== null && matches.length > 0;
}

export const lowerize = obj =>
  Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {});

export function getXmlHttp() {
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
export async function getWebPage(theUrl, callback) {

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

// TODO: improve
export function sanitiseKey(key) {

  var newKey = key.replaceAll("/", "_");
  newKey = newKey.replaceAll(":", "_");
  console.log("sanitising key " + key + " --> " + newKey);

  return newKey;
  
}

// get bib information given the doi
export async function doi2bib(doiUrl, callback) {

  statusAppend("doi: " + doiUrl);

  var xmlhttp = getXmlHttp();
  xmlhttp.onreadystatechange = async function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let res = xmlhttp.responseText;
      console.log("doi2bib: " + res);
      callback(res);
    }
  }

  xmlhttp.open("GET", doiUrl, false);
  xmlhttp.setRequestHeader('Accept', 'application/x-bibtex; charset=utf-8');
  xmlhttp.send();
  
}