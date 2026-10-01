const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");
const musicLabel = document.getElementById("musicLabel");
const restartBtn = document.getElementById("restartBtn");
const sections = [...document.querySelectorAll("main > .section")];
const progress = document.getElementById("slideProgress");
const counter = document.getElementById("slideCounter");
const prevBtn = document.getElementById("slidePrev");
const nextBtn = document.getElementById("slideNext");
const hint = document.getElementById("slideHint");

let current = 0;
let experienceStarted = false;

document.body.classList.add("locked");
counter.textContent = `01 / ${String(sections.length).padStart(2, "0")}`;

function renderSlide() {
  sections.forEach((section, index) => {
    section.classList.toggle("active-slide", index === current);
    section.setAttribute("aria-hidden", index === current ? "false" : "true");
  });

  counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;
  progress.style.width = `${((current + 1) / sections.length) * 100}%`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === sections.length - 1;
  prevBtn.style.opacity = current === 0 ? ".25" : "1";
  nextBtn.style.opacity = current === sections.length - 1 ? ".25" : "1";
  hint.textContent = current === sections.length - 1
    ? "FIM DA RETROSPECTIVA · VOLTE PARA REVER"
    : "TOQUE NA TELA OU NA SETA PARA AVANÇAR";
}

function goToSlide(nextIndex) {
  current = Math.max(0, Math.min(sections.length - 1, nextIndex));
  renderSlide();
}

function updateMusicUI() {
  const paused = music.paused;
  musicBtn.classList.toggle("paused", paused);
  musicLabel.textContent = paused ? "Tocar música" : "Música tocando";
  musicBtn.setAttribute("aria-label", paused ? "Tocar música" : "Pausar música");
}

async function startExperience() {
  experienceStarted = true;
  intro.classList.add("hidden");
  document.body.classList.remove("locked");
  goToSlide(0);

  try {
    await music.play();
    updateMusicUI();
  } catch (error) {
    // O navegador pode tocar apenas se o arquivo existir e após interação.
    // Mantemos a experiência funcionando e informamos pelo botão.
    musicLabel.textContent = "Adicionar MP3";
    musicBtn.title = "Coloque o arquivo em assets/legendary-lovers.mp3";
    console.warn("Não foi possível iniciar a música. Confira assets/legendary-lovers.mp3.", error);
  }
}

startBtn.addEventListener("click", startExperience);

musicBtn.addEventListener("click", async (event) => {
  event.stopPropagation();
  if (music.paused) {
    try {
      await music.play();
      updateMusicUI();
    } catch (error) {
      musicLabel.textContent = "Adicionar MP3";
      musicBtn.title = "Coloque o arquivo em assets/legendary-lovers.mp3";
      console.warn("Não foi possível tocar a música. Confira o arquivo MP3.", error);
    }
  } else {
    music.pause();
    updateMusicUI();
  }
});

prevBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  goToSlide(current - 1);
});
nextBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  goToSlide(current + 1);
});

restartBtn.addEventListener("click", async (event) => {
  event.stopPropagation();
  goToSlide(0);
  try {
    music.currentTime = 0;
    await music.play();
    updateMusicUI();
  } catch (error) {
    updateMusicUI();
  }
});

document.addEventListener("click", (event) => {
  if (!experienceStarted || event.target.closest("button")) return;
  goToSlide(current + 1);
});

document.addEventListener("keydown", (event) => {
  if (!experienceStarted) return;
  if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {
    event.preventDefault();
    goToSlide(current + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    goToSlide(current - 1);
  }
});

// Swipe is only an optional alternative; the main navigation is tap/click.
let touchStartX = 0;
document.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });
document.addEventListener("touchend", (event) => {
  if (!experienceStarted) return;
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 65) goToSlide(current + (delta < 0 ? 1 : -1));
}, { passive: true });

renderSlide();
