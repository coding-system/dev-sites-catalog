import { getUpdatedLinks } from "./scripts/links.js";
const iframe = document.querySelector(".portfolio__preview-content");
const title = document.querySelector(".portfolio__data-title");
const link = document.querySelector(".portfolio__data-link");
const prevButton = document.querySelector(".portfolio__buttons-arrows-prev");
const nextButton = document.querySelector(".portfolio__buttons-arrows-next");
const refreshPageButton = document.querySelector(".portfolio__data-refresh");
const portfolioData = document.querySelector(".portfolio__data");
const resolutionToggle = document.querySelector("#filter");

let links = [];
let history = [];
let currentIndex = -1;

function updatePortfolio(index) {
   const { url, name } = links[index];
   iframe.src = url;
   title.textContent = name;
   link.textContent = url;
   updateButtonsState();
}

function updateButtonsState() {
   prevButton.classList.toggle(
      "portfolio__buttons-arrows-disabled",
      history.length <= 1
   );
   nextButton.classList.toggle(
      "portfolio__buttons-arrows-disabled",
      history.length >= links.length
   );
}

function handleButtons() {
   prevButton.addEventListener("click", () => {
      if (history.length > 1) {
         history.pop();
         currentIndex = history[history.length - 1];
         updatePortfolio(currentIndex);
      }
   });

   nextButton.addEventListener("click", () => {
      let randomIndex;
      let attempts = 0;
      const maxAttempts = links.length;

      do {
         randomIndex = Math.floor(Math.random() * links.length);
         attempts++;
      } while (
         history.includes(randomIndex) &&
         history.length < links.length &&
         attempts < maxAttempts
      );

      if (attempts >= maxAttempts || history.length >= links.length) {
         history = [];
         iframe.src = "about:blank";
         title.textContent = "Больше нет доступных ссылок";
         link.textContent = "";
         updateButtonsState();
         return;
      }

      currentIndex = randomIndex;
      history.push(currentIndex);
      updatePortfolio(currentIndex);
   });

   link.addEventListener("click", () => {
      window.open(links[currentIndex].url, "_blank");
   });
}

function copyToClipboard(text) {
   navigator.clipboard
      .writeText(text)
      .then(() => {
         console.log("Ссылка скопирована в буфер обмена:", text);
      })
      .catch((err) => {
         console.error("Ошибка при копировании:", err);
      });
}

portfolioData.addEventListener("click", () => {
   copyToClipboard(link.textContent);
});

function refreshIframe() {
   const currentSrc = iframe.src;
   iframe.src = "about:blank";
   setTimeout(() => {
      iframe.src = currentSrc;
   }, 100);
}

function refreshPageWithAnimation() {
   const refreshIcon = refreshPageButton.querySelector("span");

   refreshIcon.classList.add("refreshed");

   refreshIframe();

   setTimeout(() => {
      refreshIcon.classList.remove("refreshed");
   }, 1500);
}

refreshPageButton.addEventListener("click", (e) => {
   e.stopPropagation();
   refreshPageWithAnimation();
});

function toggleResolution() {
   if (resolutionToggle.checked) {
      iframe.classList.remove("portfolio__preview-content--fhd");
      iframe.classList.add("portfolio__preview-content--2k");
   } else {
      iframe.classList.remove("portfolio__preview-content--2k");
      iframe.classList.add("portfolio__preview-content--fhd");
   }
}

resolutionToggle.addEventListener("change", toggleResolution);

// Горячие клавиши для навигации
document.addEventListener("keydown", (e) => {
   if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevButton.click();
   } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextButton.click();
   }
});

async function loadLinksFromGitHub() {
   const updatedLinks = await getUpdatedLinks();
   links = updatedLinks;
   console.log(`✅ Загружено ${links.length} ссылок из GitHub`);
}

async function init() {
   await loadLinksFromGitHub();

   // Устанавливаем начальный класс разрешения
   iframe.classList.add("portfolio__preview-content--fhd");

   const randomIndex = Math.floor(Math.random() * links.length);
   currentIndex = randomIndex;
   history.push(currentIndex);
   updatePortfolio(currentIndex);
   handleButtons();
}

init();
