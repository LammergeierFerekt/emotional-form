document.addEventListener("DOMContentLoaded", function () {
  // =========================
  // Front Page Transition Logic
  // =========================
  const frontPage = document.getElementById("front-page");
  const titleMask = document.getElementById("title-mask");
  const backgroundVideo = document.getElementById("background-video");
  const formContainer = document.querySelector(".form-container");

  if (titleMask) {
    titleMask.addEventListener("click", function () {
      if (frontPage) frontPage.style.opacity = "0";

      setTimeout(() => {
        if (frontPage) frontPage.style.display = "none";
        if (backgroundVideo) backgroundVideo.style.opacity = "1";

        setTimeout(() => {
          if (formContainer) {
            formContainer.style.opacity = "1";
            formContainer.style.visibility = "visible";
          }
        }, 1000);
      }, 1000);
    });
  }

// #region HydrateStaticSelects
  function fillSelect(selectEl, options, { placeholder = "Selectează..." } = {}) {
    if (!selectEl) return;

    selectEl.innerHTML = "";

    // Optional placeholder (disabled + selected)
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    ph.disabled = true;
    ph.selected = true;
    selectEl.appendChild(ph);

    for (const opt of options) {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      selectEl.appendChild(o);
    }
  }

  function hydrateStaticSelects() {
    const dict = window.FORM_OPTIONS || {};
    document.querySelectorAll("select[data-options]").forEach((sel) => {
      const key = sel.getAttribute("data-options");
      const options = dict[key];
      if (!Array.isArray(options)) {
        console.warn(`Missing FORM_OPTIONS key: ${key}`);
        return;
      }
      fillSelect(sel, options);
    });
  }

  hydrateStaticSelects();
// #endregion HydrateStaticSelects


// #region Addiction word setter

// =========================
// Addiction word binding
// =========================
const addictionInput = document.getElementById("q0_addiction");
const addictionTargets = document.querySelectorAll(".addiction-word");

function updateAddictionWord() {
  const value = addictionInput.value.trim() || "zahăr";
  addictionTargets.forEach(el => {
    el.textContent = value;
  });
}

if (addictionInput) {
  // update in real time
  addictionInput.addEventListener("input", updateAddictionWord);

  // initial sync on load
  updateAddictionWord();
}


// #endregion Addiction word setter




  // =========================
  // Form Navigation + Submission Logic
  // =========================
  const form = document.getElementById("emotionalForm");
  const exportBtn = document.getElementById("exportBtn");

  if (form) {
    const sections = form.querySelectorAll("fieldset");
    const previousBtn = document.getElementById("previousBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    let currentSection = 0;

    function showSection(index) {
      sections.forEach((section, i) => {
        section.style.display = i === index ? "block" : "none";
      });

      if (previousBtn) previousBtn.style.display = index === 0 ? "none" : "block";
      if (nextBtn) nextBtn.style.display = index === sections.length - 1 ? "none" : "block";
      if (submitBtn) submitBtn.style.display = index === sections.length - 1 ? "block" : "none";
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (currentSection < sections.length - 1) {
          currentSection++;
          showSection(currentSection);
        }
      });
    }

    if (previousBtn) {
      previousBtn.addEventListener("click", function () {
        if (currentSection > 0) {
          currentSection--;
          showSection(currentSection);
        }
      });
    }

    // ✅ SINGLE submit handler (the old second one is removed)
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      // collect data from ALL fields (including dynamic Q6 fields)
      const fd = new FormData(form);
      const data = {};
      fd.forEach((value, key) => {
        data[key] = value;
      });

      try {
        const response = await fetch("/api/submit-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          // Read text to see HTML error pages like "Cannot POST ..."
          const text = await response.text();
          console.error("Submit failed:", text);
          alert("Submit failed. Check console for details.");
          return;
        }

        const result = await response.json();
        console.log("Submit OK:", result);
        alert("Form submitted successfully!");

        // Show export button after successful submit
        if (exportBtn) exportBtn.style.display = "inline-block";
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Network/server error. Check console.");
      }
    });

    // show first section
    showSection(currentSection);
  }

  // =========================
  // Export CSV Button Logic (separate from submit)
  // =========================
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      // downloads CSV from the backend endpoint
      window.location.href = "/api/export-csv";
    });
  }

  // =========================


  // #region Dynamic Questions Logic (Question 6)
  const q6Input = document.getElementById("q6");
  const dynamicQuestionsContainer = document.getElementById("dynamic-questions");

  function createLabeledSelect({ id, name, labelText, optionsKey }) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = labelText;

    const select = document.createElement("select");
    select.id = id;
    select.name = name;
    select.required = true;

    const dict = window.FORM_OPTIONS || {};
    const options = dict[optionsKey] || [];
    fillSelect(select, options);

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
  }

  if (q6Input && dynamicQuestionsContainer) {
    q6Input.addEventListener("input", function () {
      dynamicQuestionsContainer.innerHTML = "";

      const elements = q6Input.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 5);

      elements.forEach((element, index) => {
        const n = index + 1;

        dynamicQuestionsContainer.appendChild(
          createLabeledSelect({
            id: `q6_${n}_1`,
            name: `q6_${n}_1`,
            labelText: `6.${n}.1 Ce simți înainte să te gândești la „${element}”?`,
            optionsKey: "EMOTIONS",
          })
        );

        dynamicQuestionsContainer.appendChild(
          createLabeledSelect({
            id: `q6_${n}_2`,
            name: `q6_${n}_2`,
            labelText: `6.${n}.2 Ce simți după ce te-ai gândit sau ai interacționat cu „${element}”?`,
            optionsKey: "EMOTIONS",
          })
        );

        dynamicQuestionsContainer.appendChild(
          createLabeledSelect({
            id: `q6_${n}_3`,
            name: `q6_${n}_3`,
            labelText: `6.${n}.3 Cât de des resimți prezența conceptului de „${element}” în general?`,
            optionsKey: "INTENSITY",
          })
        );
      });

      dynamicQuestionsContainer.style.minHeight = `${dynamicQuestionsContainer.scrollHeight}px`;
      dynamicQuestionsContainer.scrollTop = dynamicQuestionsContainer.scrollHeight;
    });
  }
  // #endregion


  // =========================
  // Input Field Styling Logic
  // =========================
  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.addEventListener("change", handleInputChange);
    input.addEventListener("input", handleInputChange);
  });

  function handleInputChange(event) {
    const target = event.target;
    if (target.value && target.value.toString().trim() !== "") {
      target.classList.add("filled");
    } else {
      target.classList.remove("filled");
    }
  }
});
