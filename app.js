// PeakTask Apps Marketing Website — app.js

// Pre-cached App Store metadata (used as instant fallback before API responds)
const APP_CACHE = {
  peaktask: {
    trackName: "PeakTask: ranked todo list",
    primaryGenreName: "Productivity",
    version: "3.0.2",
    fileSizeBytes: "72560640",
    minimumOsVersion: "16.0",
    trackViewUrl: "https://apps.apple.com/us/app/peaktask-ranked-todo-list/id6756218539",
    releaseNotes: "UI cleanup, Days since Recurring task logic update.",
    description: "Peak Task is designed to help you stop feeling overwhelmed and start making real progress in life.\n\nBy dynamically ranking your tasks, you are forced to focus on only one primary objective at a time. I can rank tasks, build in recurring reminders and even see how long it's been since I last did something.\n\nI can quickly build a list of tasks and the more information I add and time passes, the list is automatically ranked. I can drag and drop the tasks so that they move up or down the list as well. I can also bulk add tasks or use voice input and Siri to quickly add whatever it is that comes to mind.\n\nOne of the best PeakTask features is that you can collaborate on a shared list with any other PeakTask user regardless of the type of device they're using (iPhone/Android/web).\n\nSpend less time managing tasks and more time actually getting things done.",
    screenshotUrls: [
      "assets/images/peaktask_screenshot.png"
    ]
  },
  daylines: {
    trackName: "daylines: current news brief",
    primaryGenreName: "Magazines & Newspapers",
    version: "1.5.0",
    fileSizeBytes: "24558592",
    minimumOsVersion: "13.0",
    trackViewUrl: "https://apps.apple.com/us/app/daylines-current-news-brief/id6758858880",
    releaseNotes: "Improved UI flow, hidden weekly clustering, improved upvoting logic.",
    description: "Daylines – Start your day with clarity.\n\nDaylines is a beautifully minimal news app that delivers curated articles tailored to your interests. No noise. No clutter. Just the stories that matter to you.\n\nSet your interests and location and let Daylines handpick the most relevant articles across topics you care about. You can also add RSS feeds for sources you follow.\n\nEnjoy a clean, distraction-free interface designed for focused reading. Start your day with just the top 10 headlines without the clutter — the goal isn't to take up much more of your screen-time so 10 important articles should be all you need.\n\nStart your day with Daylines.",
    screenshotUrls: [
      "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/19/b0/4e/19b04e8a-ac0c-070a-7bc5-e70010b882da/Daylines_IOS_App_Store.png/300x650bb.webp"
    ]
  },
  gainnotes: {
    trackName: "GainNotes: simple gym tracker",
    primaryGenreName: "Health & Fitness",
    version: "1.5.0",
    fileSizeBytes: "22457344",
    minimumOsVersion: "16.1",
    trackViewUrl: "https://apps.apple.com/us/app/gainnotes-simple-gym-tracker/id6757085848",
    releaseNotes: "Strength profile, PB icon.",
    description: "A simple, flexible gym tracking app with no fluff.\n\nTrack any workout exactly the way you want — no rigid programs, no setup headaches, and no subscriptions pushing you around.\n\nThe app is free for most users. A $6/year premium option unlocks unlimited workouts, but you'll likely never need it. No ads, no gimmicks — just an easy, low-effort way to log your weight training and move on with your day.",
    screenshotUrls: [
      "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/18/cb/94/18cb9448-d92f-a2c6-6e1d-84c20743d4f1/1.png/300x650bb.webp"
    ]
  }
};

// App Store IDs
const APP_IDS = {
  peaktask: "6756218539",
  daylines: "6758858880",
  gainnotes: "6757085848"
};

// Play Store link — only PeakTask has Android
const PLAY_STORE_URLS = {
  peaktask: "https://play.google.com/store/apps/details?id=com.daver.peaktask"
};

let currentApp = "peaktask";
let fetchedData = {};

document.addEventListener("DOMContentLoaded", () => {
  initColorMode();
  initTabs();
  initVisitorTracker();
  // Use the provided local GainNotes screenshot as the placeholder for the next 2 days
  setLocalOverride('gainnotes', 2);
  loadAppDetails(currentApp);
  // Fetch live data in background — updates UI when ready
  fetchLiveAppStoreData();
});

