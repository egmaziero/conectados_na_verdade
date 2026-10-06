const subjectPages = {
  "ingles": { name: "Inglês", hours: "2 horas por semana", price: "R$ 100,00", schedule: "../turmas/turmas-ingles.html" },
  "tutoria": { name: "Tutoria", hours: "1 hora por semana", price: "R$ 54,00", schedule: "../turmas/turmas-tutoria.html" },
  "extra": { name: "Atividades extras", hours: "4 horas por semana", price: "Valor sob consulta", schedule: "../aulas-online.html" },
  "historia": { name: "História", hours: "1 hora por semana", price: "R$ 102,00", schedule: "../turmas/turmas-historia.html" },
  "geografia": { name: "Geografia", hours: "1 hora por semana", price: "R$ 102,00", schedule: "../turmas/turmas-geografia.html" },
  "ciencias": { name: "Ciências", hours: "1 hora por semana", price: "R$ 102,00", schedule: "../turmas/turmas-ciencias.html" },
  "fisica-quimica": { name: "Química e Física", hours: "2 horas por semana", price: "R$ 100,00", schedule: "../turmas/turmas-fisica-quimica.html" },
  "quimica-fisica": { name: "Química e Física", hours: "2 horas por semana", price: "R$ 100,00", schedule: "../turmas/turmas-fisica-quimica.html" },
  "matematica": { name: "Matemática", hours: "4 horas por semana", price: "R$ 204,00", schedule: "../turmas/turmas-matematica.html" },
  "portugues": { name: "Português", hours: "4 horas por semana", price: "R$ 204,00", schedule: "../turmas/turmas-portugues.html" }
};

const key = document.body.dataset.subject;
const subject = subjectPages[key];

if (subject) {
  document.title = `Aulas de ${subject.name} | Conectados na Verdade`;
  const titleStrong = document.querySelector(".topbar-title strong");
  if (titleStrong) titleStrong.textContent = `Aulas de ${subject.name}`;
  const titleSpan = document.querySelector(".topbar-title span");
  if (titleSpan) titleSpan.textContent = "Conheça esta matéria";
  const nameEl = document.querySelector(".subject-name");
  if (nameEl) nameEl.textContent = subject.name;
  const hoursEl = document.querySelector(".subject-hours");
  if (hoursEl) hoursEl.textContent = subject.hours;
  const priceEl = document.querySelector(".subject-price");
  if (priceEl) priceEl.textContent = subject.price;
  const scheduleEl = document.querySelector(".subject-schedule");
  if (scheduleEl) scheduleEl.href = subject.schedule || "../aulas-online.html";
}

