/**
 * CRM Connector for Adobe Creative Cloud
 *
 * This script creates a dockable panel in Adobe applications to connect to a CRM,
 * log in, and view assigned tasks.
 */

var BASE_URL = "http://127.0.0.1:8000/api/";
var authToken = null;

/**
 * A simple HTTP request function using ExtendScript's Socket object.
 * @param {string} method - The HTTP method (e.g., "POST", "GET").
 * @param {string} url - The URL to send the request to.
 * @param {object} headers - An object of request headers.
 * @param {string} body - The request body.
 * @returns {object} - An object containing the response status, headers, and body.
 */
function makeHttpRequest(method, url, headers, body) {
    var host, path;
    var urlParts = url.replace("http://", "").split("/");
    host = urlParts[0];
    path = "/" + urlParts.slice(1).join("/");

    var conn = new Socket();
    var request = method + " " + path + " HTTP/1.1\r\n";
    request += "Host: " + host + "\r\n";

    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            request += key + ": " + headers[key] + "\r\n";
        }
    }
    request += "Connection: close\r\n";
    if (body) {
        request += "Content-Length: " + body.length + "\r\n";
    }
    request += "\r\n";
    if (body) {
        request += body;
    }

    var response = "";
    if (conn.open(host, "UTF-8")) {
        conn.write(request);
        response = conn.read(999999);
        conn.close();
    } else {
        return { status: -1, body: "Failed to connect to host." };
    }

    var responseParts = response.split("\r\n\r\n");
    var responseHeaderPart = responseParts[0];
    var responseBody = responseParts.slice(1).join("\r\n\r\n");
    var headerLines = responseHeaderPart.split("\r\n");
    var statusLine = headerLines[0];
    var status = parseInt(statusLine.split(" ")[1]);

    return {
        status: status,
        body: responseBody
    };
}


function createCrmConnectorPanel() {
    // Main Panel
    var pal = new Window("palette", "CRM Connector", undefined, { dockable: true });
    if (pal === null) return;

    pal.orientation = "column";
    pal.alignChildren = ["fill", "top"];
    pal.spacing = 10;
    pal.margins = 10;

    // -- LOGIN GROUP
    var loginGroup = pal.add("group", undefined, { name: "loginGroup" });
    loginGroup.orientation = "column";
    loginGroup.alignChildren = ["fill", "top"];
    loginGroup.spacing = 10;
    loginGroup.margins = 0;

    var usernameGroup = loginGroup.add("group");
    usernameGroup.add("statictext", undefined, "Username:");
    var username = usernameGroup.add("edittext", undefined, "");
    username.characters = 20;

    var passwordGroup = loginGroup.add("group");
    passwordGroup.add("statictext", undefined, "Password:");
    var password = passwordGroup.add("edittext", undefined, "", { password: true });
    password.characters = 20;

    var loginStatusText = loginGroup.add("statictext", undefined, "", { multiline: false });
    loginStatusText.characters = 30;

    var loginBtn = loginGroup.add("button", undefined, "Login");

    // -- TASK LIST GROUP (Initially Hidden)
    var taskListGroup = pal.add("group", undefined, { name: "taskListGroup" });
    taskListGroup.orientation = "column";
    taskListGroup.alignChildren = ["fill", "top"];
    taskListGroup.spacing = 10;
    taskListGroup.margins = 0;
    taskListGroup.visible = false;

    var taskList = taskListGroup.add("listbox", [0, 0, 350, 300], [], {
        numberOfColumns: 3,
        showHeaders: true,
        columnTitles: ["Task", "Project", "Status"],
    });
    
    var taskStatusText = taskListGroup.add("statictext", undefined, "", { multiline: false });
    taskStatusText.characters = 30;
    
    var refreshBtn = taskListGroup.add("button", undefined, "Refresh");
    refreshBtn.onClick = function() {
        fetchAndDisplayTasks();
    };


    // -- LOGIN BUTTON CLICK HANDLER
    loginBtn.onClick = function () {
        var user = username.text;
        var pass = password.text;

        if (user === "" || pass === "") {
            alert("Please enter a username and password.");
            return;
        }

        loginStatusText.text = "Logging in...";
        pal.update();

        var loginUrl = BASE_URL + "users/login/";
        var headers = {
            "Content-Type": "application/json"
        };
        var body = JSON.stringify({
            username: user,
            password: pass
        });

        var response = makeHttpRequest("POST", loginUrl, headers, body);

        if (response.status === 200) {
            loginStatusText.text = "Login successful!";
            var responseBody = JSON.parse(response.body);
            authToken = responseBody.access;
            
            // TODO: Store token more securely if possible

            loginGroup.visible = false;
            taskListGroup.visible = true;
            
            fetchAndDisplayTasks();

        } else {
            loginStatusText.text = "Login failed.";
            var errorMessage = "Login failed. Status: " + response.status;
            if(response.body) {
                try {
                    var errorBody = JSON.parse(response.body);
                    errorMessage += "\n" + (errorBody.detail || JSON.stringify(errorBody));
                } catch(e) {
                    errorMessage += "\nCould not parse error response.";
                }
            }
            alert(errorMessage);
        }
    };
    
    function fetchAndDisplayTasks() {
        if (!authToken) {
            alert("Not authenticated. Please login first.");
            return;
        }

        taskStatusText.text = "Loading tasks...";
        taskList.removeAll();
        pal.update();

        var tasksUrl = BASE_URL + "stage-elements/";
        var headers = {
            "Authorization": "Bearer " + authToken
        };

        var response = makeHttpRequest("GET", tasksUrl, headers, "");

        if (response.status === 200) {
            taskStatusText.text = "Tasks loaded.";
            var tasks = JSON.parse(response.body);
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                taskList.add("item", [task.template_name, task.project_name, task.status]);
            }
        } else {
            taskStatusText.text = "Failed to load tasks.";
            alert("Failed to load tasks. Status: " + response.status);
        }
    }


    pal.layout.layout(true);
    pal.layout.resize();
    pal.onResizing = pal.onResize = function () {
        this.layout.resize();
    }

    if (pal instanceof Window) {
        pal.center();
        pal.show();
    }
}

createCrmConnectorPanel();
