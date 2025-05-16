const { submitQuiz, restartQuiz } = (function quizApp() {

  if (typeof imagePath === 'undefined') {
    imagePath = null;
  }

  function buildQuiz() {
    const quizForm = document.getElementById('quiz-form');
    quizForm.innerHTML = '';
    quiz.forEach((q, qIndex) => {
      const colors = ['blue', 'yellow', 'pink'];
      const colorClass = colors[qIndex % colors.length];
      const questionDiv = document.createElement('div');
      questionDiv.classList.add('question-block', colorClass);
      questionDiv.innerHTML = `
        <h3>${q.question}</h3>
      `;

      const answersDiv = document.createElement('div');
      answersDiv.classList.add('answers');

      if (imagePath) {
        answersDiv.classList.add('answers-image');
      }

      questionDiv.appendChild(answersDiv);

      q.answers.forEach((answer, aIndex) => {
        const labelContent = imagePath ? `<img class="answer-image" src=${imagePath + `q${qIndex}_a${aIndex}.jpg`} alt=${answer.text} /><div class="answer-image-desc">${answer.text}</div>` : answer.text;

        const label = document.createElement('label');
        label.classList.add('answer-label');

        if (imagePath) {
          label.classList.add('answer-image-label');
        }

        label.innerHTML = `
          <input type="radio" name="question${qIndex}" value="${aIndex}">
          ${labelContent}
        `;
        
        answersDiv.appendChild(label);
      });
      quizForm.appendChild(questionDiv);
    });
  }


  function submitQuiz() {
    const resultElement = document.getElementById('result');
    const quizForm = document.getElementById('quiz-form');
    const inputs = quizForm.querySelectorAll('input[type=radio]:checked');
    
    let allCorrect = true;
    let instructions = [];

    if (inputs.length < quiz.length) {
      alert('Proszę odpowiedzieć na wszystkie pytania!');
      return;
    }

    quiz.forEach((q, qIndex) => {
      const selected = quizForm.querySelector(`input[name="question${qIndex}"]:checked`);
      const { correct, instruction } = decodeInstruction(q.code);
      if (selected) {
        const selectedIndex = parseInt(selected.value);
        if (selectedIndex === correct) {
          selected.parentElement.classList.add('correct');
        } else {
          selected.parentElement.classList.add('incorrect');
          allCorrect = false;
        }
        instructions.push(instruction);
      } else {
        allCorrect = false;
      }
    });

    instructions = instructions.filter(Boolean);

    document.getElementById('end-btn').style.display = 'none';
    
    const instructionBlock = `
      <div style="margin-top:20px;">
        <h2 style="font-size: 2rem; color: #0B3B8C; margin-top: 0; margin-bottom: 0;">Mapa:</h2>
        ${instructions.join('<br/>')}
      </div>
    `;

    if (allCorrect) {
      resultElement.innerHTML = `
        ${instructions.length > 0 ? instructionBlock : ''}
        <div style="margin-top:30px; font-size:1.8rem; line-height: 1.4;">
          <b>Gratulacje! Koniec testu</b> 🎉 <br/>
          ${instructions.length > 0 ? 'Stosuj się do powyższej instrukcji i odkryj Warsztat kompozytora!' : ''}
        </div>
      `;
    } else {
      resultElement.innerHTML = `
        <p style="line-height: 1.35;">
          <b>Niektóre odpowiedzi są błędne. Proszę spróbować ponownie.</b> ❌
        </p>
        <button class="retry-btn" onclick="restartQuiz()">Spróbuj jeszcze raz</button>
      `;
    }
  }

  function restartQuiz() {
    location.reload();
  }

  function btoaUTF8(data) {
    const utf8Data = new TextEncoder().encode(data);
    let binaryString = "";
    for (let i = 0; i < utf8Data.length; i++) {
        binaryString += String.fromCharCode(utf8Data[i]);
    }
    return btoa(binaryString);
  }

  function atobUTF8(data) {
    const decodedData = atob(data);
    const utf8data = new Uint8Array(decodedData.length);
    const decoder = new TextDecoder("utf-8");
    for (let i = 0; i < decodedData.length; i++) {
        utf8data[i] = decodedData.charCodeAt(i);
    }
    return decoder.decode(utf8data);
  }

  function decodeInstruction(code) {
    const decoded = decodeURIComponent(atobUTF8(code));
    const [correctIndexStr, instruction] = decoded.split("::");
    return {
      correct: parseInt(correctIndexStr, 10),
      instruction
    };
  }

  function encodeInstruction(correctIndex, instruction) {
    const encoded = btoaUTF8(encodeURIComponent(`${correctIndex}::${instruction}`));
    return encoded;
  }


  buildQuiz();

  return {
    submitQuiz,
    restartQuiz,
    encodeInstruction,
    decodeInstruction
  };

})();