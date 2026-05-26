// =========================
// LUMIA APP PREMIUM
// =========================

let timerInterval;
let deepInterval;

let totalSeconds = 1500;
let deepSeconds = 3000;

let currentAudio = null;

let worldLevel =
  parseInt(localStorage.getItem("worldLevel")) || 1;

let xp =
  parseInt(localStorage.getItem("lumiaXP")) || 65;

let focusSessions =
  parseInt(localStorage.getItem("focusSessions")) || 2;

let moodHistory =
  JSON.parse(localStorage.getItem("moodHistory")) || [];

let deferredPrompt = null;

// =========================
// LOAD
// =========================

window.addEventListener("load", () => {

  setTimeout(() => {

    const loading =
      document.getElementById("loadingScreen");

    if (loading) {
      loading.style.display = "none";
    }

  }, 1800);

  loadUser();

  updateWorld();

  updateXP();

  updateStats();

  generateParticles();

  applyTimeAtmosphere();

  loadJournal();

});

// =========================
// UI SOUNDS
// =========================

function uiSound(type = "click") {

  try {

    const audioCtx =
      new (window.AudioContext ||
      window.webkitAudioContext)();

    const oscillator =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();

    oscillator.connect(gain);

    gain.connect(audioCtx.destination);

    if (type === "success") {
      oscillator.frequency.value = 720;
    }

    else if (type === "calm") {
      oscillator.frequency.value = 260;
    }

    else {
      oscillator.frequency.value = 480;
    }

    gain.gain.setValueAtTime(
      0.035,
      audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.18
    );

    oscillator.start(audioCtx.currentTime);

    oscillator.stop(audioCtx.currentTime + 0.18);

  } catch (e) {}

}

// =========================
// LOGIN
// =========================

function loginUser() {

  uiSound("success");

  const name =
    document.getElementById("loginName").value;

  const email =
    document.getElementById("loginEmail").value;

  if (name.trim() === "") return;

  localStorage.setItem("lumiaUser", name);

  localStorage.setItem("lumiaEmail", email);

  document.getElementById("loginScreen")
    .style.display = "none";

  updateGreeting();

  notify("✨ Bienvenido a Lumia");

}

function loadUser() {

  const user =
    localStorage.getItem("lumiaUser");

  if (user) {

    document.getElementById("loginScreen")
      .style.display = "none";

    updateGreeting();

  }

}

function logoutUser() {

  uiSound();

  localStorage.removeItem("lumiaUser");

  localStorage.removeItem("lumiaEmail");

  location.reload();

}

function updateGreeting() {

  const user =
    localStorage.getItem("lumiaUser") || "usuario";

  document.getElementById("userGreeting")
    .innerHTML = `Hola ${user} 👋`;

}

// =========================
// PAGES
// =========================

