"use strict";

const STORAGE_KEY = "dog-park.pet.v1";
const BREEDS = {
  Beagle: "assets/beagle.svg",
  "Golden Retriever": "assets/golden-retriever.svg",
  Poodle: "assets/poodle.svg"
};
const element = (id) => document.getElementById(id);
let pet = null;

function validPet(value) {
  return value !== null && typeof value === "object"
    && typeof value.name === "string"
    && value.name.trim().length >= 1 && value.name.length <= 20
    && Object.hasOwn(BREEDS, value.breed)
    && Number.isSafeInteger(value.day) && value.day >= 1
    && Number.isInteger(value.happiness)
    && value.happiness >= 0 && value.happiness <= 100;
}

function stageFor(day) {
  if (day === 1) return "Puppy";
  if (day < 4) return "Young Dog";
  return "Adult Dog";
}

function render() {
  element("adopt-form").hidden = pet !== null;
  element("pet-card").hidden = pet === null;
  if (!pet) {
    element("pet-image").src = BREEDS[element("breed").value];
    element("pet-stage").textContent = "Ready to meet you";
    return;
  }
  const stage = stageFor(pet.day);
  element("pet-image").src = BREEDS[pet.breed];
  element("pet-image").alt = `${pet.breed} named ${pet.name}`;
  element("pet-title").textContent = pet.name;
  element("pet-breed").textContent = pet.breed;
  element("pet-day").textContent = pet.day;
  element("growth-stage").textContent = stage;
  element("pet-stage").textContent = stage;
  element("happiness-value").textContent = `${pet.happiness} / 100`;
  element("happiness").value = pet.happiness;
  element("growth").value = Math.min(4, pet.day);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    element("storage-message").textContent = "Saved in this browser. Your dog stays on this device.";
  } catch {
    element("storage-message").textContent = "Browser storage is unavailable. Your dog will stay here until you close or refresh this page.";
  }
}

function showError(message) {
  element("form-error").textContent = message;
  element("pet-name").setAttribute("aria-invalid", "true");
  element("pet-name").focus();
}

element("adopt-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = element("pet-name").value.trim();
  const breed = element("breed").value;
  if (!name || name.length > 20) {
    showError("Please enter a name with 1–20 characters.");
    return;
  }
  if (!Object.hasOwn(BREEDS, breed)) {
    element("form-error").textContent = "Please select one of the three breeds.";
    return;
  }
  pet = { name, breed, day: 1, happiness: 50 };
  element("form-error").textContent = "";
  element("pet-name").removeAttribute("aria-invalid");
  save();
  render();
  element("pet-message").textContent = `Welcome to the park, ${pet.name}!`;
});

element("breed").addEventListener("change", render);

for (const action of ["feed", "play"]) {
  element(action).addEventListener("click", () => {
    if (!pet) return;
    pet.happiness = Math.min(100, pet.happiness + 10);
    save();
    render();
    element("pet-message").textContent = action === "feed"
      ? `${pet.name} enjoyed a little snack.`
      : `${pet.name} had a wonderful time playing.`;
  });
}

element("next-day").addEventListener("click", () => {
  if (!pet) return;
  if (pet.day === Number.MAX_SAFE_INTEGER) {
    element("pet-message").textContent = "This dog has reached the last supported day.";
    return;
  }
  pet.day += 1;
  pet.happiness = Math.max(0, pet.happiness - 5);
  save();
  render();
  element("pet-message").textContent = `A new day for ${pet.name}. Make some time for care!`;
});

element("reset").addEventListener("click", () => {
  element("reset-confirm").hidden = false;
  element("keep-dog").focus();
});

element("keep-dog").addEventListener("click", () => {
  element("reset-confirm").hidden = true;
  element("reset").focus();
});

element("remove-dog").addEventListener("click", () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    element("storage-message").textContent = "Could not clear browser storage. The previous dog may return after a refresh.";
  }
  pet = null;
  element("reset-confirm").hidden = true;
  element("adopt-form").reset();
  element("pet-image").alt = "Your virtual dog";
  render();
  element("pet-name").focus();
});

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (validPet(parsed)) {
      pet = { name: parsed.name.trim(), breed: parsed.breed, day: parsed.day, happiness: parsed.happiness };
      element("pet-message").textContent = `Good to see you again, ${pet.name}.`;
    } else {
      element("storage-message").textContent = "The saved dog has invalid data. Adopt a new friend to replace it.";
    }
  }
} catch {
  element("storage-message").textContent = "Saved progress could not be read. You can still adopt and play.";
}
render();
