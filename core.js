const apiUrl = "http://localhost:3000";
const toys = document.getElementById("toys");
const kidsOutput = document.getElementById("kids-output");

const output = document.getElementById("output");
const savedOutput = document.getElementById("savedOutput");
let dbToys = [];

function fetchToys() {
    fetch(apiUrl + "/toys")
        .then((response) => response.json())
        .then((data) => {
            // store db toys for later reference
            dbToys = data;

            displayToys();

            fetchChildren();
        })
        .catch();
}
fetchToys();

function displayToys() {
    toys.innerHTML = "";

    for (let i = 0; i < dbToys.length; i++) {
        //toys.innerHTML += `<div id="toy-${i}" data-id="${i}" class="source-element px-2 py-4 rounded-lg bg-white/15 font-semibold text-white border border-solid border-white/20 backdrop-blur" draggable="true">${dbToys[i].name}</div>`;
        toys.innerHTML += `<div class="source-element px-2 py-4 rounded-lg bg-white/15 font-semibold text-white border border-solid border-white/20 backdrop-blur cursor-move hover:bg-indigo-200 transition-colors" draggable="true" data-id="${dbToys[i].id}">${dbToys[i].name}</div>`;
    }

    document.querySelectorAll(".source-element").forEach((source) => {
        source.addEventListener("dragstart", handleDragStart);
    });
}

function fetchChildren() {
    kidsOutput.innerHTML = "";

    let toyOptions = "";
    for (let i = 0; i < dbToys.length; i++) {
        toyOptions += `<option value="${dbToys[i].name}">${dbToys[i].name}</option>`;
    }

    fetch(apiUrl + "/kids")
        .then((res) => res.json())
        .then((data) => {
            console.log(data);

            if (data.length === 0) {
                const noPostsMessage = document.createElement("div");
                noPostsMessage.className = "no-posts-message";
                noPostsMessage.textContent = "No children available. Add your first child!";
                kidsOutput.appendChild(noPostsMessage);
                return;
            }

            // Sort posts by timestamp in descending order
            const sortedData = data.sort((a, b) => {
                const textA = a.name.toUpperCase();
                const textB = b.name.toUpperCase();
                return textA < textB ? -1 : textA > textB ? 1 : 0;
            });
            sortedData.forEach((child) => {
                kidsOutput.innerHTML += `
                      <div id="child-${child.id}" class="child-item bg-white/10 my-2 rounded-md flex gap-2 items-center justify-end p-2 text-white border border-solid border-white/20">
                          <span class="childName display-block w-6/12">${child.name}</span>
                          <div class="edit-form" style="display: none;">
                              <input type="text" class="edit-name" value="${child.name}">
                              <button class="smallbutton" onclick="saveEdit('${child.id}')">S</button>
                              <button class="smallbutton" onclick="cancelEdit('${child.id}')">X</button>
                          </div>
                          <div class="grid grid-cols-2 gap-2 mb-2 w-3/12">
                            <button onclick="editChild('${child.id}')" class="button !min-w-0 !py-0">Edit</button>
                            <button onclick="saveToLocal('${child.id}')" class="button !min-w-0 !py-0">Save</button>
                            <button onclick="deleteChild('${child.id}')" class="button w-full !min-w-0 !py-0">Delete</button>
                          </div>
                          <div class="target-container bg-gray-100/10 border-2 border-dashed border-gray-400 p-4 rounded-lg min-h-[80px] transition-colors w-5/12 flex flex-wrap gap-2 justify-center" data-target="${child.id}"><div class="text-white/50 text-center pb-2 w-full">Drag toys here</div></div>
                      </div>
                  `;
                //   <div id="presents-${child.id}" class="target-container bg-green-200 w-96 h-10" data-target="${child.id}"></div>
                //   <select id="toys-${child.id}">${toyOptions}</select>
                //   <button onclick="addPresent('${child.id}')">Add</button>
            });

            // Initialize drag and drop
            document.querySelectorAll(".target-container").forEach((target) => {
                target.addEventListener("dragover", handleDragOver);
                target.addEventListener("dragleave", handleDragLeave);
                target.addEventListener("drop", handleDrop);
            });
        })
        .catch((e) => console.error("Error fetching children:", e));
}

// Add new child
document.getElementById("btn-add-child").addEventListener("click", () => {
    const newPost = {
        name: document.getElementById("input-name").value,
        timestamp: Date.now(), // Add timestamp when creating new post
    };

    fetch(apiUrl + "/kids", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
    })
        .then((res) => res.json())
        .then(() => {
            fetchChildren();
            document.getElementById("input-name").value = "";
        })
        .catch((e) => console.error("Error adding child:", e));
});