function showPage(id, button) {

  uiSound();

  document.querySelectorAll(".page")
    .forEach(page => {
      page.classList.add("hidden");
    });

  document.getElementById(id)
    .classList.remove("hidden");

  document.querySelectorAll(".side-link")
    .forEach(btn => {
      btn.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

}

// =========================
// THEME
// =========================

function toggleTheme() {

  uiSound();

  document.body.classList.toggle("light");

}

// =========================
// TASKS
// =========================

function addTask() {

  const input =
    document.getElementById("taskInput");

  if (input.value.trim() === "") return;

  const card =
    document.createElement("div");

  card.className = "task-card";

  card.innerHTML = `
    <h3>✅ Nueva tarea</h3>
    <p>${input.value}</p>
  `;

  document.getElementById("taskList")
    .appendChild(card);

  input.value = "";

  addXP(10);

  updateStats();

  notify("✨ Tarea agregada");

  uiSound("success");

}

// =========================
// SUBJECTS
// =========================

function addSubject() {

  const input =
    document.getElementById("subjectInput");

  if (input.value.trim() === "") return;

  const card =
    document.createElement("div");

  card.className = "subject-card";

  card.innerHTML = `
    ${input.value}
    <span>${Math.floor(Math.random() * 100)}%</span>
  `;

  document.getElementById("subjectList")
    .appendChild(card);

  input.value = "";

  addXP(8);

  updateStats();

  notify("📚 Materia agregada");

}

// =========================
// TIMER
// =========================

function startTimer(minutes) {

  uiSound("success");

  clearInterval(timerInterval);

  totalSeconds = minutes * 60;

  timerInterval = setInterval(() => {

    totalSeconds--;

    const mins =
      Math.floor(totalSeconds / 60);

    const secs =
      totalSeconds % 60;

    document.getElementById("timer")
      .innerText =
      `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (totalSeconds <= 0) {

      clearInterval(timerInterval);

      focusSessions++;

      localStorage.setItem(
        "focusSessions",
        focusSessions
      );

      notify("🎉 Focus terminado");

      addXP(20);

      growWorldSoft();

      updateStats();

      uiSound("success");

    }

  }, 1000);

}

function resetTimer() {

  uiSound();

  clearInterval(timerInterval);

  document.getElementById("timer")
    .innerText = "25:00";

}

// =========================
// DEEP FOCUS
// =========================

function startDeepFocus() {

  uiSound("calm");

  clearInterval(deepInterval);

  deepSeconds = 3000;

  document.body.classList.add("galaxy-mode");

  deepInterval = setInterval(() => {

    deepSeconds--;

    const mins =
      Math.floor(deepSeconds / 60);

    const secs =
      deepSeconds % 60;

    document.getElementById("deepTimer")
      .innerText =
      `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (deepSeconds <= 0) {

      clearInterval(deepInterval);

      notify("🧘 Deep Focus completado");

      addXP(35);

      growWorldSoft();

    }

  }, 1000);

}

function exitDeepFocus() {

  uiSound();

  clearInterval(deepInterval);

  document.body.classList.remove("galaxy-mode");

  document.getElementById("deepTimer")
    .innerText = "50:00";

}

// =========================
// AMBIENT
// =========================

function playAmbient(type) {

  stopAmbient();

  uiSound("calm");

  const text =
    document.getElementById("ambientText");

  if (!text) return;

  if (type === "lofi") {

    text.innerText =
      "Ambiente: Lo-fi suave 🎧";

  }

  if (type === "rain") {

    text.innerText =
      "Ambiente: lluvia suave 🌧";

    document.body.classList.add("rain-mode");

  }

  if (type === "cafe") {

    text.innerText =
      "Ambiente: cafetería tranquila ☕";

  }

}

function stopAmbient() {

  if (currentAudio) {
    currentAudio.pause();
  }

  const text =
    document.getElementById("ambientText");

  if (text) {

    text.innerText =
      "Ambiente: silencio tranquilo.";

  }

}

// =========================
// MOODS
// =========================

function setMood(mood) {

  uiSound("calm");

  const result =
    document.getElementById("moodResult");

  const moods = {

    saturado:
      "Respirá. Bajemos el ruido.",

    cansado:
      "Descansar también es avanzar.",

    bien:
      "Buen momento para avanzar tranquilo.",

    motivado:
      "Tu energía está encendiendo Lumia 🔥"

  };

  result.innerText = moods[mood];

  moodHistory.push({
    mood,
    date:new Date().toISOString()
  });

  localStorage.setItem(
    "moodHistory",
    JSON.stringify(moodHistory)
  );

  updateWeatherWidget(mood);

  updatePetMessage(mood);

}

// =========================
// WEATHER
// =========================

function applyTimeAtmosphere() {

  const hour =
    new Date().getHours();

  if (hour >= 19 || hour <= 6) {

    document.body.classList.add("night-mode");

  }

}

function updateWeatherWidget(mood) {

  const title =
    document.getElementById("weatherTitle");

  const text =
    document.getElementById("weatherText");

  if (!title || !text) return;

  if (mood === "saturado") {

    title.innerText = "Lluvia suave";

    text.innerText =
      "El ambiente baja la intensidad.";

  }

  if (mood === "cansado") {

    title.innerText = "Niebla tranquila";

    text.innerText =
      "Hoy no hace falta correr.";

  }

  if (mood === "bien") {

    title.innerText = "Cielo claro";

    text.innerText =
      "Buen clima mental para avanzar.";

  }

  if (mood === "motivado") {

    title.innerText = "Galaxia activa";

    text.innerText =
      "Tu energía enciende Lumia.";

  }

}

function updatePetMessage(mood) {

  const pet =
    document.getElementById("petMessage");

  const petIcon =
    document.getElementById("lumiaPet");

  if (!pet || !petIcon) return;

  if (mood === "saturado") {

    pet.innerText =
      "No tenés que poder con todo.";

    petIcon.innerText = "🌧";

  }

  if (mood === "cansado") {

    pet.innerText =
      "Tu cuerpo también necesita pausa.";

    petIcon.innerText = "🌙";

  }

  if (mood === "bien") {

    pet.innerText =
      "Estoy listo para acompañarte.";

    petIcon.innerText = "🪐";

  }

  if (mood === "motivado") {

    pet.innerText =
      "Esa energía puede construir algo enorme.";

    petIcon.innerText = "🚀";

  }

}

// =========================
// CALM MODE
// =========================

function activateCalmMode() {

  uiSound("calm");

  notify("🌙 Modo calma activado");

  showPage("calma");

}

// =========================
// XP
// =========================

function addXP(amount) {

  xp += amount;

  if (xp > 100) {
    xp = 100;
  }

  localStorage.setItem("lumiaXP", xp);

  updateXP();

}

function updateXP() {

  const xpFill =
    document.getElementById("xpFill");

  const xpText =
    document.getElementById("xpText");

  if (!xpFill || !xpText) return;

  xpFill.style.width = xp + "%";

  xpText.innerText =
    `${xp} / 100 XP para subir de nivel`;

}

// =========================
// WORLD
// =========================

function growWorld() {

  uiSound("success");

  worldLevel++;

  localStorage.setItem(
    "worldLevel",
    worldLevel
  );

  updateWorld();

  addXP(15);

  notify("🌱 Tu mundo evolucionó");

}

function growWorldSoft() {

  if (Math.random() > 0.5 &&
      worldLevel < 4) {

    worldLevel++;

    localStorage.setItem(
      "worldLevel",
      worldLevel
    );

    updateWorld();

  }

}

function updateWorld() {

  const title =
    document.getElementById("worldTitle");

  const text =
    document.getElementById("worldText");

  const tree =
    document.getElementById("treeVisual");

  const city =
    document.getElementById("cityVisual");

  const mini =
    document.getElementById("plantStage");

  if (!title || !text ||
      !tree || !city || !mini) return;

  tree.classList.remove("hidden");

  city.classList.add("hidden");

  if (worldLevel === 1) {

    tree.innerHTML = "🌱";
    mini.innerHTML = "🌱";

    title.innerText =
      "Etapa 1 • Semilla tranquila";

    text.innerText =
      "Todo empieza con pequeños pasos.";

  }

  if (worldLevel === 2) {

    tree.innerHTML = "🌿";
    mini.innerHTML = "🌿";

    title.innerText =
      "Etapa 2 • Crecimiento";

    text.innerText =
      "Tu constancia empieza a notarse.";

  }

  if (worldLevel === 3) {

    tree.innerHTML = "🌳";
    mini.innerHTML = "🌳";

    title.innerText =
      "Etapa 3 • Árbol estable";

    text.innerText =
      "Ya construiste una rutina.";

  }

  if (worldLevel >= 4) {

    tree.classList.add("hidden");

    city.classList.remove("hidden");

    mini.innerHTML = "🌌";

    title.innerText =
      "Etapa 4 • Ciudad Lumia";

    text.innerText =
      "Tu mundo ahora brilla completo.";

  }

}

// =========================
// AI CHAT
// =========================

function toggleAI() {

  uiSound();

  const chat =
    document.getElementById("aiChat");

  if (chat.style.display === "flex") {

    chat.style.display = "none";

  }

  else {

    chat.style.display = "flex";

  }

}

function sendAIMessage() {

  const input =
    document.getElementById("aiInput");

  const messages =
    document.getElementById("aiMessages");

  if (input.value.trim() === "") return;

  uiSound();

  const userMsg =
    document.createElement("div");

  userMsg.className = "ai-msg user";

  userMsg.innerText = input.value;

  messages.appendChild(userMsg);

  const text = input.value;

  input.value = "";

  setTimeout(() => {

    const ai =
      document.createElement("div");

    ai.className = "ai-msg";

    ai.innerText =
      generateAIResponse(text);

    messages.appendChild(ai);

    messages.scrollTop =
      messages.scrollHeight;

  }, 700);

}

function generateAIResponse(text) {

  text = text.toLowerCase();

  if (text.includes("estres") ||
      text.includes("estrés")) {

    return "No tenés que resolver todo hoy.";

  }

  if (text.includes("cans")) {

    return "Descansar también es parte del progreso.";

  }

  if (text.includes("miedo")) {

    return "Respirá lento. Estoy acá.";

  }

  return "Estoy acá para ayudarte 💙";

}

// =========================
// JOURNAL
// =========================

function saveJournal() {

  uiSound("success");

  const text =
    document.getElementById("journalInput").value;

  localStorage.setItem(
    "lumiaJournal",
    text
  );

  notify("📝 Diario guardado");

}

function loadJournal() {

  const saved =
    localStorage.getItem("lumiaJournal");

  const input =
    document.getElementById("journalInput");

  if (saved && input) {

    input.value = saved;

  }

}

// =========================
// SIMPLE TOOLS
// =========================

function explainTopic() {

  uiSound("success");

  const input =
    document.getElementById("explainInput").value;

  document.getElementById("explainResult")
    .innerText =
    `"${input}" explicado simple.`;

}

function summarizeText() {

  uiSound("success");

  const input =
    document.getElementById("summaryInput").value;

  document.getElementById("summaryResult")
    .innerText =
    input.substring(0, 140) + "...";

}

// =========================
// PLAN
// =========================

function generatePlan() {

  uiSound("success");

  notify("✨ Plan generado");

}

// =========================
// PRIORITY
// =========================

function newPriority() {

  uiSound();

  const list = [

    "Terminar una tarea pendiente.",

    "Descansar un poco.",

    "Hacer focus 25 minutos.",

    "Repasar una materia difícil."

  ];

  document.getElementById("dailyPriority")
    .innerText =
    list[Math.floor(Math.random() * list.length)];

}

// =========================
// STATS
// =========================

function updateStats() {

  const taskCount =
    document.getElementById("taskCount");

  const subjectCount =
    document.getElementById("subjectCount");

  const focusTotal =
    document.getElementById("focusTotal");

  if (taskCount) {

    taskCount.innerText =
      document.querySelectorAll(".task-card").length;

  }

  if (subjectCount) {

    subjectCount.innerText =
      document.querySelectorAll(".subject-card").length;

  }

  if (focusTotal) {

    const totalMinutes =
      focusSessions * 25;

    const hours =
      Math.floor(totalMinutes / 60);

    const mins =
      totalMinutes % 60;

    focusTotal.innerText =
      `${hours}h ${mins}m`;

  }

}

// =========================
// LOCKSCREEN
// =========================

function lockApp() {

  uiSound();

  document.getElementById("lockscreen")
    .classList.remove("hidden");

}

function unlockApp() {

  uiSound("success");

  document.getElementById("lockscreen")
    .classList.add("hidden");

}

// =========================
// NOTIFICATION
// =========================

function notify(text) {

  const noti =
    document.getElementById("notification");

  if (!noti) return;

  noti.innerText = text;

  noti.classList.remove("hidden");

  setTimeout(() => {

    noti.classList.add("hidden");

  }, 2500);

}

// =========================
// RESET
// =========================

function resetLumiaData() {

  uiSound();

  localStorage.clear();

  location.reload();

}

// =========================
// PARTICLES
// =========================

function generateParticles() {

  const container =
    document.querySelector(".floating-particles");

  if (!container) return;

  for (let i = 0; i < 35; i++) {

    const dot =
      document.createElement("div");

    dot.style.position = "absolute";

    dot.style.width =
      `${2 + Math.random() * 3}px`;

    dot.style.height = dot.style.width;

    dot.style.background = "white";

    dot.style.borderRadius = "50%";

    dot.style.opacity = Math.random();

    dot.style.left =
      Math.random() * 100 + "%";

    dot.style.top =
      Math.random() * 100 + "%";

    dot.style.boxShadow =
      "0 0 14px white";

    dot.style.animation =
      `float ${4 + Math.random() * 6}s infinite ease-in-out`;

    container.appendChild(dot);

  }

}

// =========================
// PWA INSTALL SYSTEM
// =========================

window.addEventListener(
  "beforeinstallprompt",
  (e) => {

    e.preventDefault();

    deferredPrompt = e;

    setTimeout(() => {

      const popup =
        document.getElementById("installPopup");

      if (popup) {

        popup.classList.remove("hidden");

      }

    }, 5000);

  }
);

// BOTÓN INSTALAR

function installApp() {

  uiSound("success");

  if (!deferredPrompt) {

    notify(
      "📲 Abrí Lumia desde Chrome o Edge para instalarla."
    );

    return;

  }

  deferredPrompt.prompt();

  deferredPrompt.userChoice
    .then((choiceResult) => {

      if (
        choiceResult.outcome === "accepted"
      ) {

        notify(
          "🚀 Lumia se está instalando"
        );

        document.body
          .classList.add("galaxy-mode");

      }

      else {

        notify(
          "Instalación cancelada"
        );

      }

      deferredPrompt = null;

      const popup =
        document.getElementById("installPopup");

      if (popup) {

        popup.classList.add("hidden");

      }

    });

}

// Cuando realmente se instala

window.addEventListener(
  "appinstalled",
  () => {

    notify(
      "✨ Lumia instalada correctamente"
    );

    document.body
      .classList.add("galaxy-mode");

    const popup =
      document.getElementById("installPopup");

    if (popup) {

      popup.classList.add("hidden");

    }

  }
);

// =========================
// SERVICE WORKER
// =========================

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sw.js")

      .then(() => {

        console.log(
          "SW registrado"
        );

      })

      .catch((err) => {

        console.log(
          "SW error:",
          err
        );

      });

  });

}