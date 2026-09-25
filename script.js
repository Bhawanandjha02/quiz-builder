let currentUser = null;
let currentQuiz = null;

document.addEventListener("DOMContentLoaded", function () {
    let user = localStorage.getItem("loggedUser");

    if (user) {
        currentUser = JSON.parse(user);
        showApplication();
    } else {
        showLogin();
    }
});

function showSignup() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("signupBox").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("signupBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}

function signup() {
    let username = document.getElementById("signupUsername").value.trim();
    let email = document.getElementById("signupEmail").value.trim();
    let password = document.getElementById("signupPassword").value;
    let message = document.getElementById("signupMessage");

    if (!username || !email || !password) {
        message.textContent = "Please fill all fields.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    for (let user of users) {
        if (user.username === username) {
            message.textContent = "Username already exists.";
            return;
        }
    }

    users.push({
        username: username,
        email: email,
        password: password
    });

    localStorage.setItem("users", JSON.stringify(users));

    message.textContent = "Account created successfully!";

    document.getElementById("signupUsername").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";

    setTimeout(function () {
        message.textContent = "";
        showLogin();
    }, 1000);
}

function login() {
    let username = document.getElementById("loginUsername").value.trim();
    let password = document.getElementById("loginPassword").value;
    let message = document.getElementById("loginMessage");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let foundUser = null;

    for (let user of users) {
        if (user.username === username && user.password === password) {
            foundUser = user;
            break;
        }
    }

    if (!foundUser) {
        message.textContent = "Invalid username or password.";
        return;
    }

    currentUser = foundUser;
    localStorage.setItem("loggedUser", JSON.stringify(foundUser));

    message.textContent = "";
    showApplication();
}

function showApplication() {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("appSection").classList.remove("hidden");

    document.getElementById("welcomeUser").textContent =
        currentUser.username;

    document.getElementById("profileUsername").textContent =
        currentUser.username;

    document.getElementById("profileEmail").textContent =
        currentUser.email;

    updateDashboard();
    showModule("dashboard");
}

function logout() {
    localStorage.removeItem("loggedUser");

    currentUser = null;
    currentQuiz = null;

    document.getElementById("appSection").classList.add("hidden");
    document.getElementById("authSection").classList.remove("hidden");

    showLogin();
}

function showModule(id) {
    let modules = document.querySelectorAll(".module");

    modules.forEach(function (module) {
        module.classList.add("hidden");
    });

    let selected = document.getElementById(id);

    if (selected) {
        selected.classList.remove("hidden");
    }

    if (id === "dashboard") {
        updateDashboard();
    }

    if (id === "quizList") {
        loadQuizzes();
    }
}

function addQuestion() {
    let container = document.getElementById("questionsContainer");
    let number = container.children.length + 1;

    let box = document.createElement("div");
    box.className = "question-box";

    box.innerHTML = `
        <h3>Question ${number}</h3>

        <input type="text"
            class="question-text"
            placeholder="Enter question">

        <div class="option-row">
            <input type="radio" name="correct${number}" value="0">
            <input type="text" class="option" placeholder="Option 1">
        </div>

        <div class="option-row">
            <input type="radio" name="correct${number}" value="1">
            <input type="text" class="option" placeholder="Option 2">
        </div>

        <div class="option-row">
            <input type="radio" name="correct${number}" value="2">
            <input type="text" class="option" placeholder="Option 3">
        </div>

        <div class="option-row">
            <input type="radio" name="correct${number}" value="3">
            <input type="text" class="option" placeholder="Option 4">
        </div>
    `;

    container.appendChild(box);
}

function saveQuiz() {
    let title = document.getElementById("quizTitle").value.trim();
    let description =
        document.getElementById("quizDescription").value.trim();

    let message = document.getElementById("quizMessage");

    if (!title) {
        message.textContent = "Please enter quiz title.";
        return;
    }

    let boxes = document.querySelectorAll(".question-box");

    if (boxes.length === 0) {
        message.textContent = "Please add at least one question.";
        return;
    }

    let questions = [];

    for (let i = 0; i < boxes.length; i++) {
        let box = boxes[i];

        let question =
            box.querySelector(".question-text").value.trim();

        let options = [];

        box.querySelectorAll(".option").forEach(function (input) {
            options.push(input.value.trim());
        });

        let correct = box.querySelector(
            `input[name="correct${i + 1}"]:checked`
        );

        if (!question) {
            message.textContent = `Enter Question ${i + 1}.`;
            return;
        }

        if (options.includes("")) {
            message.textContent =
                `Fill all options for Question ${i + 1}.`;
            return;
        }

        if (!correct) {
            message.textContent =
                `Select the correct answer for Question ${i + 1}.`;
            return;
        }

        questions.push({
            question: question,
            options: options,
            correct: Number(correct.value)
        });
    }

    let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];

    let newQuiz = {
        id: Date.now(),
        owner: currentUser.username,
        title: title,
        description: description,
        questions: questions
    };

    quizzes.push(newQuiz);

    localStorage.setItem("quizzes", JSON.stringify(quizzes));

    message.textContent = "Quiz created successfully!";

    document.getElementById("quizTitle").value = "";
    document.getElementById("quizDescription").value = "";
    document.getElementById("questionsContainer").innerHTML = "";

    setTimeout(function () {
        showModule("quizList");
    }, 800);
}

