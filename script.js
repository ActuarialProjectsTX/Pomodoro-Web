// Timer variables
let timeLeft = 25 * 60; // Default 25 minutes in seconds
let isRunning = false;
let isWorkSession = true;
let intervalId = null;
let sessionLength = 25;
let breakLength = 5;

// Task and progress variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM elements
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const taskList = document.getElementById('task-list');
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const sessionInput = document.getElementById('session-length');
const breakInput = document.getElementById('break-length');
const saveSettingsBtn = document.getElementById('save-settings');

// Load saved settings
const savedSettings = JSON.parse(localStorage.getItem('settings'));
if (savedSettings) {
    sessionLength = savedSettings.session || 25;
    breakLength = savedSettings.break || 5;
    sessionInput.value = sessionLength;
    breakInput.value = breakLength;
    timeLeft = sessionLength * 60;
    updateTimerDisplay();
}

// Timer functions
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        intervalId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(intervalId);
                isRunning = false;
                notifyUser();
                switchSession();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function resetTimer() {
    clearInterval(intervalId);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    timeLeft = (isWorkSession ? sessionLength : breakLength) * 60;
    updateTimerDisplay();
}

function switchSession() {
    isWorkSession = !isWorkSession;
    timeLeft = (isWorkSession ? sessionLength : breakLength) * 60;
    updateTimerDisplay();
    if (!isWorkSession) {
        // Increment completed Pomodoros for the first task
        if (tasks.length > 0) {
            tasks[0].completed = (tasks[0].completed || 0) + 1;
            saveTasks();
            renderTasks();
        }
    }
}

function notifyUser() {
    // Sound
    const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
    audio.play();
    // Browser notification
    if (Notification.permission === 'granted') {
        new Notification(isWorkSession ? 'Work session ended!' : 'Break ended!');
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(isWorkSession ? 'Work session ended!' : 'Break ended!');
            }
        });
    }
}

// Task functions
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${task.name} <span>(${task.completed || 0} Pomodoros)</span> 
            <button onclick="deleteTask(${index})">Delete</button>`;
        taskList.appendChild(li);
    });
}

function addTask(name) {
    tasks.push({ name, completed: 0 });
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Settings functions
function saveSettings() {
    sessionLength = parseInt(sessionInput.value);
    breakLength = parseInt(breakInput.value);
    localStorage.setItem('settings', JSON.stringify({ session: sessionLength, break: breakLength }));
    if (!isRunning) {
        timeLeft = (isWorkSession ? sessionLength : breakLength) * 60;
        updateTimerDisplay();
    }
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value.trim());
    taskInput.value = '';
});
saveSettingsBtn.addEventListener('click', saveSettings);

// Initialize
updateTimerDisplay();
renderTasks();