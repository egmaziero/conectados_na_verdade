const iconSources = {
  "🛒": "assets/icons/cart.png",
  "👨‍👩‍👧‍👦": "assets/icons/family.png",
  "💛": "assets/icons/heart.png",
  "💬": "assets/icons/parent.png",
  "▶️": "assets/icons/video.png",
  "⭐": "assets/icons/badge.png",
  "👶": "assets/icons/child-infant.png",
  "🧒": "assets/icons/child-fundamental-1.png",
  "👦": "assets/icons/child-fundamental-2.png",
  "📚": "assets/icons/book.png",
  "📖": "assets/icons/book.png",
  "📦": "assets/icons/book.png",
  "🎧": "assets/icons/tutoring.png",
  "🎓": "assets/icons/course.png",
  "🖥️": "assets/icons/online-book.png",
  "🏅": "assets/icons/badge.png"
};

document.querySelectorAll(".icon").forEach((icon) => {
  const source = iconSources[icon.textContent.trim()];
  if (!source) return;

  const image = document.createElement("img");
  image.src = source;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  icon.replaceChildren(image);
});
