
const $ = (selector) => document.querySelector(selector);

const lockScreen = $("#lockScreen");
const pinScreen = $("#pinScreen");
const homeScreen = $("#homeScreen");
const appScreen = $("#appScreen");
const appContent = $("#appContent");

let pin = "";
let currentApp = "";
let pageStack = [];
let chatStarted = false;
let storyShown = false;
let currentSlide = 0;
let currentPost = null;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  screen.classList.add("active");
}

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  $("#statusTime").textContent = time;
  $("#lockTime").textContent = time;
  $("#lockDate").textContent = date;
  $("#homeDate").textContent = date;
}

updateClock();
setInterval(updateClock, 1000);


/* =========================
   LOCKSCREEN AND PIN
========================= */

function openPin() {
  pin = "";
  updatePinDots();
  $("#pinError").textContent = "";
  showScreen(pinScreen);
}

let touchStartY = 0;

$("#unlockZone").addEventListener("pointerdown", (event) => {
  touchStartY = event.clientY;
});

$("#unlockZone").addEventListener("pointerup", (event) => {
  const distance = touchStartY - event.clientY;

  if (distance > 20 || event.clientY > 0) {
    openPin();
  }
});

$("#firstNotification").addEventListener("click", openPin);

$("#pinCancel").addEventListener("click", () => {
  showScreen(lockScreen);
});

function updatePinDots() {
  $("#pinDots").querySelectorAll("i").forEach((dot, index) => {
    dot.classList.toggle("filled", index < pin.length);
  });
}

function enterPin(value) {
  if (value === "delete") {
    pin = pin.slice(0, -1);
    updatePinDots();
    return;
  }

  if (pin.length >= 4) return;

  pin += value;
  updatePinDots();

  if (pin.length === 4) {
    setTimeout(() => {
      if (pin === "1717") {
        showScreen(homeScreen);
        setTimeout(() => {
          $("#homeNotifications").classList.add("show");
        }, 2500);
      } else {
        $("#pinError").textContent = "incorrect passcode, try again";
        setTimeout(() => {
          pin = "";
          updatePinDots();
        }, 700);
      }
    }, 250);
  }
}

$("#keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (button) enterPin(button.dataset.key);
});


/* =========================
   NAVIGATION
========================= */

function openApp(name) {
  currentApp = name;
  pageStack = [];

  showScreen(appScreen);

  if (name === "whatsapp") {
    navigatePage("WhatsApp", renderWhatsApp, false);
    if (!chatStarted) startConversation();
  }

  if (name === "instagram") {
  $("#homeNotifications").classList.remove("show");

  navigatePage("Instagram", () => renderInstagramProfile("me"), false);
}

  if (name === "gallery") {
    navigatePage("Photos", renderGallery, false);
  }

  if (name === "music") {
    navigatePage("Music", renderMusic, false);
  }

  if (name === "settings") {
    navigatePage("Settings", renderSettings, false);
  }
}

document.querySelectorAll(".app-icon").forEach(button => {
  button.addEventListener("click", () => openApp(button.dataset.app));
});

$("#secondNotification").addEventListener("click", () => openApp("whatsapp"));

function navigatePage(title, render, push = true) {
  if (push && currentPageRender) {
    pageStack.push({
      title: $("#appTitle").textContent,
      render: currentPageRender
    });
  }

  currentPageRender = render;
  $("#appTitle").textContent = title;
  render();
}

let currentPageRender = null;

function goBack() {
  if (pageStack.length) {
    const previous = pageStack.pop();
    currentPageRender = previous.render;
    $("#appTitle").textContent = previous.title;
    previous.render();
  } else {
    showScreen(homeScreen);
  }
}

$("#appBack").addEventListener("click", goBack);
$("#homeIndicator").addEventListener("click", () => showScreen(homeScreen));


/* =========================
   WHATSAPP
========================= */

