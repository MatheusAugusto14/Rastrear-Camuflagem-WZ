// === Dados ===
const classes = {
  "Fuzis de Assalto": ["XM4", "AK‑74", "AMES 85", "GPR 91", "Model L", "Goblin MK 2", "AS VAL"],
  "SMTs (Submetralhadoras)": ["C9", "KSV", "Tanto .22", "PP‑919", "Jackal PDW", "Kompakt 92"],
  "Escopetas": ["Marine SP", "ASG‑89"],
  "MLs (Metralhadoras Leves)": ["PU‑21", "XMG", "GPMG‑7"],
  "Fuzis de Atirador": ["SWAT 5.56", "Tsarkov 7.62", "AEK‑973", "DM‑10"],
  "Fuzis de Precisão": ["LW3A1 Frostline", "SVD", "LR 7.62"],
  "Pistolas": ["9mm PM", "Grekhova", "GS45", "Stryder .22"],
  "Lançadores": ["Cigma 2B", "HE‑1"],
  "Corpo a Corpo": ["Faca", "Taco de Beisebol"]
}

// === Mapa auxiliar: arma -> classe ===
const weaponToClass = {};
Object.keys(classes).forEach((cls) => {
  classes[cls].forEach((w) => {
    weaponToClass[w] = cls;
  });
});
;

const challenges = ["resgate", "catalisador", "abismo"];
let progress = JSON.parse(localStorage.getItem("progress")) || {};
let currentCamo = localStorage.getItem("currentCamo") || "resgate";

// Visão atual: "all", "faltando" ou "class:<nome>"
let currentView = "all";

// === Util ===
function saveProgress() {
  localStorage.setItem("progress", JSON.stringify(progress));
  localStorage.setItem("currentCamo", currentCamo);
}

function setWeaponsGrid() {
  const outer = document.getElementById("weapons-container");
  if (!outer) return document.body; // fallback
  // usar wrapper se existir
  let container = outer.querySelector(".weapon-grid");
  if (!container) container = outer;
  outer.classList.add("grid");
  return container;
}

function makeWeaponCard(weapon) {
  const div = document.createElement("div");
  div.className = "weapon-card";
  if (progress[weapon]?.[currentCamo]) div.classList.add("completed");

  // Estrutura do card: nome + (classe quando necessário)
  const title = document.createElement("div");
  title.className = "weapon-name";
  title.textContent = weapon;
  div.appendChild(title);

  if (currentView === "all" || currentView === "faltando") {
    const sub = document.createElement("div");
    sub.className = "weapon-class-sub";
    sub.textContent = weaponToClass[weapon] || "";
    div.appendChild(sub);
  }

  div.onclick = () => toggleWeapon(weapon);
  return div;
}

// === Render ===
function renderDashboard() {
  document.getElementById("current-camo").value = currentCamo;
  updateOverallProgress();
  renderClassCards();

  updateClassCardsVisibility();
}

function renderClassCards() {
  const container = document.getElementById("classes-container");
  container.innerHTML = "";
  Object.keys(classes).forEach(cls => {
    const card = document.createElement("div");
    card.className = "class-card";
    card.textContent = cls;
    card.onclick = () => renderWeapons(cls);
    container.appendChild(card);
  });
}
// === Controle de visibilidade dos cards de classe ===
function updateClassCardsVisibility() {
  const container = document.getElementById("classes-container");
  if (!container) return;
  if (currentView === "all" || currentView === "faltando") {
    container.style.display = "none";
  } else {
    container.style.display = "";
  }
}


function renderWeapons(cls) {
  currentView = "class:" + cls;
  const container = setWeaponsGrid();
  container.innerHTML = "";
  classes[cls].forEach(weapon => container.appendChild(makeWeaponCard(weapon)));

  updateClassCardsVisibility();
}

function renderAllWeapons() {
  currentView = "all";
  const container = setWeaponsGrid();
  container.innerHTML = "";
  Object.values(classes).flat().forEach(weapon => container.appendChild(makeWeaponCard(weapon)));

  updateClassCardsVisibility();
}

function renderMissingWeapons() {
  currentView = "faltando";
  const container = setWeaponsGrid();
  container.innerHTML = "";
  const all = Object.values(classes).flat();
  const missing = all.filter(w => !progress[w]?.[currentCamo]);
  if (missing.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Nada faltando para esta camuflagem. 🎉";
    container.appendChild(p);
  } else {
    missing.forEach(weapon => container.appendChild(makeWeaponCard(weapon)));
  }

  updateClassCardsVisibility();
}