// Delete chikd
function deleteChild(id) {
    fetch(`${apiUrl}/kids/${id}`, {
        method: "DELETE",
    })
        .then(() => fetchChildren())
        .catch((e) => console.error("Error deleting child:", e));
}

// Clear localStorage
document.getElementById("clearStorage").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all saved posts?")) {
        localStorage.removeItem("savedPosts");
        loadSavedPosts();
    }
});

//document.querySelectorAll(".target-container")
function saveToLocal(childId) {
    try {
        const childElement = document.getElementById("child-" + childId);
        const childToys = childElement.querySelectorAll(`.target-container .dropped-item`);
        let childToysIds = [];

        for (let item of childToys) {
            childToysIds.push(item.innerHTML);
        }

        const child = {
            id: childId,
            name: childElement.querySelector(".childName").innerHTML,
            toys: childToysIds,
        };

        const savedChildren = JSON.parse(localStorage.getItem("savedChildren") || "[]");

        console.log(savedChildren);

        if (!savedChildren.some((p) => p.id === child.id)) {
            // Comparing strings with strings
            savedChildren.push(child);
            localStorage.setItem("savedChildren", JSON.stringify(savedChildren));
            loadSavedChildren();
        } else {
            alert("This child is already saved!");
        }
    } catch (error) {
        console.error("Error saving child:", error);
    }
}

// Load saved posts from localStorage
function loadSavedChildren() {
    try {
        const savedChildren = JSON.parse(localStorage.getItem("savedChildren") || "[]");
        savedOutput.innerHTML = "";

        if (savedChildren.length === 0) {
            const noChildrenMessage = document.createElement("div");
            noChildrenMessage.className = "no-posts-message";
            noChildrenMessage.textContent = "No saved children yet!";
            savedOutput.appendChild(noChildrenMessage);
            return;
        }

        // Sort saved posts by timestamp in descending order
        savedChildren.sort((a, b) => b.timestamp - a.timestamp);
        savedChildren.forEach((child) => {
            const childDiv = document.createElement("div");
            childDiv.className = "child-item";
            childDiv.innerHTML = `
                  <span>${child.name} ${child.toys.map((x) => '<div class="label">' + x + '</div>')}</span>
                  <button class="button w-10" onclick="removeFromSaved('${child.id}')">Remove</button>
              `;
            savedOutput.appendChild(childDiv);
        });
    } catch (error) {
        console.error("Error loading saved children:", error);
        localStorage.setItem("savedChildren", "[]");
    }
}
loadSavedChildren();

// Remove post from saved posts
function removeFromSaved(childId) {
    try {
        const savedChildren = JSON.parse(localStorage.getItem("savedChildren") || "[]");
        // Convert postId to string for consistent comparison
        const childIdString = String(childId);
        const updatedChildren = savedChildren.filter((child) => child.id !== childIdString);
        localStorage.setItem("savedChildren", JSON.stringify(updatedChildren));
        loadSavedChildren();
    } catch (error) {
        console.error("Error removing saved child:", error);
    }
}

// Refresh button - anyways; absolute refresh bruh ;)
document.getElementById("clear").addEventListener("click", fetchChildren);

// Drag and drop
function handleDragStart(e) {
    console.log(e);
    e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
            id: e.target.dataset.id,
            text: e.target.textContent,
        })
    );
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-100/10");
    e.currentTarget.classList.add("bg-blue-100/30", "border-blue-500");
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove("bg-blue-100/30", "border-blue-500");
    e.currentTarget.classList.add("bg-gray-100/10");
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-100/30", "border-blue-500");
    e.currentTarget.classList.add("bg-gray-100/10");

    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const targetContainer = e.currentTarget;

    // Check if this item already exists in this target
    const existingItems = targetContainer.querySelectorAll(".dropped-item");
    for (let item of existingItems) {
        if (item.dataset.sourceId === data.id) {
            return; // Item already exists in this target
        }
    }

    // Create new dropped item
    const droppedItem = document.createElement("div");
    droppedItem.className = "dropped-item bg-pink-100/20 rounded-md border-2 border-pink-300 p-2 min-w-40";
    droppedItem.textContent = data.text;
    droppedItem.dataset.sourceId = data.id;

    targetContainer.appendChild(droppedItem);
}