const messages = [
  { from: "min", text: "good morning, sweetheart <3" },
  { from: "min", text: "udah bangun belum?" },
  { from: "min", text: "katanya ada kelas pagi" },

  { from: "me", text: "good morning, kakak sayang", reply: 0 },
  { from: "me", text: "udaaaahhh", reply: 1 },
  { from: "me", text: "iyaa huhu, wish me luck yaa kak, hari ini aku ada quiz 🥺", reply: 2 },

  { from: "min", text: "always, sayang. i know you'll do well, jadi jangan terlalu khawatir yaa?" },
  { from: "min", text: "jangan lupa sarapan dulu sebelum berangkat, okay?" },
  { from: "min", text: "kamu sering skip sarapan kalo kelas pagi, ga baik tau." },

  { from: "me", text: "thank u so much, kakak sayang 🥺💕", reply: 6 },
  { from: "me", text: "ay ay captain, i'll keep it in my mind <33", reply: 7 },
  { from: "me", text: "kamu agendanya ngapain aja hari ini?"},

  { from: "min", text: "aku ada kelas juga, tapi nanti jam 10." },
  { from: "min", text: "maaf ga bisa anter kamu ke kampus yaa sayang, mba yura heboh banget dari pagi minta anterin ke pasar." },
  { from: "min", text: "nih liat, orangnya udah siap", photo: "assets/mba-yura.jpg" },
  { from: "min", text: "padahal aku mau ketemu kamu " },

  { from: "me", text: "HAHAHA gapapa tau kak, kasian itu mba yuranya pasti kangen kamu juga", reply: 13 },
  { from: "me", text: "lagian kamu tiap hari udah ketemu aku, emang ngga bosen?", reply: 15 },

  { from: "min", text: "ENGGA LAH" },
  { from: "min", text: "aku mau ketemu tiap hari" },
  { from: "min", text: "kamu emang gamau ya? udah ga sayang aku kah? 🥺" },

  { from: "me", text: "ADUH GA GITUU" },
  { from: "me", text: "AKU LOH SAYANG KAMU BANGET" },
  { from: "me", text: "aku juga mau ketemu kamu tiap hari"},
  { from: "me", text: "yaudah yuk nanti ketemu abis kelas" },
  { from: "me", text: "kamu mau ke mana aku turutin deh" },

  { from: "min", text: "sayang kamu jugaa" },
  { from: "min", text: "beneran ya? sebenernya aku udah lama pengen ngajak kamu ke tempat ini" },

  { from: "me", text: "OMG KE MANA?", reply: 27 },

  { from: "min", text: "rahasia" },

  { from: "me", text: "IH KOK GITU" },
  { from: "me", text: "KAMU MAH"},
  { from: "me", text: "GAUSAH LAH MAIN RAHASIA-RAHASIAAN" },

  { from: "min", text: "heyy calm down, sayang. i'm pretty sure kamu bakal suka tempatnyaa, jadi tungguin aja" },
  { from: "min", text: "nanti kalo udah selesai kabarin aja yaa, aku jemput" },

  { from: "me", text: "OK" },
  { from: "me", text: "karena kamu baik, aku juga akan jadi anak baik" },
  { from: "me", text: "will do kakak sayang" },
  { from: "me", text: "nanti aku chat lagi yaaa"},
  { from: "me", text: "sekarang aku mau lanjut siap-siap dulu" },
  { from: "me", text: "ttyl ganteng <33" },

  { from: "min", text: "HAHAHA okeyy, ttyl sayangku" }
];


function renderWhatsApp() {
  $("#appTitle").textContent = "WhatsApp";

  appContent.innerHTML = `
    <div class="wa-page">
      <div class="wa-contact">
        <img src="assets/minjae-profile.jpg" alt="Minjae">
        <div class="wa-contact-info">
          <b>min(e)💕</b>
          <span id="waStatus">online</span>
        </div>
      </div>

      <div class="chat-area" id="chatArea">
        <div class="chat-day">today</div>

        <div class="typing-indicator" id="typingIndicator">
          <i></i><i></i><i></i>
        </div>
      </div>

      <div class="chat-composer" id="chatComposer">
        <span class="composer-plus">＋</span>
        <div class="composer-input" id="composerInput"></div>
        <span class="composer-emoji">☺</span>
        <span class="composer-send">➤</span>
      </div>

      <div class="fake-keyboard" id="fakeKeyboard">
        <div class="keyboard-suggestion">
          <span>♡</span><span>okay</span><span>hehe</span>
        </div>
        <div class="keyboard-keys">
          ${"qwertyuiopasdfghjklzxcvbnm".split("").map(letter => `<span>${letter}</span>`).join("")}
        </div>
        <div class="keyboard-bottom">
          <span>123</span><span>☺</span><span style="flex:4">English</span><span>↵</span>
        </div>
      </div>
    </div>
  `;

  const avatar = appContent.querySelector(".wa-contact img");
  avatar.onerror = () => avatar.style.opacity = ".3";
}

