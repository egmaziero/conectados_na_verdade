const scheduleLinks = {
  Inglês: "turmas/turmas-ingles.html",
  Inglês_I: "turmas/turmas-ingles.html",
  Tutoria: "turmas/turmas-tutoria.html",
  Extra: "turmas/turmas-extra.html",
  Extras: "turmas/turmas-extra.html",
  "Opções de Aulas Extras": "turmas/turmas-extra.html",
  História: "turmas/turmas-historia.html",
  Geografia: "turmas/turmas-geografia.html",
  Ciências: "turmas/turmas-ciencias.html",
  "Química/Física": "turmas/turmas-fisica-quimica.html",
  Matemática: "turmas/turmas-matematica.html",
  Português: "turmas/turmas-portugues.html",
  "Português Bilíngue": "turmas/turmas-portugues.html",
  "Matemática Bilíngue": "turmas/turmas-matematica.html"
};

document.querySelectorAll(".schedule-table td").forEach((cell) => {
  const label = cell.querySelector("strong")?.textContent.replace(/\s+/g, " ").trim();
  const destination = scheduleLinks[label];
  if (!destination) return;

  let target = destination;
  if (!window.location.pathname.endsWith(".html")) {
    target = target.replace(/\.html$/, "");
  }

  const existingLink = cell.querySelector("a");
  if (existingLink) {
    existingLink.href = target;
    return;
  }

  const link = document.createElement("a");
  link.href = target;
  link.append(...cell.childNodes);
  cell.append(link);
});
