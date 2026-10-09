const courses = [
  { id: "multimedia", time: "10:00", end: "11:30", name: "Diseño de Sistemas Multimedia", room: "Aula B-204", code: "DSM-302", remaining: "42 min", current: true },
  { id: "interfaces", time: "12:00", end: "13:30", name: "Diseño de Interfaces", room: "Lab. C-12", code: "DIF-218", remaining: "2 h 42 min" },
  { id: "proyecto", time: "15:00", end: "16:30", name: "Proyecto Integrador", room: "Aula A-105", code: "PIN-401", remaining: "5 h 42 min" },
];

const alerts = [
  { title: "Cambio de aula", body: "Diseño de Interfaces será en Lab. C-12.", icon: "!", type: "info", unread: true },
  { title: "Clase próxima", body: "Diseño de Sistemas Multimedia inicia en 42 min.", icon: "•", type: "info", unread: true },
  { title: "Recordatorio", body: "No olvides registrar tu asistencia.", icon: "✓", type: "default", unread: false },
];

const state = {
  selected: courses[0],
  confirmed: false,
  notifications: true,
  focusMode: false,
  defaultView: "home",
  theme: "aqua",
  editingCourseId: null,
  toastTimer: null,
  syncTimer: null,
};
const views = [...document.querySelectorAll("[data-view]")];
const scheduleList = document.querySelector("#schedule-list");
const alertList = document.querySelector("#alert-list");
const toast = document.querySelector("#toast");

function setClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
  document.querySelector("#clock").textContent = time;
  document.querySelector("#phone-clock").textContent = time;
}

function navigate(route) {
  views.forEach((view) => {
    const active = view.id === route;
    view.hidden = !active;
    view.classList.toggle("active", active);
  });
  if (route === "schedule") renderSchedule();
  if (route === "alerts") renderAlerts();
  document.querySelector(".watch-screen").scrollTop = 0;
}

function renderSchedule() {
  if (!courses.length) {
    scheduleList.innerHTML = '<p class="schedule-empty">No tienes clases programadas. Agrégalas desde el teléfono.</p>';
    return;
  }
  scheduleList.innerHTML = courses.map((course) => `
    <button class="class-row ${course.current ? "current" : ""}" data-course="${course.id}" aria-label="Ver detalle de ${course.name}">
      <span class="class-hour">${course.time}</span>
      <div><strong>${course.name}</strong><small>${course.room} · ${course.current ? "Próxima clase" : course.end}</small></div>
      <i aria-hidden="true">›</i>
    </button>`).join("");
  scheduleList.querySelectorAll("[data-course]").forEach((button) => {
    button.addEventListener("click", () => selectCourse(button.dataset.course));
  });
}

function renderHomeCourse() {
  const nextCourse = courses.find((course) => course.current) ?? courses[0];
  const detailButton = document.querySelector("#go-detail");
  if (!nextCourse) {
    document.querySelector("#home-course").textContent = "Sin clases programadas";
    document.querySelector("#home-time").textContent = "—";
    document.querySelector("#home-room").textContent = "Agrega una desde el teléfono";
    document.querySelector("#home-remaining").textContent = "Horario";
    document.querySelector("#home-remaining-label").textContent = "por configurar";
    detailButton.disabled = true;
    return;
  }
  document.querySelector("#home-course").textContent = nextCourse.name;
  document.querySelector("#home-time").textContent = nextCourse.time;
  document.querySelector("#home-room").textContent = nextCourse.room;
  document.querySelector("#home-remaining").textContent = nextCourse.remaining;
  document.querySelector("#home-remaining-label").textContent = "para comenzar";
  detailButton.disabled = false;
}

function renderAlerts() {
  alertList.innerHTML = alerts.map((alert, index) => `
    <button class="alert-row ${alert.type} ${alert.unread ? "unread" : "read"}" data-alert="${index}">
      <span class="alert-symbol" aria-hidden="true">${alert.icon}</span>
      <span><strong>${alert.title}</strong><small>${alert.body}</small></span>
    </button>`).join("");
  alertList.querySelectorAll("[data-alert]").forEach((button) => {
    button.addEventListener("click", () => {
      alerts[Number(button.dataset.alert)].unread = false;
      renderAlerts();
      updateAlertBadge();
      renderPhoneSettings();
      showToast("Aviso marcado como leído");
    });
  });
  updateAlertBadge();
}

function selectCourse(courseId) {
  state.selected = courses.find((course) => course.id === courseId) ?? courses[0];
  state.confirmed = false;
  renderSelectedCourseDetails();
  navigate("detail");
}

