
(function () {
    "use strict";

    /** Base URL for API endpoints */
    const BASE_URL = "https://triviatron-backend.onrender.com/triviatron";

    /** Total time (in seconds) for each game session */
    const TOTAL_TIME = 60;

    /** Tracks current answer streak */
    let streak = 0;

    /** Tracks highest streak reached in a session */
    let highScore = 0;

    /** Interval ID for countdown timer */
    let timerId = null;

    /** Remaining time in seconds */
    let timeRemaining = TOTAL_TIME;

    /** Boolean declaring whether the game is active */
    let gameActive = false;

    /** Audio clip for correct answer ,taken from Youtube*/
    const correct = new Audio("sounds/correct.mp3");
    correct.volume = 0.7;

    /** Audio clip for incorrect answer, taken from Youtube */
    const incorrect = new Audio("sounds/incorrect.mp3");
    incorrect.volume = 0.7;

    /** Looping background music, taken from Youtube, produced by Lil Tecca */
    const backgroundMusic = new Audio("sounds/background-music.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    /**
     * Initializes the game: fetches welcome text and binds start button event.
     */
    function init() {
        fetch(`${BASE_URL}/welcome-text`)
            .then(checkStatus)
            .then(res => res.text())
            .then(text => {
                id("welcome-msg").textContent = text;
            })
            .catch(handleError);

        id("start-btn").addEventListener("click", () => {
            id("start-view").classList.add("hidden");
            id("game-view").classList.remove("hidden");
            startGame();
        });
    }

    /**
     * Starts or restarts the game session.
     */
    function startGame() {
        gameActive = true;
        backgroundMusic.play();
        id("question-container").classList.remove("hidden");
        highScore = 0;
        streak = 0;
        updateStreak();
        timeRemaining = TOTAL_TIME;
        updateTimerDisplay();
        startTimer();
        loadNextQuestion();
    }

    /**
     * Starts the countdown timer.
     */
    function startTimer() {
        timerId = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timerId);
                endGame();
            }
        }, 1000);
    }

    /**
     * Updates the timer display on screen.
     */
    function updateTimerDisplay() {
        const minutes = String(Math.floor(timeRemaining / 60)).padStart(1, "0");
        const seconds = String(timeRemaining % 60).padStart(2, "0");
        id("timer").textContent = `Time Left: ${minutes}:${seconds}`;
    }

    /**
     * Updates the user's current streak display.
     */
    function updateStreak() {
        id("streak").textContent = `Streak: ${streak}`;
    }

    /**
     * Updates the high score display if streak exceeds current high.
     */
    function updateHighScore() {
        if (streak > highScore) {
            highScore = streak;
        }
        id("high-score").textContent = `High Score: ${highScore}`;
    }

    /**
     * Fetches the next trivia question from the server.
     */
    function loadNextQuestion() {
        fetch(`${BASE_URL}/question`)
            .then(checkStatus)
            .then(res => res.json())
            .then(data => {
                displayQuestion(data);
            })
            .catch(handleError);
    }

    /**
     * Displays a trivia question and answer options.
     * @param {Object} data - Question data from server.
     */
    function displayQuestion(data) {
        const questionContainer = id("question-container");
        questionContainer.innerHTML = "";

        const questionDisplay = gen("p");
        questionDisplay.textContent = data.question;
        questionContainer.appendChild(questionDisplay);

        const answerContainer = gen("div");
        answerContainer.id = "answer-container";
        questionContainer.appendChild(answerContainer);

        data.options.forEach(option => {
            const btn = gen("button");
            btn.textContent = option;
            btn.classList.add("answer-option");
            btn.addEventListener("click", () => {
                submitAnswer(data.id, option, btn);
            });
            answerContainer.appendChild(btn);
        });

        enableButtons();
    }

    /**
     * Submits selected answer to server and displays feedback.
     * @param {number} questionId - The question's unique ID.
     * @param {string} selected - The selected answer.
     * @param {HTMLElement} clickedBtn - The button that was clicked.
     */
    function submitAnswer(questionId, selected, clickedBtn) {
        fetch(`${BASE_URL}/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: questionId, selected })
        })
            .then(checkStatus)
            .then(res => res.json())
            .then(data => {
                const feedback = id("feedback");
                feedback.innerHTML = "";
                const feedbackImg = gen("img");
                const feedbackMsg = gen("p");

                if (data.isCorrect) {
                    correct.currentTime = 0;
                    correct.play();
                    clickedBtn.classList.add("correct");
                    disableButtons();
                    streak++;
                    feedbackImg.src = "images/flight-correct.png";
                    feedbackImg.alt = "flight sticking his tongue out";
                    feedbackMsg.textContent = "Correct!";
                } else {
                    incorrect.currentTime = 0;
                    incorrect.play();
                    disableButtons();
                    clickedBtn.classList.add("incorrect");
                    streak = 0;
                    feedbackImg.src = "images/flight-sideeye.png";
                    feedbackImg.alt = "flight sideeye";
                    feedbackMsg.textContent = `Incorrect! The correct answer is: ${data.correctAnswer}`;
                }

                feedback.appendChild(feedbackMsg);
                feedback.appendChild(feedbackImg);
                updateStreak();
                updateHighScore();

                setTimeout(() => {
                    if (gameActive) {
                        feedback.innerHTML = "";
                        loadNextQuestion();
                    }
                }, 2000);
            })
            .catch(handleError);
    }

    /**
     * Ends the game and shows final results with replay option.
     */
    function endGame() {
        gameActive = false;
        clearInterval(timerId);

        const feedback = id("feedback");
        id("question-container").innerHTML = "";
        id("question-container").classList.add("hidden");
        feedback.innerHTML = "";

        const finalMessage = gen("p");
        finalMessage.textContent = `Times Up! Your highest streak was ${highScore}. Play Again?`;
        feedback.appendChild(finalMessage);

        const playAgainBtn = gen("button");
        playAgainBtn.textContent = "Play Again";
        playAgainBtn.id = "play-again-btn";
        playAgainBtn.addEventListener("click", () => {
            feedback.innerHTML = "";
            startGame();
        });

        feedback.appendChild(playAgainBtn);
    }

    /**
     * Disables all answer buttons after a selection.
     */
    function disableButtons() {
        const answers = qsa(".answer-option");
        for (const answer of answers) {
            answer.style.pointerEvents = "none";
        }
    }

    /**
     * Re-enables all answer buttons.
     */
    function enableButtons() {
        const answers = qsa(".answer-option");
        for (const answer of answers) {
            answer.style.pointerEvents = "auto";
        }
    }

    // Initializes the game after the DOM is fully loaded
    window.addEventListener("load", init);

})();
