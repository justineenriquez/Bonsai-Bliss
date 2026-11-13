/* Bonsai Bliss — shared behaviour (no dependencies) */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (header && toggle) {
    var setOpen = function (open) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!header.contains(e.target)) setOpen(false);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Site search ---------- */
  var searchBtn = document.querySelector("[data-search-open]");
  if (searchBtn && typeof HTMLDialogElement === "function") {
    var entries = [
      { t: "Home", u: "index.html", d: "Start here", k: "home welcome start" },
      { t: "Gallery", u: "gallery.html", d: "Photos of bonsai trees", k: "photos pictures trees images" },
      { t: "Styles", u: "styles.html", d: "Guide to classic bonsai styles", k: "guide forms shapes" },
      { t: "Broom style (Hokidachi)", u: "styles.html#broom", d: "Styles", k: "broom hokidachi hokkidachi" },
      { t: "Formal upright (Chokkan)", u: "styles.html#formal-upright", d: "Styles", k: "formal upright chokkan straight" },
      { t: "Informal upright (Moyogi)", u: "styles.html#informal-upright", d: "Styles", k: "informal upright moyogi curve" },
      { t: "Cascade (Kengai)", u: "styles.html#cascade", d: "Styles", k: "cascade kengai" },
      { t: "Literati (Bunjingi)", u: "styles.html#literati", d: "Styles", k: "literati bunjingi slender" },
      { t: "About us", u: "about.html", d: "Our mission and vision", k: "about mission vision" },
      { t: "Contact", u: "contact.html", d: "Send a message, join the community", k: "contact email join community pictures send" }
    ];
    var dlg = document.createElement("dialog");
    dlg.className = "search-dialog";
    dlg.setAttribute("aria-label", "Search Bonsai Bliss");
    dlg.innerHTML =
      '<label for="site-search" class="muted" style="display:block;margin-bottom:.4rem;font-weight:600">Search this site</label>' +
      '<input id="site-search" type="search" autocomplete="off" placeholder="Try &ldquo;cascade&rdquo; or &ldquo;contact&rdquo;">' +
      '<ul aria-live="polite"></ul>';
    document.body.appendChild(dlg);
    var input = dlg.querySelector("input");
    var list = dlg.querySelector("ul");

    var render = function () {
      var q = input.value.trim().toLowerCase();
      var hits = entries.filter(function (e) {
        return !q || (e.t + " " + e.k + " " + e.d).toLowerCase().indexOf(q) !== -1;
      });
      list.innerHTML = hits.length
        ? hits.map(function (e) {
            return '<li><a href="' + e.u + '">' + e.t + "<small>" + e.d + "</small></a></li>";
          }).join("")
        : '<li class="search-empty">No pages match &ldquo;' + q.replace(/[<>&"]/g, "") + "&rdquo;. Try a style name such as cascade.</li>";
    };
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = list.querySelector("a");
        if (first) window.location.href = first.getAttribute("href");
      }
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    list.addEventListener("click", function () { dlg.close(); });
    searchBtn.addEventListener("click", function () {
      input.value = "";
      render();
      dlg.showModal();
      input.focus();
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (tiles.length && typeof HTMLDialogElement === "function") {
    var lb = document.createElement("dialog");
    lb.className = "lightbox";
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<figure><img alt=""><div class="lb-bar">' +
      '<button type="button" class="lb-btn" data-prev aria-label="Previous photo">Prev</button>' +
      "<figcaption></figcaption>" +
      '<button type="button" class="lb-btn" data-next aria-label="Next photo">Next</button>' +
      '<button type="button" class="lb-btn" data-close>Close</button>' +
      "</div></figure>";
    document.body.appendChild(lb);
    var img = lb.querySelector("img");
    var cap = lb.querySelector("figcaption");
    var current = 0;
    var show = function (i) {
      current = (i + tiles.length) % tiles.length;
      var t = tiles[current];
      img.src = t.getAttribute("data-full");
      img.alt = t.getAttribute("data-caption");
      cap.textContent = t.getAttribute("data-caption");
    };
    tiles.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i); lb.showModal(); });
    });
    lb.querySelector("[data-prev]").addEventListener("click", function () { show(current - 1); });
    lb.querySelector("[data-next]").addEventListener("click", function () { show(current + 1); });
    lb.querySelector("[data-close]").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var files = document.getElementById("file-upload");
    var names = document.getElementById("file-names");
    var TO = "bonsaibliss@gmail.com";

    files.addEventListener("change", function () {
      var n = Array.prototype.map.call(files.files, function (f) { return f.name; });
      names.textContent = n.length ? n.join(", ") : "";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.classList.remove("is-error");
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      if (!name || !email || !message) {
        status.classList.add("is-error");
        status.textContent = "Add your name, email and a message, then send again.";
        (!name ? form.elements.name : !email ? form.elements.email : form.elements.message).focus();
        return;
      }
      if (!form.elements.email.checkValidity()) {
        status.classList.add("is-error");
        status.textContent = "Check your email address. It should look like name@example.com.";
        form.elements.email.focus();
        return;
      }
      var body = message + "\n\n— " + name + " (" + email + ")";
      window.location.href =
        "mailto:" + TO + "?subject=" + encodeURIComponent("Message from " + name) + "&body=" + encodeURIComponent(body);
      status.textContent = files.files.length
        ? "Opening your email app. Attach your " + files.files.length + " file(s) there before you send."
        : "Opening your email app with your message ready to send.";
    });

    if (location.hash === "#message") form.elements.message.focus();
  }
})();
