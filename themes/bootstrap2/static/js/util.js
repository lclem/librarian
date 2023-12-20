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
export async function getWebPage(theUrl, callback, callback1 = null) {

  statusAppend("getting url: " + theUrl);

  var xmlhttp = getXmlHttp();
  xmlhttp.onreadystatechange = async function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let res = xmlhttp.responseText;
      console.log("res: " + res);
      callback(res);
    }
    else {
      statusAppend(`status: ${xmlhttp.status}, readyState: ${xmlhttp.readyState}`);
    }
  }

  try {
    xmlhttp.open("GET", theUrl, true); // async behaviour

    // these headers seem to create problems with CORS
    // Access to XMLHttpRequest at 'https://raw.githubusercontent.com/lclem/bibliographer/main//library/entries/Hollings_2009tk/Hollings:2009tk.bib'
    // from origin 'https://lclem.github.io' has been blocked by CORS policy:
    // Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
    
    // disable caching
    // xmlhttp.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
    // fallbacks for IE and older browsers:
    // xmlhttp.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
    // xmlhttp.setRequestHeader("Pragma", "no-cache"); //required for Chrome
    
    xmlhttp.onabort = callback1;
    xmlhttp.onerror = callback1;
    xmlhttp.onload = callback1;
    xmlhttp.onloadend = callback1;
    xmlhttp.onloadstart = callback1;
    xmlhttp.onprogress = callback1;
    xmlhttp.ontimeout = callback1;
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

export function load_elapsed() {
  var elem = document.getElementById("time_elapsed");
  var site_url = elem.getAttribute("site_url");
  
  getWebPage(site_url + "/elapsed.txt", (text) => {
    elem.innerHTML = text;
  });
}
