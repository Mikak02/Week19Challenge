//create variable to hold db connection
let db;

//establish a connection to indexeddb database called 'budget_tracker and set it to version 1
const request = indexedDB.open("budget_tracker", 1);

//this event will emit if the database version changes (nonexistant to version1, v1 to v2, etc.)
request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("pending", {
        keypath: "id",
        autoIncrement: true
    });
};

//upon a successful
request.onsuccess = (event) => {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = (event) => {
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
// open a new transaction with the database with read and write permissions
    const transaction = db.transaction("pending", "readwrite");
// access the object store for `new_transaction   
    const store = transaction.objectStore("pending");
// add record to your store with add method
    store.add(record)
};

function checkDatabase() {
    const transaction = db.transaction("pending", "readonly");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

// upon a succesful .getAll() execution, run this function    
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then((response) => response.json())
            .then(() => {
                const transaction = db.transaction("pending", "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    };
}

window.addEventListener("online", checkDatabase);