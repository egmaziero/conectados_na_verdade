const subjectPages = {
  ingles: { name: "Inglês", hours: "2 horas por semana", price: "R$ 100,00", schedule: "turmas-ingles.html" },
  tutoria: { name: "Tutoria", hours: "2 horas por semana", price: "Valor sob consulta" },
  extra: { name: "Atividades extras", hours: "4 horas por semana", price: "Valor sob consulta" },
  historia: { name: "História", hours: "2 horas por semana", price: "Valor sob consulta" },
  geografia: { name: "Geografia", hours: "2 horas por semana", price: "Valor sob consulta" },
  ciencias: { name: "Ciências", hours: "2 horas por semana", price: "Valor sob consulta" },
  "quimica-fisica": { name: "Química e Física", hours: "2 horas por semana", price: "Valor sob consulta" },
  matematica: { name: "Matemática", hours: "4 horas por semana", price: "Valor sob consulta" },
  portugues: { name: "Português", hours: "4 horas por semana", price: "Valor sob consulta" }
};

const key = document.body.dataset.subject;
const subject = subjectPages[key];

if (subject) {
  document.title = `Aulas de ${subject.name} | Conectados na Verdade`;
  document.querySelector(".topbar-title strong").textContent = `Aulas de ${subject.name}`;
  document.querySelector(".topbar-title span").textContent = "Conheça esta matéria";
  document.querySelector(".subject-name").textContent = subject.name;
  document.querySelector(".subject-hours").textContent = subject.hours;
  document.querySelector(".subject-price").textContent = subject.price;
  document.querySelector(".subject-schedule").href = subject.schedule || "aulas-online.html";
}
