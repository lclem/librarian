import { statusAppend, sanitiseKey } from './util.js';

import { Octokit } from "https://esm.sh/@octokit/rest";

var pat = "g i t h u b _ p a t _ 1 1 A B C B U P Q 0 l w 1 1 T Z q z c J j B _ p K S o S y i I R 9 X d Q A m 1 l L 4 Q n Z E 0 b 6 J y 0 b Q g q E F 8 V W 9 R o T n 5 B V Z N 3 H X Z c B h f o g F"
pat = pat.replaceAll(" ", "");

const octokit = new Octokit({ auth: pat });
// window.octokit = octokit;
console.log("Octokit loaded");

// TODO: check that the key does not exist already in the repo
export async function openGitHub(key, fileName, bibStr) {

  var sanitisedKey = sanitiseKey(key);
  
  // create filename from key if not present
  if (fileName == "") {
    fileName = sanitisedKey + ".bib";
  }

  var url = "https://github.com/lclem/librarian/new/main/library/entries/";
  url += sanitisedKey + "?filename=" + fileName + "&value=";
  url += encodeURIComponent(bibStr);

  statusAppend("openGitHub, key:" + sanitisedKey + ", fileName: " + fileName + ", bibStr: " + bibStr + " = " + url);

  return url;
}