const form = document.getElementById("med-form");
const list = document.getElementById("med-list");

let medications = [];

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
  };

  medications.push(medication);
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
    list.appendChild(li);
  });
}