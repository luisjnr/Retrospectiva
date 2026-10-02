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
    const sections = [...document.querySelectorAll("main > .section")];
    const progress = $("slideProgress");
    const counter = $("slideCounter");
    const prevBtn = $("slidePrev");
    const nextBtn = $("slideNext");
    const hint = $("slideHint");

    if (!intro || !startBtn || !music || !musicBtn || !restartBtn ||
        !progress || !counter || !prevBtn || !nextBtn || !hint || !sections.length) {
      console.error("Retrospectiva: elementos essenciais não encontrados.");
      return;
    }

    let current = 0;
    let experienceStarted = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let ignoreNextClick = false;

    document.body.classList.add("locked");

    function renderSlide() {
      sections.forEach((section, index) => {
        const active = index === current;
        section.classList.toggle("active-slide", active);
        section.setAttribute("aria-hidden", active ? "false" : "true");
      });

      const total = String(sections.length).padStart(2, "0");
      counter.textContent = `${String(current + 1).padStart(2, "0")} / ${total}`;
      progress.style.width = `${((current + 1) / sections.length) * 100}%`;

      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === sections.length - 1;
      prevBtn.style.opacity = current === 0 ? ".25" : "1";
      nextBtn.style.opacity = current === sections.length - 1 ? ".25" : "1";

      hint.textContent = current === sections.length - 1
        ? "FIM DA RETROSPECTIVA · VOLTE PARA REVER"
        : "TOQUE NAS LATERAIS DA TELA PARA NAVEGAR";
    }

    function goToSlide(nextIndex) {
      const next = Math.max(0, Math.min(sections.length - 1, nextIndex));
      if (next === current) {
        renderSlide();
        return;
      }
      current = next;
      renderSlide();
    }

    function updateMusicUI() {
      const paused = music.paused;
      musicBtn.classList.toggle("paused", paused);
      musicLabel.textContent = paused ? "Tocar música" : "Música tocando";
      musicBtn.setAttribute("aria-label", paused ? "Tocar música" : "Pausar música");
    }

    async function playMusic() {
      try {
        await music.play();
        updateMusicUI();
      } catch (error) {
        musicLabel.textContent = "Tocar música";
        musicBtn.title = "A música só pode iniciar depois de uma interação com a página.";
        console.warn("Não foi possível iniciar a música:", error);
      }
    }

    async function startExperience(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (experienceStarted) return;

      experienceStarted = true;
      intro.classList.add("hidden");
      document.body.classList.remove("locked");
      current = 0;
      renderSlide();
      await playMusic();
    }

    function isControl(target) {
      return !!target.closest("button, a, input, textarea, select, label");
    }

    startBtn.addEventListener("click", startExperience);

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

    prevBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      ignoreNextClick = true;
      goToSlide(current - 1);
      setTimeout(() => { ignoreNextClick = false; }, 80);
    });

    nextBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      ignoreNextClick = true;
      goToSlide(current + 1);
      setTimeout(() => { ignoreNextClick = false; }, 80);
    });

    restartBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      ignoreNextClick = true;
      current = 0;
      renderSlide();
      music.currentTime = 0;
      await playMusic();
      setTimeout(() => { ignoreNextClick = false; }, 80);
    });

    /*
      Algoritmo Mobile (Spotify/Instagram style):
      Dividimos a tela para que toques na margem esquerda voltem o slide
      e toques do centro para a direita avancem a história.
    */
	document.addEventListener("click", (event) => {
      if (!experienceStarted || ignoreNextClick || isControl(event.target)) return;
      
      const screenWidth = window.innerWidth;
      const clickX = event.clientX;
      
      // Se clicou nos primeiros 30% da tela (lado esquerdo), volta 1 slide.
      if (clickX < screenWidth * 0.30) {
        goToSlide(current - 1);
      } else {
        // Se clicou no resto da tela, avança.
        goToSlide(current + 1);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!experienceStarted) return;

      if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {
        event.preventDefault();
        goToSlide(current + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide(current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goToSlide(sections.length - 1);
      }
    });

    /* Suporte a swipe preservado para arrastar as páginas. */
    document.addEventListener("touchstart", (event) => {
      if (!experienceStarted) return;
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    document.addEventListener("touchend", (event) => {
      if (!experienceStarted) return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        ignoreNextClick = true;
        goToSlide(current + (dx < 0 ? 1 : -1));
        setTimeout(() => { ignoreNextClick = false; }, 80);
      }
    }, { passive: true });

    updateMusicUI();
    renderSlide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