function renderSelectedCourseDetails() {
  const { selected } = state;
  document.querySelector("#detail-code").textContent = selected.code;
  document.querySelector("#detail-course").textContent = selected.name;
  document.querySelector("#detail-time").textContent = `${selected.time} – ${selected.end}`;
  document.querySelector("#detail-room").textContent = selected.room;
  document.querySelector("#detail-remaining").textContent = selected.remaining.replace("min", "minutos");
  document.querySelector("#confirmation-note").textContent = "Confirma cuando hayas revisado la información.";
  document.querySelector("#confirmation-note").classList.remove("confirmed");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateAlertBadge() {
  const unread = alerts.filter((alert) => alert.unread).length;
  document.querySelector("#alert-badge").textContent = state.notifications ? String(unread) : "—";
}

function renderPhoneSettings() {
  const unread = alerts.filter((alert) => alert.unread).length;
  document.querySelector("#phone-notifications").checked = state.notifications;
  document.querySelector("#phone-focus-mode").checked = state.focusMode;
  document.querySelector("#phone-alert-setting").textContent = state.notifications
    ? `${unread} ${unread === 1 ? "aviso pendiente" : "avisos pendientes"}`
    : "Avisos silenciados";
  document.querySelector("#phone-current-screen").textContent = state.defaultView === "home" ? "Inicio" : "Horario";
  document.querySelector("#course-count").textContent = `${courses.length} ${courses.length === 1 ? "clase" : "clases"} en horario`;
  document.querySelector("#home-note-text").textContent = state.focusMode
    ? "Modo concentración activado"
    : state.notifications
      ? "Todo listo para tu jornada"
      : "Alertas silenciadas en el reloj";
  document.querySelectorAll(".default-view").forEach((button) => {
    button.classList.toggle("active", button.dataset.defaultView === state.defaultView);
  });
  document.querySelectorAll(".theme-option").forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === state.theme);
  });
  document.body.dataset.theme = state.theme;
  document.body.classList.toggle("focus-mode", state.focusMode);
  updateAlertBadge();
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function renderClassManager() {
  const list = document.querySelector("#manager-course-list");
  list.innerHTML = courses.map((course) => `
    <article class="manager-course ${course.current ? "next" : ""}">
      <time>${escapeHtml(course.time)}</time>
      <span><strong>${escapeHtml(course.name)}</strong><small>${escapeHtml(course.code)} · ${escapeHtml(course.room)}</small></span>
      <button type="button" class="edit-course" data-edit-course="${escapeHtml(course.id)}" aria-label="Editar ${escapeHtml(course.name)}">Editar</button>
      <button type="button" class="delete-course" data-delete-course="${escapeHtml(course.id)}" aria-label="Borrar ${escapeHtml(course.name)}">Borrar</button>
    </article>`).join("");
  list.querySelectorAll("[data-edit-course]").forEach((button) => {
    button.addEventListener("click", () => openClassEditor(button.dataset.editCourse));
  });
  list.querySelectorAll("[data-delete-course]").forEach((button) => {
    button.addEventListener("click", () => deleteCourse(button.dataset.deleteCourse));
  });
}

function openClassManager() {
  state.editingCourseId = null;
  document.querySelector("#phone-manager").hidden = false;
  document.querySelector("#manager-list-view").hidden = false;
  document.querySelector("#class-editor").hidden = true;
  renderClassManager();
}

function closeClassManager() {
  document.querySelector("#phone-manager").hidden = true;
  state.editingCourseId = null;
}

function openClassEditor(courseId = null) {
  const course = courseId ? courses.find((item) => item.id === courseId) : null;
  state.editingCourseId = course?.id ?? null;
  document.querySelector("#manager-list-view").hidden = true;
  document.querySelector("#class-editor").hidden = false;
  document.querySelector("#editor-mode").textContent = course ? "EDITAR CLASE" : "NUEVA CLASE";
  document.querySelector("#editor-title").textContent = course ? "Modificar clase" : "Agregar clase";
  document.querySelector("#class-name").value = course?.name ?? "";
  document.querySelector("#class-code").value = course?.code ?? "";
  document.querySelector("#class-room").value = course?.room ?? "";
  document.querySelector("#class-time").value = course?.time ?? "";
  document.querySelector("#class-end").value = course?.end ?? "";
  document.querySelector("#editor-error").textContent = "";
}

function closeClassEditor() {
  document.querySelector("#class-editor").hidden = true;
  document.querySelector("#manager-list-view").hidden = false;
  state.editingCourseId = null;
  renderClassManager();
}