// ─── Tab Switcher ────────────────────────────────────────────────────────────
function initTabs() {
  const tabList = document.querySelector(".tab-list");
  const tabButtons = document.querySelectorAll(".tab-btn");

  function updateIndicator(activeBtn) {
    if (!activeBtn || !tabList) return;
    const tabRect = tabList.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    tabList.style.setProperty("--tab-left", `${btnRect.left - tabRect.left}px`);
    tabList.style.setProperty("--tab-width", `${btnRect.width}px`);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      updateIndicator(btn);
      switchApp(btn.getAttribute("data-app"));
    });
  });

  window.addEventListener("resize", () => {
    updateIndicator(document.querySelector(".tab-btn.active"));
  });

  setTimeout(() => updateIndicator(document.querySelector(".tab-btn.active")), 100);
}

function switchApp(appKey) {
  if (appKey === currentApp) return;
  currentApp = appKey;
  document.body.setAttribute("data-theme", appKey);

  // Reset description expanded state
  const descEl = document.getElementById("app-desc");
  const readMoreBtn = document.getElementById("read-more-toggle");
  if (descEl) descEl.classList.remove("expanded");
  if (readMoreBtn) readMoreBtn.textContent = "Read More";

  loadAppDetails(appKey);
}

// ─── App Details Loader ───────────────────────────────────────────────────────
function loadAppDetails(appKey) {
  const data = fetchedData[appKey] || APP_CACHE[appKey];

  const badgeEl     = document.getElementById("app-badge");
  const titleEl     = document.getElementById("app-title");
  const descEl      = document.getElementById("app-desc");
  const dlLink      = document.getElementById("download-link");
  const playLink    = document.getElementById("play-store-link");
  const screenshotImg = document.getElementById("mockup-screenshot-img");
  const screenshotContainer = document.getElementById("screenshot-container");

  const metaGenre   = document.getElementById("meta-genre");
  const metaVersion = document.getElementById("meta-version");
  const metaSize    = document.getElementById("meta-size");
  const metaNotes   = document.getElementById("meta-notes");

  if (badgeEl)  badgeEl.textContent  = data.primaryGenreName;
  if (titleEl)  titleEl.textContent  = data.trackName;
  if (descEl)   descEl.textContent   = data.description;
  if (metaGenre)   metaGenre.textContent   = data.primaryGenreName;
  if (metaVersion) metaVersion.textContent = `v${data.version || "1.0.0"}`;
  if (metaNotes)   metaNotes.textContent   = data.releaseNotes || "Performance and UI improvements.";

  // File size
  if (metaSize && data.fileSizeBytes) {
    const mb = parseFloat(data.fileSizeBytes) / (1024 * 1024);
    metaSize.textContent = `${mb.toFixed(1)} MB`;
  }

  // Screenshot
  const screenshots = data.screenshotUrls || APP_CACHE[appKey].screenshotUrls;
  // Use a local screenshot immediately as a placeholder so the UI isn't empty
  const localPlaceholder = getLocalScreenshot(appKey);
  if (screenshotImg && localPlaceholder) {
    screenshotImg.src = localPlaceholder;
    screenshotImg.alt = `${data.trackName} screenshot`;
  }

  // If a temporary local override is active, or if it is PeakTask, keep the local image for now
  if (isLocalOverrideActive(appKey) || appKey === "peaktask") {
    if (screenshotContainer) screenshotContainer.classList.add("img-loaded");
    if (screenshotImg) screenshotImg.classList.add("loaded");
    return;
  }

  // Otherwise, attempt to preload the remote screenshot and replace when loaded
  if (screenshotImg && screenshots && screenshots.length > 0) {
    if (screenshotContainer) screenshotContainer.classList.remove("img-loaded");
    screenshotImg.classList.remove("loaded");

    const remote = new Image();
    remote.onload = () => {
      screenshotImg.src = screenshots[0];
      screenshotImg.classList.add("loaded");
      if (screenshotContainer) screenshotContainer.classList.add("img-loaded");
    };
    remote.onerror = () => {
      // Keep local placeholder if remote fails
    };
    remote.src = screenshots[0];
  }

  // Download links
  if (dlLink) dlLink.href = data.trackViewUrl || "#";

  // Google Play only for PeakTask
  if (playLink) {
    if (PLAY_STORE_URLS[appKey]) {
      playLink.href = PLAY_STORE_URLS[appKey];
      playLink.classList.remove("hidden");
    } else {
      playLink.classList.add("hidden");
    }
  }
}

