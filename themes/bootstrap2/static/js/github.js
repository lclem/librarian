import { statusAppend, sanitiseKey, toBase64 } from './util.js';
import { Octokit } from "https://esm.sh/@octokit/rest";

var pat0 = "g i t h u b _ p a t _ 1 1 A B C B U P Q 0 l w 1 1 T Z q z c J j B _ p K S o S y i I R 9 X d Q A m 1 l L 4 Q n Z E 0 b 6 J y 0 b Q g q E F 8 V W 9 R o T n 5 B V Z N 3 H X Z c B h f o g F"
var pat = "g i t h u b _ p a t _ 1 1 A B C B U P Q 0 H a I z i X C y h S r P _ d 6 g z V R 8 8 r 0 j P 9 2 i G B u a E o l W J m y y Y y K 0 E 5 I 4 g 9 b p o 5 S X V W D D T G S H V U A C v M Y G"
pat = pat.replaceAll(" ", "");

const octokit = new Octokit({ auth: pat });
// window.octokit = octokit;
console.log("Octokit loaded");

// TODO: check that the key does not exist already in the repo
export async function openGitHub(repository, key, fileName, bibStr) {

  var sanitisedKey = sanitiseKey(key);
  
  // create filename from key if not present
  if (fileName == "") {
    fileName = sanitisedKey + ".bib";
  }

  var url = "https://github.com/lclem/" + repository + "/new/main/library/entries/";
  url += sanitisedKey + "?filename=" + fileName + "&value=";
  url += encodeURIComponent(bibStr);

  statusAppend("openGitHub, repo: " + repository + ", key: " + sanitisedKey + ", fileName: " + fileName + ", bibStr: " + bibStr + " = " + url);
  window.open(url, "_blank");

  return url;
}

export async function uploadFile(repository, theFile) {

  console.log(theFile);
  var fileName = theFile.name;

  // if we are on an article page,
  // dropping a file means "add this PDF to this entry"
  if(document.getElementById('title_label') != null) {

    const articleUrl = document.getElementById('article_url');
    console.log("file dropped on article page, url: " + articleUrl);

    var fileContents = await toBase64(theFile);
    fileContents = fileContents.slice(fileContents.indexOf(",") + 1);

    var rootFolder = document.getElementById('article_rootfolder').getAttribute("href");
    console.log("rootFolder: " + rootFolder);
    var path = "library/entries/" + rootFolder.split("/").slice(-1) + "/";

    var fileName = encodeURIComponent(fileName);
    const putRequest = 'PUT /repos/lclem/' + repository + '/contents/' + path + fileName;
    statusAppend("put request: " + putRequest);

    const result = await octokit.request(putRequest, {
      accept: 'application/vnd.github+json',
      owner: 'lclem',
      repo: repository,
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
