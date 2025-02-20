// Timer variables
let sessionLength = 25; // Default duration in minutes
let timeLeft = sessionLength * 60;
let isRunning = false;
let intervalId = null;
let currentTask = null;
let totalPomodoros = 0;
let totalTimeSpent = 0;
let selectedSound = 'beep'; // Default sound

// DOM elements
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const taskSelect = document.getElementById('task-select');
const taskList = document.getElementById('task-list');
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const applySettingsBtn = document.getElementById('apply-settings');
const closeSettingsBtn = document.getElementById('close-settings');

// Load tasks and settings from local storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const savedSettings = JSON.parse(localStorage.getItem('settings'));
if (savedSettings) {
    document.documentElement.style.setProperty('--bg-color', savedSettings.bgColor);
    document.documentElement.style.setProperty('--text-color', savedSettings.textColor);
    document.documentElement.style.setProperty('--button-bg', savedSettings.buttonBg);
    document.documentElement.style.setProperty('--timer-color', savedSettings.timerColor);
    selectedSound = savedSettings.sound || 'beep';
    document.getElementById('sound-select').value = selectedSound;
    document.getElementById('bg-color').value = savedSettings.bgColor;
    document.getElementById('text-color').value = savedSettings.textColor;
    document.getElementById('button-bg').value = savedSettings.buttonBg;
    document.getElementById('timer-color').value = savedSettings.timerColor;
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// Start timer
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
                finishPomodoro();
            }
        }, 1000);
    }
}

// Pause timer
function pauseTimer() {
    clearInterval(intervalId);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Reset timer
function resetTimer() {
    clearInterval(intervalId);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    timeLeft = sessionLength * 60;
    updateTimerDisplay();
}

// Finish Pomodoro session
function finishPomodoro() {
    if (currentTask) {
        const task = tasks.find(t => t.name === currentTask);
        task.completed = (task.completed || 0) + 1;
        totalPomodoros++;
        totalTimeSpent += sessionLength;
        updateStats();
        saveTasks();
        renderTasks();
    }
    playSound(selectedSound);
    alert('Pomodoro completed!');
    resetTimer();
}

// Play sound
function playSound(type) {
    if (type === 'silence') return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    if (type === 'beep') {
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'chime') {
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
    }
}

// Update stats display
function updateStats() {
    document.getElementById('total-pomodoros').textContent = `Total Pomodoros: ${totalPomodoros}`;
    document.getElementById('total-time').textContent = `Total Time Spent: ${totalTimeSpent} minutes`;
}

// Set duration from buttons
function setDuration(minutes) {
    sessionLength = minutes;
    timeLeft = sessionLength * 60;
    updateTimerDisplay();
}

// Set custom duration
function setCustomDuration() {
    const customMinutes = parseInt(document.getElementById('custom-duration').value);
    if (customMinutes > 0) {
        sessionLength = customMinutes;
        timeLeft = sessionLength * 60;
        updateTimerDisplay();
    }
}

// Render tasks
function renderTasks() {
    taskList.innerHTML = '';
    taskSelect.innerHTML = '<option value="">Select a task</option>';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${task.name} <span>(${task.completed || 0} Pomodoros)</span> 
            <button onclick="deleteTask(${index})">Delete</button>`;
        taskList.appendChild(li);

        const option = document.createElement('option');
        option.value = task.name;
        option.textContent = task.name;
        taskSelect.appendChild(option);
    });
    if (currentTask) taskSelect.value = currentTask;
}

// Add task
function addTask(name) {
    tasks.push({ name, completed: 0 });
    saveTasks();
    renderTasks();
}

// Delete task
function deleteTask(index) {
    tasks.splice(index, 1);
    if (tasks.length === 0) currentTask = null;
    saveTasks();
    renderTasks();
}

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Apply settings
function applySettings() {
    const bgColor = document.getElementById('bg-color').value;
    const textColor = document.getElementById('text-color').value;
    const buttonBg = document.getElementById('button-bg').value;
    const timerColor = document.getElementById('timer-color').value;
    const sound = document.getElementById('sound-select').value;

    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--button-bg', buttonBg);
    document.documentElement.style.setProperty('--timer-color', timerColor);

    selectedSound = sound;

    localStorage.setItem('settings', JSON.stringify({
        bgColor,
        textColor,
        buttonBg,
        timerColor,
        sound
    }));

    settingsPanel.classList.remove('open');
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
taskSelect.addEventListener('change', (e) => {
    currentTask = e.target.value || null;
});
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('open');
});
closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('open');
});
applySettingsBtn.addEventListener('click', applySettings);

// Initialize
updateTimerDisplay();
renderTasks();
updateStats();
