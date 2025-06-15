function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date) {
  const targetDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (targetDate.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  } else if (targetDate.toDateString() === yesterday.toDateString()) {
    return "Hier";
  } else {
    return targetDate.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }
}

export {
    formatDate,formatTime
}