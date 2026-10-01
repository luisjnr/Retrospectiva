(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function init() {
    const intro = $("intro");
    const startBtn = $("startBtn");
    const music = $("music");
    const musicBtn = $("musicBtn");
    const musicLabel = $("musicLabel");
    const restartBtn = $("restartBtn");
    const sections = Array.from(document.querySelectorAll("main > .section"));
    const progress = $("slideProgress");
    const counter = $("slideCounter");
    const prevBtn = $("slidePrev");
    const nextBtn = $("slideNext");
    const hint = $("slideHint");

    if (!intro || !startBtn || !sections.length || !progress || !counter || !prevBtn || !nextBtn) {
      console.error("Retrospectiva: elementos essenciais não encontrados.");
      return;
    }

    let current = 0;
    let experienceStarted = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchTime = 0;

    document.body.classList.add("locked");

    function renderSlide() {
      sections.forEach((section, index) => {
        const active = index === current;
        section.classList.toggle("active-slide", active);
        section.setAttribute("aria-hidden", active ? "false" : "true");
      });

      const total = sections.length;
      counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
      progress.style.width = `${((current + 1) / total) * 100}%`;

      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
      prevBtn.setAttribute("aria-disabled", String(current === 0));
      nextBtn.setAttribute("aria-disabled", String(current === total - 1));
      prevBtn.style.opacity = current === 0 ? ".25" : "1";
      nextBtn.style.opacity = current === total - 1 ? ".25" : "1";

      if (hint) {
        hint.textContent = current === total - 1
          ? "FIM DA RETROSPECTIVA · VOLTE PARA REVER"
          : "TOQUE NA TELA OU NA SETA PARA AVANÇAR";
      }
    }

    function goToSlide(index) {
      const nextIndex = Math.max(0, Math.min(sections.length - 1, index));
      if (nextIndex === current) {
        renderSlide();
        return;
      }
      current = nextIndex;
      renderSlide();
    }

    function updateMusicUI() {
      if (!music || !musicBtn || !musicLabel) return;
      const paused = music.paused;
      musicBtn.classList.toggle("paused", paused);
      musicLabel.textContent = paused ? "Tocar música" : "Música tocando";
      musicBtn.setAttribute("aria-label", paused ? "Tocar música" : "Pausar música");
    }

    async function playMusic() {
      if (!music) return;
      try {
        await music.play();
        updateMusicUI();
      } catch (error) {
        if (musicLabel) musicLabel.textContent = "Adicionar MP3";
        if (musicBtn) musicBtn.title = "Coloque o arquivo em assets/legendary-lovers.mp3";
        console.warn("Não foi possível iniciar a música.", error);
      }
    }

    async function startExperience(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      experienceStarted = true;
      intro.classList.add("hidden");
      document.body.classList.remove("locked");
      goToSlide(0);
      await playMusic();
    }

    startBtn.addEventListener("click", startExperience);

    if (musicBtn && music) {
      musicBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (music.paused) {
          await playMusic();
        } else {
          music.pause();
          updateMusicUI();
        }
      });
    }

    prevBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (current > 0) goToSlide(current - 1);
    });

    nextBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (current < sections.length - 1) goToSlide(current + 1);
    });

    if (restartBtn) {
      restartBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        goToSlide(0);
        if (music) {
          music.currentTime = 0;
          await playMusic();
        }
      });
    }

    document.addEventListener("click", (event) => {
      if (!experienceStarted) return;
      if (Date.now() - lastTouchTime < 500) return;
      if (event.target.closest("button, a, input, textarea, select")) return;
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

    document.addEventListener("touchstart", (event) => {
      if (!experienceStarted || !event.changedTouches.length) return;
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });

    document.addEventListener("touchend", (event) => {
      if (!experienceStarted || !event.changedTouches.length) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY)) {
        lastTouchTime = Date.now();
        goToSlide(current + (deltaX < 0 ? 1 : -1));
      }
    }, { passive: true });

    renderSlide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
