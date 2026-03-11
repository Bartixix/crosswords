let height;
let width;
let cells;

let puzzleRoot = document.getElementById("puzzle");
let sidebarRoot = document.getElementById("sidebar");

document
  .getElementById("sidebar-btn")
  .addEventListener("click", () => ToggleSidebar());

PopulateSidebar();

async function PopulateSidebar() {
  let sidebarRoot = document.getElementById("sidebar");
  let response = await fetch("./puzzles/list.json");

  let json = await response.json();

  for (let i = 0; i < json.length; i++) {
    let text = json[i].Page;
    let src = json[i].Src;

    let elem = document.createElement("button");
    elem.className = "puzzle-select";

    elem.addEventListener("click", () => DrawPuzzle(src));
    elem.innerText = text;

    sidebarRoot.appendChild(elem);
  }
}

async function DrawPuzzle(source) {
  puzzleRoot.innerHTML = "";

  let response = await fetch(source);
  let json = await response.json();

  document.getElementById("current-puzzle-id").innerText = json.Page;

  height = json.SizeY;
  width = json.SizeX;

  cells = Array(height * width);

  puzzleRoot.style.gridTemplateColumns = `repeat(${width + 1}, 2em)`;
  puzzleRoot.style.gridTemplateRows = `repeat(${height + 1}, 2em)`;

  for (let i = 0; i < json.Content.length; i++) {
    let key = json.Content[i];

    let x = key.RootX + 1;
    let y = key.RootY + 1;

    if (key.Horizontal) y++;
    else x++;

    PrintOrderingCell(key.Id, y, x);
    for (let j = 0; j < key.Text.length; j++) {
      if (key.Horizontal) x++;
      else y++;

      PrintKeyCell(key.Text[j], y, x, key.Id);
    }
  }
}

function PrintOrderingCell(id, row, col) {
  let elem = document.createElement("div");

  elem.className = `order-cell`;

  elem.style.gridRow = row;
  elem.style.gridColumn = col;

  elem.innerText = id;

  elem.addEventListener("click", () => Reveal(id));

  puzzleRoot.appendChild(elem);
}

function PrintKeyCell(key, row, col, orderingId) {
  let index = row * width + col;
  let elem;

  if (cells[index] == undefined) {
    elem = document.createElement("div");
    elem.className = `key-cell`;

    elem.setAttribute("data-id", orderingId);
    elem.setAttribute("data-key", key);

    elem.style.gridRow = row;
    elem.style.gridColumn = col;

    cells[index] = elem;
    puzzleRoot.appendChild(elem);

    return;
  }

  elem = cells[index];

  if (elem.getAttribute("data-key") != key)
    throw new Error("Overlap key is invalid.");

  let dataId = elem.getAttribute("data-id");
  elem.setAttribute("data-id", `${dataId} ${orderingId}`);
}

function Reveal(id) {
  let elems = document.querySelectorAll(`[data-id~="${id}"]`);

  for (let i = 0; i < elems.length; i++) {
    let char = elems[i].getAttribute("data-key");
    elems[i].innerText = char;
  }
}

function ToggleSidebar() {
  if (sidebarRoot.getAttribute("data-show") == "true")
    sidebarRoot.setAttribute("data-show", "false");
  else sidebarRoot.setAttribute("data-show", "true");
}