function loadQuizzes() {
    let container = document.getElementById("quizContainer");
    container.innerHTML = "";

    let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];

    let myQuizzes = quizzes.filter(function (quiz) {
        return quiz.owner === currentUser.username;
    });

    if (myQuizzes.length === 0) {
        container.innerHTML = `
            <div class="quiz-card">
                <h2>No quizzes found</h2>
                <p>Create your first quiz.</p>
            </div>
        `;
        return;
    }

    myQuizzes.forEach(function (quiz) {
        let card = document.createElement("div");
        card.className = "quiz-card";

        card.innerHTML = `
            <h2>${escapeHTML(quiz.title)}</h2>
            <p>${escapeHTML(quiz.description || "No description")}</p>
            <p>Questions: ${quiz.questions.length}</p>

            <button onclick="startQuiz(${quiz.id})">
                Attempt
            </button>

            <button class="delete-btn"
                onclick="deleteQuiz(${quiz.id})">
                Delete
            </button>
        `;

        container.appendChild(card);
    });
}

function startQuiz(id) {
    let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];

    currentQuiz = quizzes.find(function (quiz) {
        return quiz.id === id;
    });

    if (!currentQuiz) {
        alert("Quiz not found.");
        return;
    }

    document.getElementById("attemptTitle").textContent =
        currentQuiz.title;

    document.getElementById("attemptDescription").textContent =
        currentQuiz.description || "";

    let container = document.getElementById("attemptQuestions");
    container.innerHTML = "";

    currentQuiz.questions.forEach(function (question, index) {
        let questionBox = document.createElement("div");
        questionBox.className = "attempt-question";

        let options = "";

        question.options.forEach(function (option, i) {
            options += `
                <label class="answer-option">
                    <input type="radio"
                        name="question${index}"
                        value="${i}">
                    ${escapeHTML(option)}
                </label>
            `;
        });

        questionBox.innerHTML = `
            <h3>${index + 1}. ${escapeHTML(question.question)}</h3>
            ${options}
        `;

        container.appendChild(questionBox);
    });

    showModule("attemptQuiz");
}

function submitQuiz() {
    if (!currentQuiz) {
        return;
    }

    let score = 0;

    currentQuiz.questions.forEach(function (question, index) {
        let selected = document.querySelector(
            `input[name="question${index}"]:checked`
        );

        if (selected && Number(selected.value) === question.correct) {
            score++;
        }
    });

    let total = currentQuiz.questions.length;
    let percentage = 0;

    if (total > 0) {
        percentage = Math.round((score / total) * 100);
    }

    document.getElementById("score").textContent =
        `${score}/${total}`;

    document.getElementById("resultMessage").textContent =
        `You scored ${percentage}%`;

    saveAttempt(score, total);
    showModule("result");
}

function saveAttempt(score, total) {
    let attempts =
        JSON.parse(localStorage.getItem("attempts")) || [];

    attempts.push({
        username: currentUser.username,
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        score: score,
        total: total,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("attempts", JSON.stringify(attempts));
}

function deleteQuiz(id) {
    if (!confirm("Are you sure you want to delete this quiz?")) {
        return;
    }

    let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];

    quizzes = quizzes.filter(function (quiz) {
        return !(
            quiz.id === id &&
            quiz.owner === currentUser.username
        );
    });

    localStorage.setItem("quizzes", JSON.stringify(quizzes));

    loadQuizzes();
    updateDashboard();
}

function updateDashboard() {
    if (!currentUser) {
        return;
    }

    let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    let attempts = JSON.parse(localStorage.getItem("attempts")) || [];

    let myQuizzes = quizzes.filter(function (quiz) {
        return quiz.owner === currentUser.username;
    });

    let questionCount = 0;

    myQuizzes.forEach(function (quiz) {
        questionCount += quiz.questions.length;
    });

    let myAttempts = attempts.filter(function (attempt) {
        return attempt.username === currentUser.username;
    });

    document.getElementById("quizCount").textContent =
        myQuizzes.length;

    document.getElementById("questionCount").textContent =
        questionCount;

    document.getElementById("attemptCount").textContent =
        myAttempts.length;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}