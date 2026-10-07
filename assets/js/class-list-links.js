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

  const isBasicSubject = /(portugues|matematica|historia|geografia|ciencias)/i.test(window.location.pathname);
  if (isBasicSubject) {
    const audienceCell = row.querySelector(".audience");
    if (audienceCell && !audienceCell.dataset.grade) {
      const match = audienceCell.textContent.match(/([13579])º\s*ano/i);
      if (match) {
        audienceCell.dataset.grade = `${match[1]}º`;
      }
    }
  }

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

