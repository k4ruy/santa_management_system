const apiUrl = "http://localhost:3000";
const toys = document.getElementById("toylist");
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
        })
        .catch();
}
fetchToys();

function displayToys() {
    toys.innerHTML = "";

    for (let i = 0; i < dbToys.length; i++) {
        //toys.innerHTML += `<div id="toy-${i}" data-id="${i}" class="source-element px-2 py-4 rounded-lg bg-white/15 font-semibold text-white border border-solid border-white/20 backdrop-blur" draggable="true">${dbToys[i].name}</div>`;
        toys.innerHTML += `
            <div class="flex justify-between source-element px-2 py-4 rounded-lg bg-white/15 font-semibold text-white border border-solid border-white/20 backdrop-blur cursor-move hover:bg-indigo-200 transition-colors" draggable="true" data-id="${dbToys[i].id}">
                ${dbToys[i].name}
                <div onclick="deleteToy('${dbToys[i].id}')" class="">
                    <svg class="w-5 h-45 data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path>
                    </svg>
                </div>
            </div>`;
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
                      <div id="child-${child.id}" class="child-item bg-white/10 my-2 rounded-md flex flex-wrap gap-2 items-center justify-end p-2 text-white border border-solid border-white/20">
                          <div class="child-content">
                              <div class="flex justify-between w-96">
                                  <div class="childName w-1/3">${child.name}</div>
                                  <div class="childPoints w-1/3">${child.points} points</div>
                                  <div class="childLocation w-1/3">${child.location}</div>
                              </div>
                          </div>
                          <div class="edit-form" style="display: none;">
                            <div class="flex flex-row items-center gap-2">
                                <input type="text" class="edit-name text-input" value="${child.name}">
                                <input type="number" class="edit-points text-input w-20" value="${child.points}">
                                <input type="text" class="edit-location text-input" value="${child.location}">
                                <button class="smallbutton" onclick="saveEdit('${child.id}')">
                                    <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                                    </svg>
                                </button>
                                <button class="smallbutton" onclick="cancelEdit('${child.id}')">
                                    <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"></path>
                                    </svg>
                                </button>
                            </div>
                          </div>
                          <div class="button-group w-full lg:w-40">
                            <div class="grid grid-cols-3 lg:grid-cols-2 gap-2 mb-2">
                                <button onclick="editChild('${child.id}')" class="button">Edit</button>
                                <button onclick="saveToLocal('${child.id}')" class="button">Save</button>
                                <button onclick="deleteChild('${child.id}')" class="button lg:w-full lg:col-span-2">Delete</button>
                            </div>
                          </div>
                          <div class="target-container bg-gray-100/10 border-2 border-dashed border-gray-400 p-4 rounded-lg min-h-[80px] transition-colors w-full flex flex-wrap gap-2 justify-center" data-target="${child.id}"><div class="text-white/50 text-center pb-2 w-full">Drag toys here</div></div>
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
fetchChildren();

// Add new child
document.getElementById("btn-add-child").addEventListener("click", () => {
    const newPost = {
        name: document.getElementById("input-name").value,
        points: parseInt(document.getElementById("input-points").value),
        location: document.getElementById("input-location").value,
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
            document.getElementById("input-points").value = "";
            document.getElementById("input-location").value = "";
        })
        .catch((e) => console.error("Error adding child:", e));
});

// Add new toy
document.getElementById("btnAddToy").addEventListener("click", () => {
    const newToy = {
        name: document.getElementById("toyName").value
    }

    fetch(apiUrl + "/toys", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newToy),
    })
        .then((res) => res.json())
        .then(() => {
            fetchToys();
            document.getElementById("toyName").value = "";$
        })
        .catch((e) => console.error("Error adding toy:", e));
})

// Delete toy
function deleteToy(id) {
    fetch(`${apiUrl}/toys/${id}`, {
        method: "DELETE"
    })
    .then(() => fetchToys())
    .catch((e) => console.error("Error deleting toy:", e));
}

// Edit child
function editChild(id) {
    // Show edit form and hide content for the selected post
    const childDiv = document.getElementById(`child-${id}`);
    childDiv.querySelector(".child-content").style.display = "none";
    childDiv.querySelector(".edit-form").style.display = "block";
    childDiv.querySelector(".button-group").style.display = "none";
}

// Cancel edit
function cancelEdit(id) {
    // Hide edit form and show content
    const childDiv = document.getElementById(`child-${id}`);
    childDiv.querySelector(".child-content").style.display = "block";
    childDiv.querySelector(".edit-form").style.display = "none";
    childDiv.querySelector(".button-group").style.display = "block";
}

// Save edit
function saveEdit(id) {
    // Get the edited values
    const childDiv = document.getElementById(`child-${id}`);
    const newName = childDiv.querySelector(".edit-name").value;
    const newPoints = parseInt(childDiv.querySelector(".edit-points").value);
    const newLocation = childDiv.querySelector(".edit-location").value;

    // Create updated child object
    const updatedChild = {
        name: newName,
        points: newPoints,
        location: newLocation,
        timestamp: Date.now(), // Update timestamp
    };

    console.log(updatedChild);

    // Send PUT request to update the post
    fetch(`${apiUrl}/kids/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedChild),
    })
        .then((res) => res.json())
        .then(() => {
            // Refresh the posts display
            fetchChildren();
        })
        .catch((e) => console.error("Error updating child:", e));
}

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
        localStorage.removeItem("savedChildren");
        loadSavedChildren();
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
            points: childElement.querySelector(".childPoints").innerHTML,
            location: childElement.querySelector(".childLocation").innerHTML,
            toys: childToysIds,
        };

        console.log(child);

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
                    <div class="grid grid-cols-4 justify-between gap-4 w-full">
                        <div class="childName">${child.name}</div>
                        <div class="childPoints">${child.points}</div>
                        <div class="childLocation">${child.location}</div>
                        <div class="childToys col-span-4">${child.toys.map((x) => '<div class="label mb-2">' + x + "</div>").join("")}</div>
                    </div>
                  <button class="button px-2 lg:min-w-48 py-2" onclick="removeFromSaved('${child.id}')">Remove</button>
              `;


{/*
                  <span>${child.name} ${child.toys.map((x) => '<div class="label">' + x + "</div>").join("")}</span> <div class="child-content">
    <div class="flex justify-between w-96">
        <div class="childName w-1/3">${child.name}</div>
        <div class="childPoints w-1/3">${child.points} points</div>
        <div class="childLocation w-1/3">${child.location}</div>
    </div>
</div> */}


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
