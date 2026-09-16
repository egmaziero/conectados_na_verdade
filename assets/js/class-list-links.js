document.querySelectorAll(".english-list tbody tr[data-href]").forEach((row) => {
  const destination = row.dataset.href;
  const className = row.cells[0]?.textContent.replace(/\s+/g, " ").trim();
  const time = row.querySelector(".time")?.textContent.trim();

  row.tabIndex = 0;
  row.setAttribute("role", "link");
  row.setAttribute(
    "aria-label",
    `Ver matrícula para a turma ${className}${time ? `, às ${time}` : ""}`
  );

  const open = () => {
    window.location.href = destination;
  };

  row.addEventListener("click", open);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
});
