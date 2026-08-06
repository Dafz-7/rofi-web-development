// load initial state from localstorage (if available)
let quests = JSON.parse(localStorage.getItem("quests")) || [
    { id: 1, title: "Slay the Forest Goblin", completed: false }
];

let deletedQuests = JSON.parse(localStorage.getItem("deletedQuests")) || [];
let currentFilter = "all";

// DOM selectors
const questForm = document.querySelector("#questForm");
const questInput = document.querySelector("#questInput");
const questList = document.querySelector("#questList");
const historyList = document.querySelector("#historyList");
const questStats = document.querySelector("#questStats");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearHistoryBtn = document.querySelector("#clearHistoryBtn");

// helper function: save quest to local storage
function saveToLocalStorage() {
    localStorage.setItem("quests", JSON.stringify(quests));
    localStorage.setItem("deletedQuests", JSON.stringify(deletedQuests));
}

// render function
function render() {

    // filter active quests
    let filteredQuests = quests;
    if (currentFilter === "active") {
        filteredQuests = quests.filter((q) => !q.completed);
    } else if (currentFilter === "completed") {
        filteredQuests = quests.filter((q) => q.completed);
    }

    // render active quests
    questList.innerHTML = "";
    if (filteredQuests.length === 0) {
        questList.innerHTML = `<li class="empty-msg">No quests found in this view.</li>`;
    } else {
        filteredQuests.forEach((quest) => {
            const li = document.createElement("li");
            if (quest.completed) li.classList.add("completed");
    
            li.innerHTML = `
                <div class="quest-content">
                    <input type="checkbox" ${quest.completed ? "checked" : ""} onchange="toggleQuest(${quest.id})">
                    <span>${quest.title}</span>
                </div>
                <button class="delete-btn" onclick="deleteQuest(${quest.id})">Delete</button>
            `;
            questList.appendChild(li);
        });
    }
    

    // render history / deleted quests
    historyList.innerHTML = "";
    if (deletedQuests.length === 0) {
        historyList.innerHTML = `<li class="empty-msg">No deleted history yet.</li>`;
    } else {
        deletedQuests.forEach((quest) => {
            const li = document.createElement("li");
            li.classList.add("history-item");

            li.innerHTML = `
                <span>${quest.title}</span>
                <button class="restore-btn" onclick="restoreQuest(${quest.id})">Restore</button>
            `;
            historyList.appendChild(li);
        });
    }

    // update statistics
    const completedCount = quests.filter((q) => q.completed).length;
    questStats.textContent = `${completedCount} / ${quests.length} Quests Completed`;

    // update filter button UI
    filterButtons.forEach((btn) => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // save state
    saveToLocalStorage();
}

// action functions
function addQuest(title) {
    const newQuest = {
        id: Date.now(),
        title: title,
        completed: false
    };
    quests.push(newQuest);
    render();
}

function toggleQuest(id) {
    quests = quests.map((quest) => {
        if (quest.id === id) {
            return {...quest, completed: !quest.completed};
        }
        return quest;
    });
    render();
}

function deleteQuest(id) {

    // find the quest being deleted
    const questToDelete = quests.find((q) => q.id === id);
    if (questToDelete) {
        // add deleted history
        deletedQuests.push(questToDelete);
        // remove from active list
        quests = quests.filter((q) => q.id !== id);
        render();
    }
}

function restoreQuest(id) {
    
    // find quest in history
    const questToRestore = deletedQuests.find((q) => q.id === id);
    if (questToRestore) {
        // add back to active list
        quests.push(questToRestore);
        // rmeove from deleted history
        deletedQuests = deletedQuests.filter((q) => q.id !== id);
        render();
    }
}

// event listeners
questForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = questInput.value.trim();
    if (title !== "") {
        addQuest(title);
        questInput.value = "";
    }
});

filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        render();
    });
});

clearHistoryBtn.addEventListener("click", () => {
    if (deletedQuests.length > 0 && confirm("Clear all deleted history?")) {
        deletedQuests = [];
        render();
    }
});

// initial render on page load
render();