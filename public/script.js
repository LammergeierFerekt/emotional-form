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
  // Dynamic Questions Logic (Question 6)
  // =========================
  const q6Input = document.getElementById("q6");
  const dynamicQuestionsContainer = document.getElementById("dynamic-questions");

  if (q6Input && dynamicQuestionsContainer) {
    q6Input.addEventListener("input", function () {
      dynamicQuestionsContainer.innerHTML = "";

      const elements = q6Input.value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      elements.slice(0, 5).forEach((element, index) => {
        const elementNumber = index + 1;

        const q6_1 = document.createElement("div");
        q6_1.className = "form-group";
        q6_1.innerHTML = `
          <label for="q6_${elementNumber}_1">6.${elementNumber}.1 Ce simți înainte să te gândești la „${element}”?</label>
          <select id="q6_${elementNumber}_1" name="q6_${elementNumber}_1" required>
            <option value="Fericire">Fericire</option>
            <option value="Entuziasm">Entuziasm</option>
            <option value="Calm">Calm</option>
            <option value="Mulțumire">Mulțumire</option>
            <option value="Iubire">Iubire</option>
            <option value="Speranță">Speranță</option>
            <option value="Seninătate">Seninătate</option>
            <option value="Neutralitate">Neutralitate</option>
            <option value="Curiozitate">Curiozitate</option>
            <option value="Tristețe">Tristețe</option>
            <option value="Frică">Frică</option>
            <option value="Furie">Furie</option>
            <option value="Invidie">Invidie</option>
            <option value="Singurătate">Singurătate</option>
            <option value="Vinovăție">Vinovăție</option>
            <option value="Anxietate">Anxietate</option>
            <option value="Amărăciune">Amărăciune</option>
            <option value="Nostalgie">Nostalgie</option>
            <option value="Confuzie">Confuzie</option>
            <option value="Empatie">Empatie</option>
            <option value="Surpriză">Surpriză</option>
          </select>
        `;
        dynamicQuestionsContainer.appendChild(q6_1);

        const q6_2 = document.createElement("div");
        q6_2.className = "form-group";
        q6_2.innerHTML = `
          <label for="q6_${elementNumber}_2">6.${elementNumber}.2 Ce simți după ce te-ai gândit sau ai interacționat cu „${element}”?</label>
          <select id="q6_${elementNumber}_2" name="q6_${elementNumber}_2" required>
            <option value="Fericire">Fericire</option>
            <option value="Entuziasm">Entuziasm</option>
            <option value="Calm">Calm</option>
            <option value="Mulțumire">Mulțumire</option>
            <option value="Iubire">Iubire</option>
            <option value="Speranță">Speranță</option>
            <option value="Seninătate">Seninătate</option>
            <option value="Neutralitate">Neutralitate</option>
            <option value="Curiozitate">Curiozitate</option>
            <option value="Tristețe">Tristețe</option>
            <option value="Frică">Frică</option>
            <option value="Furie">Furie</option>
            <option value="Invidie">Invidie</option>
            <option value="Singurătate">Singurătate</option>
            <option value="Vinovăție">Vinovăție</option>
            <option value="Anxietate">Anxietate</option>
            <option value="Amărăciune">Amărăciune</option>
            <option value="Nostalgie">Nostalgie</option>
            <option value="Confuzie">Confuzie</option>
            <option value="Empatie">Empatie</option>
            <option value="Surpriză">Surpriză</option>
          </select>
        `;
        dynamicQuestionsContainer.appendChild(q6_2);

        const q6_3 = document.createElement("div");
        q6_3.className = "form-group";
        q6_3.innerHTML = `
          <label for="q6_${elementNumber}_3">6.${elementNumber}.3 Cât de des resimți prezența conceptului de „${element}” în general?</label>
          <select id="q6_${elementNumber}_3" name="q6_${elementNumber}_3" required>
            <option value="Super tare">Super tare</option>
            <option value="Tare">Tare</option>
            <option value="Uneori">Uneori</option>
            <option value="Neutru">Neutru</option>
            <option value="Nu prea">Nu prea</option>
            <option value="Deloc">Deloc</option>
          </select>
        `;
        dynamicQuestionsContainer.appendChild(q6_3);
      });

      dynamicQuestionsContainer.style.minHeight = `${dynamicQuestionsContainer.scrollHeight}px`;
      dynamicQuestionsContainer.scrollTop = dynamicQuestionsContainer.scrollHeight;
    });
  }

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
