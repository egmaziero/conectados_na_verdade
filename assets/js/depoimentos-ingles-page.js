(() => {
  const testimonials = [
    ["karine-guillem", "Karine", "Eloa", "SP", "assets/audio/turmas/ingles/karine-guillem/ING_KA_DEP_ELOA_SP.ogg", "audio/ogg; codecs=opus"],
    ["karine-guillem", "Karine", "Sara", "SP", "assets/audio/turmas/ingles/karine-guillem/ING_KA_DEP_SARA_SP.ogg", "audio/ogg; codecs=opus"],
    ["mariana-lacerda", "Mariana", "Davi", "BA", "assets/audio/turmas/ingles/mariana-lacerda/ING_08_SEG_A_QUI_MAR_DEP_DAVI_BA.ogg", "audio/ogg; codecs=opus"],
    ["mariana-lacerda", "Mariana", "Sofia", "RS", "assets/audio/turmas/ingles/mariana-lacerda/ING_08_SEG_A_QUI_MAR_DEP_SOFIA_RS.ogg", "audio/ogg; codecs=opus"],
    ["mariana-lacerda", "Mariana", "Samantha", "BA", "assets/audio/turmas/ingles/mariana-lacerda/ING_MARI_DEP_SAMANTHA_BA.ogg", "audio/ogg; codecs=opus"],
    ["luisa-dresch", "Luísa", "Sofia", "RS", "assets/audio/turmas/ingles/luisa-dresch/ING_16_SEG_LUI/ING_LUI_DEP_SOFIA_RS.ogg", "audio/ogg; codecs=opus"],
    ["luisa-dresch", "Luísa", "Sofia", "RS", "assets/audio/turmas/ingles/luisa-dresch/ING_20_TER_LUI/ING_LUI_DEP_SOFIA_RS.ogg", "audio/ogg; codecs=opus"],
    ["tania-guillem", "Tânia", "Amanda", "BA", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_AMANDA_BA.ogg", "audio/ogg; codecs=opus"],
    ["tania-guillem", "Tânia", "Ana", "MG", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_ANA_MG.mp4", "audio/mp4"],
    ["tania-guillem", "Tânia", "Estela", "MG", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_ESTELA_MG.mp4", "audio/mp4"],
    ["tania-guillem", "Tânia", "Hadassa", "BA", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_HADASSA_BA.mp4", "audio/mp4"],
    ["tania-guillem", "Tânia", "Lis", "MG", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_LIS_MG.ogg", "audio/ogg; codecs=opus"],
    ["tania-guillem", "Tânia", "Miriam", "SP", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_MIRIAM_SP.ogg", "audio/ogg; codecs=opus"],
    ["tania-guillem", "Tânia", "Natália", "MG", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_NATALIA_MG.ogg", "audio/ogg; codecs=opus"],
    ["tania-guillem", "Tânia", "Vinícius", "SP", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_VINICIUS_SP.ogg", "audio/ogg; codecs=opus"],
    ["tania-guillem", "Tânia", "Zoe", "SP", "assets/audio/turmas/ingles/tania-guillem/ING_DEP_ZOE_SP.ogg", "audio/ogg; codecs=opus"],
  ];

  const professorId = new URLSearchParams(window.location.search).get("professor");
  const list = document.querySelector("[data-testimonials-list]");
  const title = document.querySelector("[data-testimonials-title]");
  const visibleTestimonials = professorId
    ? testimonials.filter(([teacherId]) => teacherId === professorId)
    : testimonials;

  if (professorId && visibleTestimonials.length) {
    title.textContent = `O que as famílias testemunham sobre as aulas da Teacher ${visibleTestimonials[0][1]}`;
  }

  visibleTestimonials.forEach(([, teacher, student, state, src, type]) => {
    const card = document.createElement("article");
    card.className = "testimonial-card";

    const icon = document.createElement("div");
    icon.className = "testimonial-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "“";

    const label = document.createElement("p");
    label.className = "testimonial-label";
    label.innerHTML = `Depoimento de <b>inglês</b> com a professora <b>${teacher}</b>`;

    const quote = document.createElement("blockquote");
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    const source = document.createElement("source");
    source.src = `../${src}`;
    source.type = type;
    audio.append(source, "Seu navegador não suporta a reprodução de áudio.");
    quote.append(audio);

    const footer = document.createElement("footer");
    footer.append(student, " ");
    const stateTag = document.createElement("span");
    stateTag.textContent = state;
    footer.append(stateTag);

    card.append(icon, label, quote, footer);
    list.append(card);
  });

  if (!visibleTestimonials.length) {
    const message = document.createElement("p");
    message.className = "mini";
    message.textContent = "Ainda não há depoimentos em áudio para esta professora.";
    list.append(message);
  }
})();
