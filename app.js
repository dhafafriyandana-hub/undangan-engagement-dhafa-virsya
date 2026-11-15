(() => {
  "use strict";

  const cfg = window.INVITATION || {};
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = $(id);
    if (el && value !== undefined && value !== null) el.textContent = value;
  };
  const setImage = (id, src) => {
    const el = $(id);
    if (el && src) {
      el.src = src;
      el.onerror = () => { el.style.opacity = ".25"; };
    }
  };

  const one = cfg.couple?.one || {};
  const two = cfg.couple?.two || {};
  const event = cfg.event || {};

  // Tema dan konten
  document.documentElement.style.setProperty("--accent", cfg.theme?.accent || "#b58b68");
  document.documentElement.style.setProperty("--paper", cfg.theme?.background || "#f8f0ec");
  document.documentElement.style.setProperty("--ink", cfg.theme?.text || "#453a36");

  setText("eventLabel", cfg.eventLabel);
  setText("partnerOneCover", one.firstName);
  setText("partnerTwoCover", two.firstName);
  setText("partnerOneName", one.fullName);
  setText("partnerTwoName", two.fullName);
  setText("partnerOneParents", one.parents);
  setText("partnerTwoParents", two.parents);
  setText("openingText", cfg.text?.opening);
  setText("verseText", cfg.text?.verse);
  setText("eventName", event.name);
  setText("eventDate", event.dateLabel);
  setText("coverDate", event.dateLabel);
  setText("eventTime", event.time);
  setText("venueName", event.venue);
  setText("venueAddress", event.address);
  setText("locationNote", event.note);
  setText("footerNames", `${one.firstName || ""} & ${two.firstName || ""}`);
  setImage("coverPhoto", cfg.couple?.coverPhoto);
  setImage("partnerOnePhoto", one.photo);
  setImage("partnerTwoPhoto", two.photo);
  setText("bankName", cfg.gift?.bank);
  setText("bankAccount", cfg.gift?.account);
  setText("bankOwner", `a.n. ${cfg.gift?.owner || ""}`);

  // Nama tamu dari URL: ?to=Nama+Tamu
  const params = new URLSearchParams(location.search);
  const guest = params.get("to") || params.get("nama") || "Tamu Undangan";
  setText("guestName", guest);
  if ($("rsvpName") && guest !== "Tamu Undangan") $("rsvpName").value = guest;

  // Google Maps
  const mapQuery = encodeURIComponent(event.mapQuery || event.address || "");
  if ($("mapFrame") && mapQuery) {
    $("mapFrame").src = `https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`;
  }
  if ($("mapLink") && mapQuery) {
    $("mapLink").href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  }

  // Galeri + lightbox
  const galleryGrid = $("galleryGrid");
  const photos = Array.isArray(cfg.gallery) ? cfg.gallery : [];

  function openLightbox(src, alt) {
    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Tampilan foto galeri");
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt || "Foto galeri";
    overlay.appendChild(image);
    overlay.addEventListener("click", () => overlay.remove());
    document.body.appendChild(overlay);
  }

  if (galleryGrid) {
    galleryGrid.innerHTML = "";
    photos.forEach((src, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item";
      button.setAttribute("aria-label", `Lihat foto ${index + 1}`);
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Foto kenangan ${index + 1}`;
      img.loading = "lazy";
      img.onerror = () => button.remove();
      button.appendChild(img);
      button.addEventListener("click", () => openLightbox(src, img.alt));
      galleryGrid.appendChild(button);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelector(".lightbox")?.remove();
  });

  // Countdown
  const target = new Date(event.dateISO || "2026-12-12T09:00:00+07:00").getTime();
  function countdown() {
    let diff = target - Date.now();
    if (diff <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(id => setText(id, "00"));
      return;
    }
    const days = Math.floor(diff / 86400000);
    diff %= 86400000;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setText("days", String(days).padStart(2, "0"));
    setText("hours", String(hours).padStart(2, "0"));
    setText("minutes", String(minutes).padStart(2, "0"));
    setText("seconds", String(seconds).padStart(2, "0"));
  }
  countdown();
  setInterval(countdown, 1000);

  // Musik
  const audio = $("backgroundMusic");
  const musicBtn = $("musicToggle");
  if (audio && cfg.music) audio.src = cfg.music;

  musicBtn?.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
        setText("musicIcon", "Ⅱ");
        setText("musicLabel", "Jeda Musik");
      } else {
        audio.pause();
        setText("musicIcon", "♫");
        setText("musicLabel", "Putar Musik");
      }
    } catch {
      setText("musicLabel", "Musik tidak tersedia");
    }
  });

  $("openInvitation")?.addEventListener("click", () => {
    $("intro")?.scrollIntoView({ behavior: "smooth" });
    if (audio?.paused) {
      audio.play().then(() => {
        setText("musicIcon", "Ⅱ");
        setText("musicLabel", "Jeda Musik");
      }).catch(() => {});
    }
  });

// RSVP dan Buku Tamu (Terhubung ke Google Sheets)
  const rsvpForm = $("rsvpForm");
  const wishList = $("wishList");
  const wishCount = $("wishCount");
  const rsvpSubmit = $("rsvpSubmit");
  const wishesApi = cfg.wishesApiUrl || "";
  let wishes = [];

  function renderGuestBook(isLoading = false) {
    if (!wishList || !wishCount) return;
    wishList.innerHTML = "";

    if (isLoading) {
      const loading = document.createElement("div");
      loading.className = "empty-wishes";
      loading.textContent = "Memuat ucapan tamu...";
      wishList.appendChild(loading);
      return;
    }

    if (!wishes.length) {
      const empty = document.createElement("div");
      empty.className = "empty-wishes";
      empty.textContent = "Belum ada ucapan. Jadilah yang pertama memberikan doa terbaik!";
      wishList.appendChild(empty);
    } else {
      wishes.forEach((wish) => {
        const card = document.createElement("article");
        card.className = "wish-item";
        const name = document.createElement("h3");
        name.textContent = wish.name || "Tamu";
        const status = document.createElement("span");
        status.className = "wish-status";
        status.textContent = wish.status || "";
        const message = document.createElement("p");
        message.textContent = wish.message || "";
        card.append(name, status, message);
        wishList.appendChild(card);
      });
    }
    wishCount.textContent = `${wishes.length} Ucapan`;
  }

  async function loadWishes() {
    if (!wishesApi) return;
    renderGuestBook(true);
    try {
      const response = await fetch(wishesApi);
      const data = await response.json();
      if (Array.isArray(data)) {
        wishes = data;
      }
    } catch (err) {
      console.error("Gagal memuat ucapan:", err);
    }
    renderGuestBook(false);
  }

  rsvpForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("rsvpName")?.value.trim() || "";
    const status = $("rsvpStatus")?.value || "";
    const message = $("rsvpMessage")?.value.trim() || "";
    if (!name || !message) {
      alert("Mohon isi nama dan pesan doa restu.");
      return;
    }

    if (rsvpSubmit) {
      rsvpSubmit.disabled = true;
      rsvpSubmit.textContent = "Mengirim ucapan...";
    }

    const newWish = { name, status, message, date: new Date().toISOString() };

    // Kirim ke Google Sheets
    if (wishesApi) {
      try {
        await fetch(wishesApi, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(newWish)
        });
      } catch (err) {
        console.error("Gagal mengirim ke server:", err);
      }
    }

    // Langsung tampilkan di layar tanpa menunggu refresh
    wishes.unshift(newWish);
    renderGuestBook(false);

    if (rsvpSubmit) {
      rsvpSubmit.disabled = false;
      rsvpSubmit.textContent = "♡ Kirim Ucapan";
    }

    const phone = String(cfg.rsvpWhatsApp || "").replace(/\D/g, "");
    const body = `Assalamu'alaikum.\n\nSaya ${name} ingin mengonfirmasi undangan ${one.firstName || ""} & ${two.firstName || ""}.\nKehadiran: ${status}\nUcapan: ${message}`;
    rsvpForm.reset();
    if (guest !== "Tamu Undangan" && $("rsvpName")) $("rsvpName").value = guest;

    if (phone.length >= 8) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
    }

    document.querySelector(".guestbook-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  loadWishes();

    const phone = String(cfg.rsvpWhatsApp || "").replace(/\D/g, "");
    const body = `Assalamu'alaikum.\n\nSaya ${name} ingin mengonfirmasi undangan ${one.firstName || ""} & ${two.firstName || ""}.\nKehadiran: ${status}\nUcapan: ${message}`;
    rsvpForm.reset();
    if (guest !== "Tamu Undangan" && $("rsvpName")) $("rsvpName").value = guest;

    if (phone.length >= 8) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
    } else {
      alert("Ucapan diproses, tetapi nomor WhatsApp belum diatur di config.js.");
    }

    if (!saved) {
      alert("Browser tidak mengizinkan penyimpanan lokal. Ucapan mungkin tidak tersimpan setelah halaman ditutup.");
    }

    document.querySelector(".guestbook-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  renderGuestBook();

  // Salin rekening
  $("copyAccount")?.addEventListener("click", async () => {
    const account = String(cfg.gift?.account || "");
    if (!account) return alert("Nomor rekening belum diatur.");
    try {
      await navigator.clipboard.writeText(account);
      $("copyAccount").textContent = "Tersalin ✓";
    } catch {
      alert(`Nomor rekening: ${account}`);
    }
  });

// Generator link tamu (Hanya muncul jika URL mengandung ?admin=true)
  if (params.get("admin") === "true") {
    const adminButton = document.createElement("button");
    adminButton.className = "admin-generator";
    adminButton.type = "button";
    adminButton.textContent = "✧ Buat Link Tamu";
    document.body.appendChild(adminButton);

    adminButton.addEventListener("click", () => {
      const name = prompt("Masukkan nama tamu:");
      if (!name?.trim()) return;
      const url = new URL(location.href);
      url.searchParams.delete("admin");
      url.searchParams.set("to", name.trim());
      const message = `Assalamu'alaikum ${name.trim()}, kami mengundang Anda ke acara ${one.firstName || ""} & ${two.firstName || ""}. Detail undangan: ${url.href}`;
      const phone = (prompt("Nomor WhatsApp tamu (opsional, format 628xxx):") || "").replace(/\D/g, "");
      const wa = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;

      const box = document.createElement("div");
      box.className = "generator-result";
      const title = document.createElement("strong");
      title.textContent = `Link undangan untuk ${name.trim()}`;
      const input = document.createElement("input");
      input.readOnly = true;
      input.value = url.href;
      const copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = "Salin Link";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(url.href);
          copy.textContent = "Tersalin ✓";
        } catch {
          input.select();
          alert("Silakan salin link secara manual.");
        }
      });
      const send = document.createElement("a");
      send.href = wa;
      send.target = "_blank";
      send.rel = "noopener";
      send.textContent = "Buka WhatsApp";
      const close = document.createElement("button");
      close.type = "button";
      close.textContent = "Tutup";
      close.addEventListener("click", () => box.remove());
      box.append(title, input, copy, send, close);
      document.body.appendChild(box);
    });
  }
  // Reveal on scroll
  const revealElements = document.querySelectorAll(".reveal, .profile-card");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("visible"));
  }

  // Kelopak bunga
  const canvas = $("petals");
  const ctx = canvas?.getContext("2d");
  if (canvas && ctx && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let width, height;
    const ratio = () => window.devicePixelRatio || 1;
    let petals = [];

    function resize() {
      width = canvas.width = innerWidth * ratio();
      height = canvas.height = innerHeight * ratio();
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
    }

    resize();
    addEventListener("resize", resize);
    petals = Array.from({ length: 22 }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      size: 4 + Math.random() * 6,
      speed: 0.4 + Math.random() * 0.8,
      drift: Math.random() * 1.2
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(ratio(), ratio());
      petals.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.012) * p.drift;
        if (p.y > innerHeight + 20) {
          p.y = -20;
          p.x = Math.random() * innerWidth;
        }
        ctx.globalAlpha = 0.38;
        ctx.fillStyle = "#d6a9a1";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 0.65, p.size, Math.sin(p.y * 0.02), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      requestAnimationFrame(draw);
    }
    draw();
  }
})();
