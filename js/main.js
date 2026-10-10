// Plâtrerie Delmas — interactions

// Adresse d'envoi du formulaire (ex. Formspree : "https://formspree.io/f/xxxxxxx").
// Laissez vide pour ouvrir le logiciel de messagerie du visiteur à la place.
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "contact@platrerie-delmas.fr";

const PROJECTS = [
  {
    num: "n°118",
    title: "Appartement ancien, quai Lamartine",
    place: "Mâcon centre",
    area: "68 m²",
    time: "3 semaines",
    text: "Dépose des anciens enduits, doublage isolant sur les murs de façade, plafond refait en plaques sur ossature, bandes et enduit de finition prêt à peindre.",
    before: "avant-renovation",
    after: "apres-renovation",
  },
  {
    num: "n°124",
    title: "Redistribution d'un plateau",
    place: "Charnay-lès-Mâcon",
    area: "95 m²",
    time: "4 semaines",
    text: "Suppression des cloisons briques, nouvelles cloisons sur rails avec isolant phonique, couloir rectiligne et huisseries posées au cordeau.",
    before: "avant-cloisons",
    after: "apres-cloisons",
  },
  {
    num: "n°131",
    title: "Maison neuve, finitions",
    place: "Sancé",
    area: "140 m²",
    time: "12 jours",
    text: "Bandes à joints sur toutes les plaques, deux passes d'enduit puis ponçage girafe. Plafonds caissonnés autour des spots, livré prêt à peindre.",
    before: "avant-bandes",
    after: "apres-bandes",
  },
  {
    num: "n°137",
    title: "Sous-sol transformé en séjour",
    place: "Cluny",
    area: "52 m²",
    time: "5 semaines",
    text: "Doublage isolé des murs parpaings, plafond coupe-feu sous solives, gaines techniques intégrées. Une pièce de vie de plus, sans extension.",
    before: "avant-sous-sol",
    after: "apres-sous-sol",
  },
];

// ---------- Menu mobile ----------
const burger = document.querySelector(".nav__burger");
const menu = document.getElementById("menu");

burger.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!open));
  menu.classList.toggle("is-open", !open);
});
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    burger.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  }
});

// ---------- Curseur avant / après ----------
const ba = document.querySelector("[data-ba]");
const range = ba.querySelector(".ba__range");
const setPos = (v) => ba.style.setProperty("--pos", v + "%");
range.addEventListener("input", () => setPos(range.value));

// petite démo à l'arrivée dans la vue, pour montrer que ça glisse
const hint = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  hint.disconnect();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const frames = [50, 30, 70, 50];
  let i = 0;
  const step = () => {
    if (i >= frames.length) return;
    animateTo(frames[i++], 450, step);
  };
  setTimeout(step, 300);
}, { threshold: 0.6 });
hint.observe(ba);

function animateTo(target, duration, done) {
  const start = Number(range.value);
  const t0 = performance.now();
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / duration);
    const ease = 1 - Math.pow(1 - k, 3);
    const v = start + (target - start) * ease;
    range.value = v;
    setPos(v);
    k < 1 ? requestAnimationFrame(tick) : done && done();
  };
  requestAnimationFrame(tick);
}

// ---------- Changement de chantier ----------
const afterImg = ba.querySelector(".ba__img--after");
const beforeImg = ba.querySelector(".ba__before img");
const tabs = document.querySelectorAll(".filters [data-project]");
const thumbs = document.querySelectorAll(".thumbs [data-project]");
const fields = document.querySelectorAll(".sheet [data-f]");

function showProject(index) {
  const p = PROJECTS[index];
  afterImg.src = `assets/img/${p.after}.jpg`;
  beforeImg.src = `assets/img/${p.before}.jpg`;
  fields.forEach((el) => (el.textContent = p[el.dataset.f]));
  tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.project == index)));
  thumbs.forEach((t) => t.setAttribute("aria-current", String(t.dataset.project == index)));
  range.value = 50;
  setPos(50);
  ba.classList.remove("is-swapping");
  void ba.offsetWidth;
  ba.classList.add("is-swapping");
}

tabs.forEach((t) => t.addEventListener("click", () => showProject(+t.dataset.project)));
thumbs.forEach((t) =>
  t.addEventListener("click", () => {
    showProject(+t.dataset.project);
    ba.scrollIntoView({ behavior: "smooth", block: "center" });
  })
);
thumbs[0].setAttribute("aria-current", "true");

// précharge les autres photos pour un changement instantané
PROJECTS.forEach((p) => [p.before, p.after].forEach((n) => (new Image().src = `assets/img/${n}.jpg`)));

// ---------- Formulaire de devis ----------
const form = document.getElementById("devis");
const status = form.querySelector(".form__status");

form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.className = "form__status";

  const invalid = [...form.querySelectorAll("input, textarea")].filter((el) => !el.checkValidity());
  invalid.forEach((el) => el.classList.add("is-invalid"));
  if (invalid.length) {
    status.textContent = "Merci de compléter les champs marqués d'une étoile.";
    status.classList.add("err");
    invalid[0].focus();
    return;
  }

  const data = new FormData(form);
  const travaux = data.getAll("travaux").join(", ") || "Non précisé";

  if (!FORM_ENDPOINT) {
    const body = [
      `Nom : ${data.get("nom")}`,
      `Téléphone : ${data.get("telephone")}`,
      `E-mail : ${data.get("email") || "-"}`,
      `Commune : ${data.get("commune")}`,
      `Travaux : ${travaux}`,
      "",
      data.get("message"),
    ].join("\n");
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Demande de devis — " + data.get("commune"))}&body=${encodeURIComponent(body)}`;
    status.textContent = "Votre messagerie s'ouvre avec la demande pré-remplie.";
    status.classList.add("ok");
    return;
  }

  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Envoi…";
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = "Merci ! Votre demande est bien partie, on vous rappelle sous 24 h ouvrées.";
    status.classList.add("ok");
  } catch {
    status.textContent = `L'envoi a échoué. Appelez-nous au 03 85 00 00 00 ou écrivez à ${CONTACT_EMAIL}.`;
    status.classList.add("err");
  } finally {
    btn.disabled = false;
    btn.textContent = "Envoyer ma demande";
  }
});
