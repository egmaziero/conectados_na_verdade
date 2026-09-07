const scheduleLinks = {
  Inglês: "turmas/turmas-ingles.html",
  Inglês_I: "materia-ingles.html",
  Tutoria: "materia-tutoria.html",
  Extra: "materia-extra.html",
  Extras: "materia-extra.html",
  História: "materia-historia.html",
  Geografia: "materia-geografia.html",
  Ciências: "materia-ciencias.html",
  "Qui/Fís": "materia-quimica-fisica.html",
  "Química/Física": "materia-quimica-fisica.html",
  "Química /Física": "materia-quimica-fisica.html",
  Matemática: "materia-matematica.html",
  Português: "materia-portugues.html"
};

document.querySelectorAll(".schedule-table td").forEach((cell) => {
  const label = cell.querySelector("strong")?.textContent.replace(/\s+/g, " ").trim();
  const destination = scheduleLinks[label];
  if (!destination) return;

  const existingLink = cell.querySelector("a");
  if (existingLink) {
    existingLink.href = destination;
    return;
  }

  const link = document.createElement("a");
  link.href = destination;
  link.append(...cell.childNodes);
  cell.append(link);
});