// Local screenshot fallback paths (relative to Marketing-site root)
function getLocalScreenshot(appKey) {
  const localMap = {
    peaktask: "assets/images/peaktask_screenshot.png",
    daylines:  "assets/images/daylines_feed.png",
    gainnotes: "assets/images/gainnotes_home.png"
  };
  return localMap[appKey] || null;
}

// Temporary local override (store expiry in ms since epoch)
function setLocalOverride(appKey, days) {
  try {
    const expires = Date.now() + (days || 2) * 24 * 60 * 60 * 1000;
    localStorage.setItem(`localScreenshotOverride_${appKey}`, expires.toString());
  } catch (e) {
    // ignore
  }
}

function isLocalOverrideActive(appKey) {
  try {
    const v = localStorage.getItem(`localScreenshotOverride_${appKey}`);
    if (!v) return false;
    const expires = parseInt(v, 10);
    return !Number.isNaN(expires) && Date.now() < expires;
  } catch (e) {
    return false;
  }
}

function clearLocalOverride(appKey) {
  try { localStorage.removeItem(`localScreenshotOverride_${appKey}`); } catch (e) {}
}

// ─── Live iTunes API ──────────────────────────────────────────────────────────
function fetchLiveAppStoreData() {
  const ids = Object.values(APP_IDS).join(",");
  const url = `https://itunes.apple.com/lookup?id=${ids}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!data || !data.results) return;
      data.results.forEach(item => {
        let appKey = Object.keys(APP_IDS).find(k => APP_IDS[k] === item.trackId?.toString());
        if (!appKey) return;
        // Keep local cached screenshots if API returns none
        const localScreenshots = APP_CACHE[appKey].screenshotUrls;
        fetchedData[appKey] = {
          ...item,
          screenshotUrls: (item.screenshotUrls && item.screenshotUrls.length > 0)
            ? item.screenshotUrls
            : localScreenshots
        };
      });
      // Refresh the currently active panel with fresh data
      loadAppDetails(currentApp);
    })
    .catch(err => {
      console.info("Using cached App Store data:", err.message);
    });
}

// ─── Read More Toggle ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const readMoreBtn = document.getElementById("read-more-toggle");
  if (!readMoreBtn) return;
  readMoreBtn.addEventListener("click", function () {
    const descEl = document.getElementById("app-desc");
    if (!descEl) return;
    if (descEl.classList.contains("expanded")) {
      descEl.classList.remove("expanded");
      this.textContent = "Read More";
    } else {
      descEl.classList.add("expanded");
      this.textContent = "Read Less";
    }
  });
});

// ─── Dark / Light Mode ───────────────────────────────────────────────────────
function initColorMode() {
  const toggleBtn = document.getElementById("color-mode-toggle");
  const textEl     = document.getElementById("color-mode-text");
  const htmlEl    = document.documentElement;

  const updateToggleText = (mode) => {
    if (textEl) textEl.textContent = mode === "light" ? "Dark mode" : "Light mode";
  };

  // Default = light; respect persisted choice
  const savedMode  = localStorage.getItem("color-mode");
  const currentMode = savedMode || "light";
  htmlEl.setAttribute("data-color-mode", currentMode);
  updateToggleText(currentMode);

  if (!toggleBtn) return;
  toggleBtn.addEventListener("click", () => {
    const next = htmlEl.getAttribute("data-color-mode") === "light" ? "dark" : "light";
    htmlEl.setAttribute("data-color-mode", next);
    localStorage.setItem("color-mode", next);
    updateToggleText(next);
  });
}

// ─── Visitor Tracker ──────────────────────────────────────────────────────────
function initVisitorTracker() {
  const countEl = document.getElementById("visitor-count");
  if (!countEl) return;

  // Simple local simulation of a visitor tracker
  let count = parseInt(localStorage.getItem("site_visitor_count") || "1240", 10);
  
  // Only increment once per session
  if (!sessionStorage.getItem("visited_this_session")) {
    count++;
    localStorage.setItem("site_visitor_count", count.toString());
    sessionStorage.setItem("visited_this_session", "true");
  }

  countEl.textContent = count.toLocaleString();
}