function saveClass(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name").trim();
  const code = form.get("code").trim().toUpperCase();
  const room = form.get("room").trim();
  const time = form.get("time");
  const end = form.get("end");
  const error = document.querySelector("#editor-error");

  if (!name || !code || !room || !time || !end) {
    error.textContent = "Completa todos los campos.";
    return;
  }
  if (end <= time) {
    error.textContent = "La hora de finalización debe ser posterior al inicio.";
    return;
  }

  const existing = courses.find((course) => course.id === state.editingCourseId);
  let savedCourse;
  if (existing) {
    Object.assign(existing, { name, code, room, time, end });
    savedCourse = existing;
  } else {
    savedCourse = {
      id: `course-${Date.now()}`,
      name,
      code,
      room,
      time,
      end,
      remaining: "Más tarde",
      current: false,
    };
    courses.push(savedCourse);
  }

  courses.sort((first, second) => first.time.localeCompare(second.time));
  if (!courses.some((course) => course.current)) savedCourse.current = true;
  if (state.selected?.id === savedCourse.id || courses.length === 1) state.selected = savedCourse;
  renderHomeCourse();
  if (state.selected) renderSelectedCourseDetails();
  renderSchedule();
  renderPhoneSettings();
  closeClassEditor();
  showToast(existing ? "Clase actualizada en el reloj" : "Nueva clase agregada al reloj");
}

function deleteCourse(courseId) {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return;
  if (!window.confirm(`¿Borrar la clase “${course.name}” del horario?`)) return;

  const wasCurrent = course.current;
  const wasSelected = state.selected?.id === courseId;
  courses.splice(courses.indexOf(course), 1);
  if (wasCurrent && courses[0]) courses[0].current = true;
  if (wasSelected) state.selected = courses.find((item) => item.current) ?? courses[0] ?? null;

  renderHomeCourse();
  renderSchedule();
  renderPhoneSettings();
  renderClassManager();
  if (!courses.length) navigate("home");
  showToast("Clase eliminada del horario");
}

function synchronizeWatch() {
  const status = document.querySelector("#phone-sync-status");
  clearTimeout(state.syncTimer);
  status.textContent = "Sincronizando…";
  showToast("Configuración enviada al reloj");
  state.syncTimer = setTimeout(() => {
    status.textContent = "Sincronizado ahora";
    showToast("Reloj actualizado correctamente");
  }, 700);
}

document.querySelectorAll("[data-route]").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.route));
});

document.querySelector("#go-detail").addEventListener("click", () => {
  if (courses[0]) selectCourse(courses[0].id);
  else showToast("Agrega una clase desde el teléfono para ver su detalle");
});
document.querySelector("#confirm-class").addEventListener("click", () => {
  state.confirmed = true;
  const note = document.querySelector("#confirmation-note");
  note.textContent = "Consulta confirmada. ¡Nos vemos en clase!";
  note.classList.add("confirmed");
  showToast("Clase confirmada correctamente");
});
document.querySelector("#phone-notifications").addEventListener("change", (event) => {
  state.notifications = event.target.checked;
  renderPhoneSettings();
  showToast(state.notifications ? "Alertas activadas en el reloj" : "Alertas silenciadas en el reloj");
});
document.querySelector("#phone-focus-mode").addEventListener("change", (event) => {
  state.focusMode = event.target.checked;
  renderPhoneSettings();
  showToast(state.focusMode ? "Modo concentración activado" : "Modo concentración desactivado");
});
document.querySelectorAll(".default-view").forEach((button) => {
  button.addEventListener("click", () => {
    state.defaultView = button.dataset.defaultView;
    renderPhoneSettings();
    navigate(state.defaultView);
    showToast(`Pantalla inicial: ${state.defaultView === "home" ? "Inicio" : "Horario"}`);
  });
});
document.querySelectorAll(".theme-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.theme = button.dataset.theme;
    renderPhoneSettings();
    showToast("Color actualizado en el reloj");
  });
});
document.querySelector("#sync-watch").addEventListener("click", synchronizeWatch);
document.querySelector("#manage-classes").addEventListener("click", openClassManager);
document.querySelector("#close-class-manager").addEventListener("click", closeClassManager);
document.querySelector("#add-class").addEventListener("click", () => openClassEditor());
document.querySelector("#cancel-class-edit").addEventListener("click", closeClassEditor);
document.querySelector("#class-editor").addEventListener("submit", saveClass);

setClock();
setInterval(setClock, 30000);
renderSchedule();
renderAlerts();
renderHomeCourse();
renderPhoneSettings();

/* Automatic product-demo mode for the pitch. */
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("auto") !== "1") return;
  const mode = params.get("pitch");
  let steps = [];
  if (mode === "phone") steps = [
    () => document.querySelector('[data-default-view="home"]')?.click(),
    () => document.querySelector('#phone-focus-mode')?.click(),
    () => document.querySelector('[data-default-view="schedule"]')?.click(),
    () => document.querySelector('[data-theme="violet"]')?.click(),
    () => document.querySelector('[data-theme="coral"]')?.click(),
    () => document.querySelector('#sync-watch')?.click(),
  ];
  if (mode === "watch") steps = [
    () => navigate("home"),
    () => navigate("schedule"),
    () => { if (courses[1]) selectCourse(courses[1].id); },
    () => navigate("alerts"),
    () => navigate("menu"),
    () => navigate("home"),
  ];
  let i = 0;
  const run = () => { if (!steps.length) return; steps[i % steps.length](); i++; };
  setTimeout(run, 900);
  setInterval(run, 2600);
})();