function addChatMessage(message, index) {
  const area = $("#chatArea");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${message.from === "me" ? "outgoing" : "incoming"}`;

  if (message.reply !== undefined) {
    const quoted = messages[message.reply];
    const quote = document.createElement("div");
    quote.className = "chat-quote";
    quote.textContent = `${quoted.from === "me" ? "You" : "min(e)💕"}: ${quoted.text}`;
    bubble.appendChild(quote);
  }

  if (message.photo) {
    const img = document.createElement("img");
    img.src = message.photo;
    img.alt = "photo";
    img.onerror = () => img.remove();
    bubble.appendChild(img);
  }

  const text = document.createElement("span");
  text.textContent = message.text;
  bubble.appendChild(text);

  const time = document.createElement("small");
  time.className = "chat-time";
  time.textContent = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  if (message.from === "me") {
    const ticks = document.createElement("span");
    ticks.className = "chat-ticks";
    ticks.textContent = " ✓✓";
    time.appendChild(ticks);
  }

  bubble.appendChild(time);
  area.insertBefore(bubble, $("#typingIndicator"));
  area.scrollTop = area.scrollHeight;
}


async function typeMyMessage(message) {
  const input = $("#composerInput");
  input.textContent = "";

  for (const character of message.text) {
    input.textContent += character;
    await wait(35 + Math.random() * 35);
  }

  await wait(350);
  input.textContent = "";
}

async function startConversation() {
  if (chatStarted) return;
  chatStarted = true;

  const typing = $("#typingIndicator");
  const keyboard = $("#fakeKeyboard");
  const composer = $("#chatComposer");
  const status = $("#waStatus");

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    if (message.from === "me") {
      keyboard.classList.add("show");
      composer.classList.add("show");
      status.textContent = "online";

      await typeMyMessage(message);
      addChatMessage(message, i);

      const nextIsMe = messages[i + 1]?.from === "me";

      if (nextIsMe) {
        await wait(450);
      } else {
        composer.classList.remove("show");
        keyboard.classList.remove("show");
        await wait(300);
      }

    } else {
      composer.classList.remove("show");
      keyboard.classList.remove("show");

      typing.classList.add("show");
      status.textContent = "online";

      await wait(message.photo ? 1500 : 1100 + Math.random() * 900);

      typing.classList.remove("show");
      addChatMessage(message, i);

      await wait(650);
    }
  }

  keyboard.classList.remove("show");
  composer.classList.remove("show");

  const ending = document.createElement("div");
  ending.className = "chat-ending";
  ending.innerHTML = `
    <p>♡</p>
    <p>they finally went on their date after class.</p>
    <p><strong>wanna know how their day went?</strong></p>
  `;

  appContent.querySelector(".wa-page").appendChild(ending);

  await wait(1800);
  showStoryNotification();
}

function showStoryNotification() {
  if (storyShown) return;
  storyShown = true;
  $("#storyNotificationWrap").classList.add("show");
}

$("#storyNotification").addEventListener("click", () => {
  $("#storyNotificationWrap").classList.remove("show");
  openApp("instagram");
  pageStack = [];
  navigatePage("Instagram", () => renderInstagramProfile("me"), false);
  setTimeout(openMentionedStory, 250);
});


/* =========================
   INSTAGRAM DATA
========================= */

const accounts = {
  me: {
    username: "ms._.sxnflxwxr",
    name: "you",
    avatar: "assets/yn-ig-profile.jpg",
    followers: "1,204",
    following: "386",
    bio: "collecting little moments ♡\nIDID, music & everything i love",
    highlights: [
  {
    name: "<3",
    cover: "assets/yn-heart-01.jpg",
    photos: [
      "assets/yn-heart-01.jpg",
      "assets/yn-heart-02.jpg",
      "assets/yn-heart-03.jpg",
      "assets/yn-heart-04.jpg",
      "assets/yn-heart-05.jpg",
      "assets/yn-heart-06.jpg"
    ]
  },
  {
    name: "life",
    cover: "assets/yn-life-01.jpg",
    photos: [
      "assets/yn-life-01.jpg",
      "assets/yn-life-02.jpg",
      "assets/yn-life-03.jpg"
    ]
  },
  {
    name: "idid",
    cover: "assets/yn-idid-01.jpg",
    photos: [
      "assets/yn-idid-01.jpg",
      "assets/yn-idid-02.jpg",
      "assets/yn-idid-03.jpg"
    ]
  }
],
    posts: [
      { image: "assets/yn-post-01.jpg", caption: "little things that make my days ♡" },
  
      { collab: true, caption: "my favorite days are the ones with you. ♡" }
    ]
  },

  minjae: {
    username: "mr._.sxnflwxr",
    name: "minjae",
    avatar: "assets/minjae-ig-profile.jpg",
    followers: "2,108",
    following: "421",
    bio: "somewhere between ordinary days & you.",
   highlights: [
  {
    name: "love",
    cover: "assets/minjae-love-01.jpg",
    photos: [
      "assets/minjae-love-01.jpg",
      "assets/minjae-love-02.jpg",
      "assets/minjae-love-03.jpg",
      "assets/minjae-love-04.jpg",
      "assets/minjae-love-05.jpg",
      "assets/minjae-love-06.jpg"
    ]
  },
  {
    name: "m",
    cover: "assets/minjae-daily-01.jpg",
    photos: [
      "assets/minjae-daily-01.jpg",
      "assets/minjae-daily-02.jpg",
      "assets/minjae-daily-03.jpg"
    ]
  }
],
    posts: [
      { image: "assets/minjae-post-01.jpg", caption: "just another day." },
      
      { collab: true, caption: "my favorite days are the ones with you. ♡" }
    ]
  }
};

const collabPhotos = [
  "assets/date-collab-01.jpg",
  "assets/date-collab-02.jpg",
  "assets/date-collab-03.jpg"
];

function renderInstagramProfile(which) {
  const account = accounts[which];
  const isMe = which === "me";

  $("#appTitle").textContent = "Instagram";

  appContent.innerHTML = `
    <div class="ig-page">
      <div class="ig-top">
  <span>${account.username}</span>

  <div class="ig-top-actions">
    <button
      class="ig-switch-profile"
      data-profile="${isMe ? "minjae" : "me"}"
    >
      ${isMe ? "minjae ♡" : "you ♡"}
    </button>
    <span>＋　☰</span>
  </div>
</div>

      <div class="ig-profile">
        <div class="ig-profile-head">
          <img class="ig-avatar" src="${account.avatar}" alt="">
          <div class="ig-stats">
            <div><b>${account.posts.length}</b><span>posts</span></div>
            <div><b>${account.followers}</b><span>followers</span></div>
            <div><b>${account.following}</b><span>following</span></div>
          </div>
        </div>

        <div class="ig-username">${account.name}</div>
        <div class="ig-bio">${account.bio}</div>

        <div class="ig-actions">
          <button>${isMe ? "Edit profile" : "Following"}</button>
          <button>Message</button>
          <button>Contact</button>
        </div>
      </div>

      <div class="ig-highlights">
        ${account.highlights.map((item, index) => `
          <button class="ig-highlight" data-highlight="${index}" data-account="${which}">
            <img src="${item.cover}" alt="">
            ${item.name}
          </button>
        `).join("")}
      </div>

      <div class="ig-tabs">▦　　▣　　♡</div>

      <div class="ig-grid">
        ${account.posts.map((post, index) => `
          <button data-post="${index}" data-account="${which}">
            <img src="${post.collab ? collabPhotos[0] : post.image}" alt="">
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function openInstagramProfile(which) {
  navigatePage(
    accounts[which].username,
    () => renderInstagramProfile(which)
  );
}


function renderPost(which, index, slide = 0, push = true) {
  const post = accounts[which].posts[index];
  const images = post.collab ? collabPhotos : [post.image];

  currentPost = { which, index };
  currentSlide = slide;

  navigatePage("Post", () => {
    const image = images[slide];

    appContent.innerHTML = `
      <div class="ig-post">
        <div class="ig-post-head">
          <img src="${accounts[which].avatar}" alt="">
          <span>${accounts[which].username}</span>
          ${post.collab
            ? `<span> · ${accounts[which === "me" ? "minjae" : "me"].username}</span>`
            : ""}
        </div>

        <div class="ig-post-photo-wrap">
          <img class="ig-post-image" src="${image}" alt="Instagram post">

          ${post.collab ? `
            <button class="collab-arrow prev"
              data-collab-slide="prev"
              ${slide === 0 ? "disabled" : ""}>‹</button>

            <button class="collab-arrow next"
              data-collab-slide="next"
              ${slide === images.length - 1 ? "disabled" : ""}>›</button>
          ` : ""}
        </div>

        ${post.collab ? `
          <div class="ig-carousel-dots">
            ${images.map((_, i) => `
              <i class="${i === slide ? "active" : ""}"></i>
            `).join("")}
          </div>
        ` : ""}

        <div class="ig-post-controls">♡　♡　↗</div>

        <div class="ig-caption">
          <b>${accounts[which].username}</b>
          ${post.caption}
        </div>
      </div>
    `;
  }, push);
}

function renderHighlight(which, index, photoIndex = 0, push = true) {
  const item = accounts[which].highlights[index];
  const photos = item.photos;
  const photo = photos[photoIndex];

  navigatePage("Highlight", () => {
    appContent.innerHTML = `
      <div class="story-view">
        <img class="story-photo" src="${photo}" alt="">

        <div class="story-shade"></div>

        <div class="story-progress">
          ${photos.map((_, i) => `
            <i style="
              flex:1;
              background:${i <= photoIndex ? "#fff" : "rgba(255,255,255,.4)"};
            "></i>
          `).join("")}
        </div>

        <div class="story-user">
          <img src="${accounts[which].avatar}" alt="">
          <b>${accounts[which].username}</b>
          <span>　${item.name}</span>
        </div>

        <button
          class="highlight-nav highlight-prev"
          data-highlight-nav="prev"
          data-account="${which}"
          data-highlight="${index}"
          data-photo-index="${photoIndex}"
          ${photoIndex === 0 ? "disabled" : ""}
        ></button>

        <button
          class="highlight-nav highlight-next"
          data-highlight-nav="next"
          data-account="${which}"
          data-highlight="${index}"
          data-photo-index="${photoIndex}"
          ${photoIndex === photos.length - 1 ? "disabled" : ""}
        ></button>
      </div>
    `;
  }, push);
}


function openMentionedStory() {
  pageStack = [];
  navigatePage("Story", renderStory);
}

function renderStory() {
  appContent.innerHTML = `
    <div class="story-view">
      <img class="story-photo" src="assets/minjae-story-01.jpg" alt="Minjae's story">
      <div class="story-shade"></div>
      <div class="story-progress"><i></i></div>

      <div class="story-user">
        <img src="assets/minjae-ig-profile.jpg" alt="">
        <b>mr._.sxnflwxr</b>
        <span>　2h</span>
      </div>

      <div class="story-add">＋ Add to your story</div>
    </div>
  `;
}


/* =========================
   INSTAGRAM CLICK ACTIONS
========================= */

appContent.addEventListener("click", (event) => {
  const profileButton = event.target.closest("[data-profile]");

  if (profileButton) {
    openInstagramProfile(profileButton.dataset.profile);
    return;
  }

  const storyNav = event.target.closest("[data-highlight-nav]");

  if (storyNav) {
    const which = storyNav.dataset.account;
    const index = Number(storyNav.dataset.highlight);
    const current = Number(storyNav.dataset.photoIndex);

    const photos = accounts[which].highlights[index].photos;

    const next = storyNav.dataset.highlightNav === "next"
      ? current + 1
      : current - 1;

    if (next >= 0 && next < photos.length) {
      renderHighlight(which, index, next, false);
    }

    return;
  }

  const highlightButton = event.target.closest("[data-highlight]");

  if (highlightButton) {
    renderHighlight(
      highlightButton.dataset.account,
      Number(highlightButton.dataset.highlight)
    );
    return;
  }

  const postButton = event.target.closest("[data-post]");

  if (postButton) {
    renderPost(
      postButton.dataset.account,
      Number(postButton.dataset.post)
    );
    return;
  }

  const slideButton = event.target.closest("[data-collab-slide]");

  if (slideButton && currentPost) {
    const post = accounts[currentPost.which].posts[currentPost.index];

    if (!post.collab) return;

    const nextSlide = slideButton.dataset.collabSlide === "next"
      ? currentSlide + 1
      : currentSlide - 1;

    if (nextSlide >= 0 && nextSlide < collabPhotos.length) {
      renderPost(currentPost.which, currentPost.index, nextSlide, false);
    }

    return;
  }
});


/* =========================
   GALLERY
========================= */

const albums = {
  "All Photos": [
    "assets/all-photo-01.jpg",
    "assets/all-photo-02.jpg",
    "assets/all-photo-03.jpg",
    "assets/all-photo-04.jpg",
    "assets/all-photo-05.jpg"
  ],
  "Amour": [
    "assets/amour-01.jpg",
    "assets/amour-02.jpg",
    "assets/amour-03.jpg",
    "assets/amour-04.jpg",
    "assets/amour-05.jpg",
    "assets/amour-06.jpg",
    "assets/amour-07.jpg",
  ]
};

function renderGallery() {
  $("#appTitle").textContent = "Photos";

  appContent.innerHTML = `
    <div class="gallery-page">
      <h2 class="gallery-heading">Albums</h2>

      <div class="album-grid">
        ${Object.entries(albums).map(([name, photos]) => `
          <button class="album-card" data-album="${name}">
            <img src="${photos[0]}" alt="">
            <b>${name}</b>
            <small>${photos.length} photos</small>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAlbum(name) {
  navigatePage(name, () => {
    appContent.innerHTML = `
      <div class="gallery-page">
        <h2 class="gallery-heading">${name}</h2>
        <div class="gallery-photos">
          ${albums[name].map((photo, index) => `
            <button data-gallery-photo="${index}" data-album="${name}">
              <img src="${photo}" alt="">
            </button>
          `).join("")}
        </div>
      </div>
    `;
  });
}

function renderPhoto(name, index) {
  navigatePage("Photo", () => {
    appContent.innerHTML = `
      <div class="photo-view">
        <img src="${albums[name][index]}" alt="">
      </div>
    `;
  });
}

appContent.addEventListener("click", (event) => {
  const album = event.target.closest("[data-album]");
  if (album && !event.target.closest("[data-gallery-photo]")) {
    renderAlbum(album.dataset.album);
    return;
  }

  const photo = event.target.closest("[data-gallery-photo]");
  if (photo) {
    renderPhoto(photo.dataset.album, Number(photo.dataset.galleryPhoto));
  }
});


/* =========================
   MUSIC AND SETTINGS
========================= */

function renderMusic() {
  appContent.innerHTML = `
    <div class="simple-page">
      <h2>Now Playing ♡</h2>
      <div class="simple-card">
        <img src="assets/cover-slow-tide.jpg" style="width:100%;border-radius:12px" alt="">
        <h3>Slow Tide</h3>
        <p>the song playing right now</p>
        <p style="text-align:center;font-size:22px">Ⅱ　◀　▶</p>
      </div>
    </div>
  `;
}

function renderSettings() {
  appContent.innerHTML = `
    <div class="simple-page">
      <h2>Settings</h2>
      <div class="simple-card">♡　Wallpaper</div>
      <div class="simple-card">♡　Notifications</div>
      <div class="simple-card">♡　Display & Brightness</div>
      <div class="simple-card">♡　About this phone</div>
    </div>
  `;
}
