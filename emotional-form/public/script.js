document.addEventListener('DOMContentLoaded', function () {
  // Front Page Transition Logic
  const frontPage = document.getElementById('front-page');
  const titleMask = document.getElementById('title-mask');
  const backgroundVideo = document.getElementById('background-video');
  const formContainer = document.querySelector('.form-container');

  // Click event for the title mask
  if (titleMask) {
    titleMask.addEventListener('click', function () {
      // Fade out the front page
      frontPage.style.opacity = '0';
      // After the front page fades out, hide it and show the background video
      setTimeout(() => {
        frontPage.style.display = 'none';
        backgroundVideo.style.opacity = '1';
        // After the background video is fully visible, show the form
        setTimeout(() => {
          formContainer.style.opacity = '1'; // Fade in the form
          formContainer.style.visibility = 'visible'; // Make the form visible
        }, 1000); // Wait 1 second before showing the form
      }, 1000); // Wait 1 second before hiding the front page
    });
  }

  // Form Navigation and Submission Logic
  const form = document.getElementById('emotionalForm');
  if (form) {
    const sections = form.querySelectorAll('fieldset');
    const previousBtn = document.getElementById('previousBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    let currentSection = 0;

    // Function to show the current section and update button visibility
    function showSection(index) {
      sections.forEach((section, i) => {
        section.style.display = i === index ? 'block' : 'none';
      });
      previousBtn.style.display = index === 0 ? 'none' : 'block';
      nextBtn.style.display = index === sections.length - 1 ? 'none' : 'block';
      submitBtn.style.display = index === sections.length - 1 ? 'block' : 'none';
    }

    // Next Button Click Event
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (currentSection < sections.length - 1) {
          currentSection++;
          showSection(currentSection);
        }
      });
    }

    // Previous Button Click Event
    if (previousBtn) {
      previousBtn.addEventListener('click', function () {
        if (currentSection > 0) {
          currentSection--;
          showSection(currentSection);
        }
      });
    }

    // Form Submission Event
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      fetch('/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => response.json())
        .then(result => {
          alert('Form submitted successfully!');
          console.log(result);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });

    // Show the first section on page load
    showSection(currentSection);
  }

  // Dynamic Questions Logic
  const q6Input = document.getElementById('q6');
  const dynamicQuestionsContainer = document.getElementById('dynamic-questions');

  if (q6Input && dynamicQuestionsContainer) {
    q6Input.addEventListener('input', function () {
      // Clear previous dynamic questions
      dynamicQuestionsContainer.innerHTML = '';

      // Get the user's input and split it into elements
      const elements = q6Input.value.split(',').map(item => item.trim()).filter(item => item !== '');

      // Generate questions for each element (up to 5)
      elements.slice(0, 5).forEach((element, index) => {
        const elementNumber = index + 1;

        // Question 6.1: Ce simți înainte să te gândești la „X1”?
        const q6_1 = document.createElement('div');
        q6_1.className = 'form-group';
        q6_1.innerHTML = `
          <label for="q6_${elementNumber}_1">6.${elementNumber}.1 Ce simți înainte să te gândești la „${element}”?</label>
          <select id="q6_${elementNumber}_1" name="q6_${elementNumber}_1" required>
            <option value="Bucurie">Bucurie</option>
            <option value="Entuziasm">Entuziasm</option>
            <option value="Frustrare">Frustrare</option>
            <option value="Vinovăție">Vinovăție</option>
            <option value="Anxietate">Anxietate</option>
            <option value="Oboseală">Oboseală</option>
            <option value="Recompensă">Recompensă</option>
            <option value="Apatie">Apatie</option>
          </select>
        `;
        dynamicQuestionsContainer.appendChild(q6_1);

        // Question 6.2: Ce simți după ce te-ai gândit sau ai interacționat cu „X1”?
        const q6_2 = document.createElement('div');
        q6_2.className = 'form-group';
        q6_2.innerHTML = `
          <label for="q6_${elementNumber}_2">6.${elementNumber}.2 Ce simți după ce te-ai gândit sau ai interacționat cu „${element}”?</label>
          <select id="q6_${elementNumber}_2" name="q6_${elementNumber}_2" required>
            <option value="Bucurie">Bucurie</option>
            <option value="Entuziasm">Entuziasm</option>
            <option value="Frustrare">Frustrare</option>
            <option value="Vinovăție">Vinovăție</option>
            <option value="Anxietate">Anxietate</option>
            <option value="Oboseală">Oboseală</option>
            <option value="Recompensă">Recompensă</option>
            <option value="Apatie">Apatie</option>
          </select>
        `;
        dynamicQuestionsContainer.appendChild(q6_2);
      });

      // Generate Question 7: Ce emoție generală ai când te gândești la aceste elemente împreună?
      if (elements.length > 0) {
        const q7 = document.createElement('div');
        q7.className = 'form-group';
        q7.innerHTML = `
          <label for="q7">7. Ce emoție generală ai când te gândești la aceste elemente împreună?</label>
          <select id="q7" name="q7" required>
            <option value="Bucurie">Bucurie</option>
            <option value="Entuziasm">Entuziasm</option>
            <option value="Frustrare">Frustrare</option>
            <option value="Vinovăție">Vinovăție</option>
            <option value="Anxietate">Anxietate</option>
            <option value="Oboseală">Oboseală</option>
            <option value="Recompensă">Recompensă</option>
            <option value="Apatie">Apatie</option>
          </select>
        `;
        dynamicQuestionsContainer.appendChild(q7);
      }

      // Generate Question 7.1: Ce legătură emoțională este între „X1” și „X2”?
      if (elements.length > 1) {
        for (let i = 1; i < elements.length; i++) {
          const q7_1 = document.createElement('div');
          q7_1.className = 'form-group';
          q7_1.innerHTML = `
            <label for="q7_${i}">7.${i} Ce legătură emoțională este între „${elements[i - 1]}” și „${elements[i]}”?</label>
            <select id="q7_${i}" name="q7_${i}" required>
              <option value="Bucurie">Bucurie</option>
              <option value="Entuziasm">Entuziasm</option>
              <option value="Frustrare">Frustrare</option>
              <option value="Vinovăție">Vinovăție</option>
              <option value="Anxietate">Anxietate</option>
              <option value="Oboseală">Oboseală</option>
              <option value="Recompensă">Recompensă</option>
              <option value="Apatie">Apatie</option>
            </select>
          `;
          dynamicQuestionsContainer.appendChild(q7_1);
        }
      }

      // Force the container to expand to fit its content
      dynamicQuestionsContainer.style.minHeight = `${dynamicQuestionsContainer.scrollHeight}px`;

      // Scroll to the bottom of the dynamic questions container
      dynamicQuestionsContainer.scrollTop = dynamicQuestionsContainer.scrollHeight;
    });
  }

  // Input Field Styling Logic
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    // Add event listener for change (for select) and input (for input/textarea)
    input.addEventListener('change', handleInputChange);
    input.addEventListener('input', handleInputChange);
  });

  function handleInputChange(event) {
    const target = event.target;

    // Check if the input/select/textarea has a value
    if (target.value.trim() !== '') {
      target.classList.add('filled'); // Add the class if there's a value
    } else {
      target.classList.remove('filled'); // Remove the class if there's no value
    }
  }
});




