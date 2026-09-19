const scheduleLinks = {
  Inglês: "turmas/turmas-ingles.html",
  Inglês_I: "materias/materia-ingles.html",
  Tutoria: "materias/materia-tutoria.html",
  Extra: "materias/materia-extra.html",
  Extras: "materias/materia-extra.html",
  História: "materias/materia-historia.html",
  Geografia: "materias/materia-geografia.html",
  Ciências: "materias/materia-ciencias.html",
  "Qui/Fís": "materias/materia-quimica-fisica.html",
  "Química/Física": "materias/materia-quimica-fisica.html",
  "Química /Física": "materias/materia-quimica-fisica.html",
  Matemática: "materias/materia-matematica.html",
  Português: "materias/materia-portugues.html"
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
