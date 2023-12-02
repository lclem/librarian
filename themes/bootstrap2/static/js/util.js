let status = document.getElementById('status');

export function statusAppend(str) {
  console.log(str);
  status.innerText = str + "\n" + status.innerText;
}
