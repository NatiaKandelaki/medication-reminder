const form = document.getElementById("med-form");
const list = document.getElementById("med-list");
const notifyBtn = document.getElementById("notify-btn");

let medications = [];

function save() {
  localStorage.setItem("medications", JSON.stringify(medications));
}

function load() {
  const data = localStorage.getItem("medications");
  if (data) {
    medications = JSON.parse(data);
  }
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function daysBetween(from, to) {
  return Math.round((new Date(to) - new Date(from)) / 86400000);
}

function isScheduledToday(med) {
  if (!med.everyDays) {
    return true;
  }
  let days = daysBetween(med.startDate, getToday());
  return days >= 0 && days % med.everyDays === 0;
}
function isTakenToday(med) {
  return med.takenDate === getToday();
}

function getStatus(med) {
  const currentTime = getCurrentTime();
  if (!isScheduledToday(med)) {
    return "notToday";
  }

  if (isTakenToday(med)) {
    return "taken";
  }
  if (med.time < currentTime) {
    return "overdue";
  }
  if (med.time === currentTime) {
    return "due";
  }
  return "upcoming";
}
const statusLabels = {
  notToday: "Not today",
  taken: "Taken",
  overdue: "Overdue",
  due: "Due now",
  upcoming: "Upcoming",
};
notifyBtn.addEventListener("click", function () {
  Notification.requestPermission().then(updateNotifyButton);
});
function updateNotifyButton() {
  if (!("Notification" in window) || Notification.permission !== "default") {
    notifyBtn.hidden = true;
  }
}

function notifyIfDue(med) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  if (getStatus(med) !== "due") {
    return;
  }
  if (med.notifiedDate === getToday()) {
    return;
  }

  new Notification("Time for your medication", {
    body: `${med.name} (${med.dose}) at ${med.time}`,
  });

  med.notifiedDate = getToday();
  save();
}

function tick() {
  medications.forEach(notifyIfDue);
  render();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const dose = document.getElementById("dose").value;
  const time = document.getElementById("time").value;

  const everyDays = Number(document.getElementById("interval").value);

  const medication = {
    id: Date.now(),
    name: name,
    dose: dose,
    time: time,
    everyDays: everyDays,
    startDate: getToday(),
    takenDate: null,
  };

  medications.push(medication);
  save();
  render();
  form.reset();
});
function updateStats() {
  const scheduled = medications.filter(isScheduledToday);
  const taken = scheduled.filter(isTakenToday);
  const pending = scheduled.filter(function (med) {
    return !isTakenToday(med);
  });
  const now = getCurrentTime();
  const later = pending
    .filter(function (med) {
      return med.time >= now;
    })
    .sort(function (a, b) {
      return a.time.localeCompare(b.time);
    });
  document.getElementById("stat-total").textContent = medications.length;
  document.getElementById("stat-taken").textContent = taken.length;
  document.getElementById("stat-pending").textContent = pending.length;
  document.getElementById("stat-next").textContent =
    later.length > 0 ? later[0].time : "--:--";
}

function render() {
  list.innerHTML = "";
  updateStats();

  if (medications.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty");
    empty.textContent = "No medications yet. Add your first one above.";
    list.appendChild(empty);
    return;
  }

  const sorted = [...medications].sort(function (a, b) {
    return a.time.localeCompare(b.time);
  });

  sorted.forEach(function (med) {
    const status = getStatus(med);
    const li = document.createElement("li");
    li.classList.add(status);

    const icon = document.createElement("div");
    icon.classList.add("icon");
    icon.textContent = med.name[0].toUpperCase();
    const info = document.createElement("div");
    info.classList.add("info");

    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = med.name;

    const repeat = med.everyDays > 1 ? ` · every ${med.everyDays} days` : "";
    const sub = document.createElement("div");
    sub.classList.add("sub");
    sub.textContent = `${med.dose} · ${med.time}${repeat}`;

    info.appendChild(title);
    info.appendChild(sub);

    // status 
    const badge = document.createElement("span");
    badge.classList.add("badge");
    badge.textContent = statusLabels[status];

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const takenBtn = document.createElement("button");
    takenBtn.textContent = isTakenToday(med) ? "Undo" : "Taken";
    takenBtn.addEventListener("click", function () {
      med.takenDate = isTakenToday(med) ? null : getToday();
      save();
      render();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      medications = medications.filter(function (m) {
        return m.id !== med.id;
      });
      save();
      render();
    });

    actions.appendChild(takenBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(icon);
    li.appendChild(info);
    li.appendChild(badge);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

updateNotifyButton();
load();
render();

setInterval(tick, 10000);
tick();