function toggleWeapon(weapon) {
  if (!progress[weapon]) progress[weapon] = {};
  progress[weapon][currentCamo] = !progress[weapon][currentCamo];
  saveProgress();

  // Re-renderiza somente a visão atual
  if (currentView === "all") {
    renderAllWeaponsGrouped();
  } else if (currentView === "faltando") {
    renderMissingWeaponsGrouped();
  } else if (currentView.startsWith("class:")) {
    renderWeapons(currentView.split(":")[1]);
  } else {
    renderAllWeaponsGrouped(); // fallback
  }

  updateOverallProgress();
}

function updateOverallProgress() {
  const allWeapons = Object.values(classes).flat();
  const done = allWeapons.filter(w => progress[w]?.[currentCamo]).length;
  const percent = Math.round((done / allWeapons.length) * 100);

  // Mantém apenas a barra de progresso, remove o texto do contador
  document.getElementById("overall-progress").style.width = percent + "%";
  // document.getElementById("progress-text").textContent = `${done}/${allWeapons.length} armas concluídas (${percent}%)`;
}

// === Eventos ===
document.getElementById("current-camo").onchange = e => {
  currentCamo = e.target.value;
  saveProgress();
  // Ao trocar de camo, mantém a visão atual
  if (currentView === "all") renderAllWeaponsGrouped();
  else if (currentView === "faltando") renderMissingWeaponsGrouped();
  else if (currentView.startsWith("class:")) renderWeapons(currentView.split(":")[1]);
  updateOverallProgress();
};

document.getElementById("mark-all").onclick = () => {
  if (currentView === "all") {
    Object.values(classes).flat().forEach(w => {
      if (!progress[w]) progress[w] = {};
      progress[w][currentCamo] = true;
    });
    renderAllWeaponsGrouped();

  } else if (currentView === "faltando") {
    Object.values(classes).flat().forEach(w => {
      if (!progress[w]?.[currentCamo]) {
        if (!progress[w]) progress[w] = {};
        progress[w][currentCamo] = true;
      }
    });
    renderMissingWeaponsGrouped();

  } else if (currentView.startsWith("class:")) {
    const cls = currentView.split(":")[1];
    classes[cls].forEach(w => {
      if (!progress[w]) progress[w] = {};
      progress[w][currentCamo] = true;
    });
    renderWeapons(cls);
  } else {
    // fallback
    Object.values(classes).flat().forEach(w => {
      if (!progress[w]) progress[w] = {};
      progress[w][currentCamo] = true;
    });
    renderAllWeaponsGrouped();
  }

  saveProgress();
  updateOverallProgress();
};

document.getElementById("view-all").onclick = () => { currentView = "all"; renderAllWeaponsGrouped(); updateClassCardsVisibility(); };
document.getElementById("view-missing").onclick = () => { currentView = "faltando"; renderMissingWeaponsGrouped(); updateClassCardsVisibility(); };

// === Inicialização ===
renderDashboard();
renderAllWeaponsGrouped();



// === Agrupado por classes ===
function renderAllWeaponsGrouped() {
  updateClassCardsVisibility();
  const container = document.getElementById("weapons-container");
  container.innerHTML = "";
  for (const cls in classes) {
    const title = document.createElement("h2");
    title.className = "weapon-class-title";
    title.textContent = cls;
    container.appendChild(title);
    const grid = document.createElement("div");
    grid.className = "weapon-grid";
    classes[cls].forEach(weapon => {
      const card = makeWeaponCard(weapon);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }
}

function renderMissingWeaponsGrouped() {
  updateClassCardsVisibility();
  const container = document.getElementById("weapons-container");
  container.innerHTML = "";
  for (const cls in classes) {
    const missing = classes[cls].filter(w => !(progress[w] && progress[w][currentCamo]));
    if (missing.length === 0) continue;
    const title = document.createElement("h2");
    title.className = "weapon-class-title";
    title.textContent = cls;
    container.appendChild(title);
    const grid = document.createElement("div");
    grid.className = "weapon-grid";
    missing.forEach(weapon => {
      const card = makeWeaponCard(weapon);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }
}

