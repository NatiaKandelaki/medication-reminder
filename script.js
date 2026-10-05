const form = document.getElementById("med-form");
const list = document.getElementById("med-list");

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

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const dose = document.getElementById("dose").value;
  const time = document.getElementById("time").value;

  const medication = {
    id: Date.now(),
    name: name,
    dose: dose,
    time: time,
    taken: false,
  };

  medications.push(medication);
  save();
  render();
  form.reset();
});

function render() {
  list.innerHTML = "";

  const sorted = [...medications].sort(function (a, b) {
    return a.time.localeCompare(b.time);
  });

  sorted.forEach(function (med) {
    const li = document.createElement("li");
    li.textContent = `${med.name} - ${med.dose} at ${med.time}`;

    if (med.taken) {
      li.style.textDecoration = "line-through";
    }

    const takenBtn = document.createElement("button");
    takenBtn.textContent = med.taken ? "Undo" : "Taken";
    takenBtn.addEventListener("click", function () {
      med.taken = !med.taken;
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

    li.appendChild(takenBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

load();
render();