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
    let target = destination;
    const hasHtmlExt = window.location.pathname.endsWith(".html");
    if (hasHtmlExt) {
      target = target.replace(/^([^?]+)/, (p) => (p.endsWith(".html") ? p : `${p}.html`));
    } else {
      target = target.replace(/\.html(\?|$)/, "$1");
    }
    window.location.href = target;
  };

  row.addEventListener("click", open);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
});

