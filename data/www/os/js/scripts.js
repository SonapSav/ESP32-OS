$(document).ready(function () {

    const esp32IPDomain = window.location.hostname;
    const maxSizeOfFileToMoveCopy = 92160;
    //console.log("ESP32 IP/Domain name: " + esp32IPDomain);
    //console.log("Maximum file size:  " + bytesConverter(maxSizeOfFileToMoveCopy, 2, "file"));

    const fileTypesArray = [
        ".jpg",
        ".png",
        ".gif",
        ".html",
        ".htm",
        ".js",
        ".css",
        ".pdf",
        ".txt"
    ];
    const fileTypesArrayNoDot = dotRemover(fileTypesArray);
    const touchFileTypesArray = [
        ".html",
        ".htm",
        ".js",
        ".css",
        ".txt"
    ];
    const iconTypesArray = [
        "<i class=\"bi bi-filetype-jpg\"></i>", 
        "<i class=\"bi bi-filetype-png\"></i>", 
        "<i class=\"bi bi-filetype-gif\"></i>", 
        "<i class=\"bi bi-filetype-html\"></i>", 
        "<i class=\"bi bi-filetype-html\"></i>", 
        "<i class=\"bi bi-filetype-js\"></i>", 
        "<i class=\"bi bi-filetype-css\"></i>", 
        "<i class=\"bi bi-filetype-pdf\"></i>", 
        "<i class=\"bi bi-filetype-txt\"></i>"
    ];

    let initiator = "";

    function getFilesystem() {
        let esp32FS;
        let request = new XMLHttpRequest();
        request.open("GET", "http://" + esp32IPDomain + "/filesystem.json", false);
        request.send(null);
        if (request.status === 200) {
            esp32FS = JSON.parse(request.responseText);
            return esp32FS;
        }
    }

    let esp32FS = getFilesystem();

    // DESKTOP

    // Date and time
    function showDateTime() {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const nowDateTime = new Date();
        const date = nowDateTime.getDate().toString();
        const month = nowDateTime.getMonth().toString(); 
        const year = nowDateTime.getFullYear().toString();
        const weekday = nowDateTime.getDay().toString();
        const hrs = nowDateTime.getHours().toString();
        const min = nowDateTime.getMinutes().toString();
        let formattedMonth = (nowDateTime.getMonth() < 10) ? "0" + month : month;
        let formattedDay = (nowDateTime.getDate() < 10) ? "0" + date : date;
        let formattedHours = (nowDateTime.getHours() < 10) ? "0" + hrs : hrs;
        let formattedMinutes = (nowDateTime.getMinutes() < 10) ? "0" + min : min;
        let resultDate = "";
        let resultTime = "";
        formattedMonth = formattedMonth.indexOf("0") == 0 ? formattedMonth.substring(1, 2) : formattedMonth;
        formattedDay = formattedDay.indexOf("0") == 0 ? formattedDay.substring(1, 2) : formattedDay;
        resultDate = weekdayNames[nowDateTime.getDay()] + ", " + monthNames[nowDateTime.getMonth()] + " " + formattedDay + " " + year;
        resultTime = formattedHours + ":" + formattedMinutes;
        $("#desktopDate").html('<i class="bi bi-calendar"></i> ' + resultDate);
        $("#desktopTime").html('<i class="bi bi-clock"></i> ' + resultTime);
    }
    
    // Date and time initially
    showDateTime();
    
    // Date and time continuously every 1 second
    setInterval(showDateTime, 1000);

    // Display Wifi info
    async function showWifi() {
        let response = await fetch("http://" + esp32IPDomain + "/wifi");
        if (response.status === 200) {
            let data = await response.text();
            // Separate the elements
            wifiArray = data.split(",");
            wifiChunkNum = wifiArray.length;
            let wifiSSID;
            const wifiRSSI = parseInt(wifiArray[0]);
            const wifiLocalIP = wifiArray[1];
            const wifiMACAddress = wifiArray[2];
            if (wifiChunkNum === 4) {
                wifiSSID = wifiArray[3];
            } else {

            }
            // Set the standard for icon representation of signal strength
            if (wifiRSSI <= -1 && wifiRSSI >= -39) {
                $("#wifiIndicator").html("<i class=\"bi bi-reception-4\"></i> (" + wifiRSSI + ")");
                $("#wifiIndicator").prop("title", "SSID: " + wifiSSID + "\nIP Address: " + wifiLocalIP + "\nMAC Address: " + wifiMACAddress);
            }
            else if (wifiRSSI <= -40 && wifiRSSI >= -64) {
                $("#wifiIndicator").html("<i class=\"bi bi-reception-3\"></i> (" + wifiRSSI + ")");
                $("#wifiIndicator").prop("title", "SSID: " + wifiSSID + "\nIP Address: " + wifiLocalIP + "\nMAC Address: " + wifiMACAddress);
            }
            else if (wifiRSSI <= -65 && wifiRSSI >= -69) {
                $("#wifiIndicator").html("<i class=\"bi bi-reception-2\"></i> (" + wifiRSSI + ")");
                $("#wifiIndicator").prop("title", "SSID: " + wifiSSID + "\nIP Address: " + wifiLocalIP + "\nMAC Address: " + wifiMACAddress);
            }
            else if (wifiRSSI <= -70 && wifiRSSI >= -79) {
                $("#wifiIndicator").html("<i class=\"bi bi-reception-1\"></i> (" + wifiRSSI + ")");
                $("#wifiIndicator").prop("title", "SSID: " + wifiSSID + "\nIP Address: " + wifiLocalIP + "\nMAC Address: " + wifiMACAddress);
            }
            else {
                $("#wifiIndicator").html("<i class=\"bi bi-reception-0\"></i> (" + wifiRSSI + ")");
                $("#wifiIndicator").prop("title", "SSID: " + wifiSSID + "\nIP Address: " + wifiLocalIP + "\nMAC Address: " + wifiMACAddress);
            }
        } else {
            $("#wifiIndicator").html("<i class=\"bi bi-reception-0\"></i> (-100)");
        }
    }

    // Wifi initially
    showWifi();

    // Wifi continously every 5 seconds
    setInterval(showWifi, 5000);

    // Mouse tracker
    let mouseX, mouseY;
    $(document).mousemove(function (e) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    });

    // Set height of clmn-1 and clmn-2
    function setHeights() {
        let winHeight = $(window).height();
        $("#clmn-1").height(winHeight - 110);
        $("#clmn-2").height(winHeight - 110);
    }

    // Set height initially
    setHeights();

    // Set height on resize
    $(window).resize(setHeights());

    // Reboot progress bar
    function showRebootProgress() {
        let progress = 0;
        setInterval(function () {
            progress += 5;
            $("#rebootMessage").html("<p>Reboot in progress</p><progress id=\"rebootBar\" value=\"" + progress + "\" max=\"100\"></progress>");
        }, 1000);   
    }

    // Reboot
    $("#reboot").click(function (e) {
        e.preventDefault();
        const request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Reboot initiated");
                $("#rebootWrapper").show();
                $("#rebootMessage").show();
                showRebootProgress();
                setTimeout(() => {
                    location.reload();
                }, "20000");
            }
        };
        request.open("POST", "http://" + esp32IPDomain + "/reboot", true);
        request.send();
    });

    // Reboot
    $("#logout").click(function (e) {
        e.preventDefault();
        const request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 401) {
                console.log("User logged out");
            }
        };
        request.open("GET", "http://" + esp32IPDomain + "/logout", true);
        request.send();
    });
    
    // Desktop menu replace default right click function and show custom menu
    $("#clmn-2").contextmenu(function (e) {
        e.preventDefault();
        $("#desktop-menu").show();
        let winWidth = $(window).width();
        let winHeight = $(window).height();
        let rtWidth = $("#clmn-2").width();
        let rtHeight = $("#clmn-2").height();
        // Margins to prevent overflow of menu
        let desktopMenuWidth = $("#desktop-menu").width();
        let desktopMenuHeight = $("#desktop-menu").height();
        let desktopMenuBufferHor = 0;
        // Position of desktop-menu top and right
        if (mouseX > winWidth - 2 * desktopMenuWidth && mouseY < 2 * desktopMenuHeight) {
            $("#desktop-menu").offset({
                "top": mouseY,
                "left": mouseX - desktopMenuWidth - desktopMenuBufferHor
            })
        }
        // Position of desktop-menu middle and right 
        else if (mouseX > winWidth - 2 * desktopMenuWidth && mouseY >= desktopMenuHeight && mouseY <= winHeight - 2 * desktopMenuHeight) {
            $("#desktop-menu").offset({
                "top": mouseY,
                "left": mouseX - desktopMenuWidth - desktopMenuBufferHor
            })
        }
        // Position of desktop-menu bottom and right 
        else if (mouseX > winWidth - 2 * desktopMenuWidth && mouseY > winHeight - 2 * desktopMenuHeight) {
            $("#desktop-menu").offset({
                "top": mouseY - desktopMenuHeight,
                "left": mouseX - desktopMenuWidth - desktopMenuBufferHor
            })
        }
        // Position of desktop-menu bottom and center and left 
        else if (mouseX >= winWidth - rtWidth - 2 * desktopMenuBufferHor && mouseX <= winWidth - 2 * desktopMenuWidth && mouseY > winHeight - 2 * desktopMenuHeight) {
            $("#desktop-menu").offset({
                "top": mouseY - desktopMenuHeight,
                "left": mouseX
            })
        }
        // Position of desktop-menu middle and left 
        else if (mouseX >= winWidth - rtWidth - 2 * desktopMenuBufferHor && mouseY > 2 * desktopMenuHeight && mouseY < winHeight - 2 * desktopMenuHeight) {
            $("#desktop-menu").offset({
                "top": mouseY, 
                "left": mouseX
            })
        }
        // Anywhere else 
        else {
            $("#desktop-menu").offset({
                "top": mouseY, 
                "left": mouseX
            })
        }
    });
    
    // Desktop menu hide whatever kind of click occurs
    $(document).bind("mousedown", e => {
        $("#desktop-menu").hide(100)
    });

    // File explorer
    function explorer(somepath) {
        let explorerChildren = [];
        if (somepath == "/") {
            for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
                if (esp32FS.children[i].path != "/sdcard/") {
                    explorerChildren.push([
                        esp32FS.children[i].name,
                        esp32FS.children[i].type,
                        esp32FS.children[i].path,
                        esp32FS.children[i].size
                    ]);
                }
            }
            return explorerChildren;
        }
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            if (esp32FS.children[i].path.includes(somepath)) {
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    explorerChildren.push([
                        esp32FS.children[i].children[ii].name,
                        esp32FS.children[i].children[ii].type,
                        esp32FS.children[i].children[ii].path,
                        esp32FS.children[i].children[ii].size
                    ]);
                }
                return explorerChildren;
            }
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                if (esp32FS.children[i].children[ii].path.includes(somepath)) {
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        explorerChildren.push([
                            esp32FS.children[i].children[ii].children[iii].name,
                            esp32FS.children[i].children[ii].children[iii].type,
                            esp32FS.children[i].children[ii].children[iii].path,
                            esp32FS.children[i].children[ii].children[iii].size
                        ]);
                    }
                    return explorerChildren; 
                }
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    if (esp32FS.children[i].children[ii].children[iii].path.includes(somepath)) {
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            explorerChildren.push([
                                esp32FS.children[i].children[ii].children[iii].children[iv].name,
                                esp32FS.children[i].children[ii].children[iii].children[iv].type,
                                esp32FS.children[i].children[ii].children[iii].children[iv].path,
                                esp32FS.children[i].children[ii].children[iii].children[iv].size
                            ]);
                        }
                        return explorerChildren;
                    }
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        if (esp32FS.children[i].children[ii].children[iii].children[iv].path.includes(somepath)) {
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                explorerChildren.push([
                                    esp32FS.children[i].children[ii].children[iii].children[iv].children[v].name,
                                    esp32FS.children[i].children[ii].children[iii].children[iv].children[v].type,
                                    esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path,
                                    esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size
                                ]);
                            }
                            return explorerChildren;
                        }
                        for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path.includes(somepath)) {
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children.length; vi < l6; vi++) {
                                    explorerChildren.push([
                                        esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].name,
                                        esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].type,
                                        esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path,
                                        esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size
                                    ]);
                                }
                                return explorerChildren;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    // HOME ------------------------------
    function navigate(somepath) {
        //esp32FS = getFilesystem();
        let explorerParent = somepath;
        let explorerChildren = explorer(explorerParent);
        let explorerChildrenNum = explorerChildren.length;
        let explorerSum = "";
        let explorerType = "";
        let explorerIcon = "";
        explorerSum += "<table>";
        explorerSum += "<tr><th style=\"padding-left: 10px;\">Name</th><th style=\"padding-left: 50px;\">Path</th><th style=\"padding-left: 50px;\">Type</th><th style=\"padding-left: 50px;\">Size</th></tr>";
        for (let ex = 0, exn = explorerChildrenNum;  ex < exn ; ex++) {
            if (explorerChildren[ex][0].slice(-1) == "/") {
                explorerChildren[ex][0] = explorerChildren[ex][0].slice(0, -1);
            }
            if (explorerChildren[ex][1] == "folder") {
                explorerType = "Folder";
                explorerIcon = "<i class=\"bi bi-folder2\"></i>";
            } else {
                if (fileTypesArray.includes("." + explorerChildren[ex][0].split(".").pop())) {
                    explorerType = "." + explorerChildren[ex][0].split(".").pop();
                    explorerIcon = iconTypesArray[fileTypesArray.indexOf("." + explorerChildren[ex][0].split(".").pop())];
                } else {
                    explorerType = "Unknown";
                    explorerIcon = "<i class=\"bi bi-file-earmark-text\"></i>";
                }
            }
            explorerSum += "<tr><td><button role=\"link\" id=\"" + explorerChildren[ex][2] + "\">" + explorerIcon + " " + explorerChildren[ex][0] + "</button></td><td style=\"padding-left: 50px;\">" + explorerChildren[ex][2] + "</td><td style=\"padding-left: 50px;\">" + explorerType + "</td><td style=\"padding-left: 50px;\">" + bytesConverter(explorerChildren[ex][3], 2, "default") + "</td></tr>";
        }
        explorerSum += "</table>";
       return explorerSum;
    }

    $("#esp32Home").click(function() {
        $("#homeExplorer").html(navigate("/"));
        $("#homeBreadcrumbs").html("<i class=\"bi bi-caret-right-fill\"></i> <button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ");
        initiator = "#homeModal";
        lastExplorerDirectory = "/";
    });

    $("#esp32SD").click(function() {
        $("#sdExplorer").html(navigate("/sdcard/"));
        $("#sdBreadcrumbs").html("<i class=\"bi bi-caret-right-fill\"></i> <button role=\"link\" id=\"/sdcard/\">sdcard</button> <i class=\"bi bi-caret-right\"></i> ");
        initiator = "#sdModal";
        lastExplorerDirectory = "/sdcard/";
    });

    $("#esp32Term").click(function() {
        initiator = "#termModal";
    });

    let lastExplorerDirectory = "";
    
    $("#editorCloseButton").click(function() {
        $("#editorModal").modal("hide");
        $(initiator).modal("show");
        if (initiator == "#homeModal") {
            $("#homeExplorer").html(navigate(lastExplorerDirectory));
        }
        if (initiator == "#sdModal") {
            $("#sdExplorer").html(navigate(lastExplorerDirectory));
        }
    });

    $("#viewerCloseButton").click(function() {
        $("#viewerModal").modal("hide");
        $(initiator).modal("show");
    });

    $("#homeExplorer").click(function(e) {
        e.preventDefault;
        const target = e.target.id;
        // Define the type of target
        if (fileTypesArray.includes("." + target.split(".").pop())) {
            $("#homeModal").modal("hide");
            if (touchFileTypesArray.includes("." + target.split(".").pop())) {
                $("#editorModal").modal("show");
                importSourceFromURL(editfileVerify("/", target)[1]);
            }
            else {
                $("#viewerModal").modal("show");
                $("#photoViewer").html("<img src=\"http://" + esp32IPDomain + target + "\">");
            }
        } else {
            lastExplorerDirectory = target;
            const crumbs = target.split("/");
            const crumbsNum = crumbs.length - 1;
            let breadcrumbs = "";
            let target1 = "", target2 = "", target3 = "", target4 = "", target5 = "";
            if (target == "/") {
                breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
            }
            for (let cr = 1, crn = crumbsNum; cr < crn; cr++) {
                if (cr === 1) {
                    target1 = "/" + crumbs[1] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 2) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 3) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 4) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }  else if (cr === 5) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/" + crumbs[5] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target5 + "\">" + crumbs[5] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }
            }
            $("#homeBreadcrumbs").html("<i class=\"bi bi-caret-right-fill\"></i> " + breadcrumbs);
            $("#homeExplorer").html(navigate(e.target.id));
        }
    });

    $("#homeBreadcrumbs").click(function(e) {
        e.preventDefault;
        const target = e.target.id;
        // Define the type of target
        if (fileTypesArray.includes("." + target.split(".").pop())) {
            $("#homeModal").modal("hide");
            if (touchFileTypesArray.includes("." + target.split(".").pop())) {
                $("#editorModal").modal("show");
                importSourceFromURL(editfileVerify("/", target)[1]);
            }
            else {
                $("#viewerModal").modal("show");
                $("#photoViewer").html("<img src=\"http://" + esp32IPDomain + target + "\">");
            }
        } else {
            lastExplorerDirectory = target;
            const crumbs = target.split("/");
            const crumbsNum = crumbs.length - 1;
            let breadcrumbs = "";
            let target1 = "", target2 = "", target3 = "", target4 = "", target5 = "";
            if (target == "/") {
                breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
            }
            for (let cr = 1, crn = crumbsNum; cr < crn; cr++) {
                if (cr === 1) {
                    target1 = "/" + crumbs[1] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 2) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 3) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 4) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }  else if (cr === 5) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/" + crumbs[5] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"/\">/</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target5 + "\">" + crumbs[5] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }
            }
            $("#homeBreadcrumbs").html("<i class=\"bi bi-caret-right-fill\"></i> " + breadcrumbs);
            $("#homeExplorer").html(navigate(e.target.id));
        }
    });

    $("#sdExplorer").click(function(e) {
        e.preventDefault;
        const target = e.target.id;
        // Define the type of target
        if (fileTypesArray.includes("." + target.split(".").pop())) {
            $("#homeModal").modal("hide");
            if (touchFileTypesArray.includes("." + target.split(".").pop())) {
                $("#editorModal").modal("show");
                importSourceFromURL(editfileVerify("/", target)[1]);
            }
            else {
                $("#viewerModal").modal("show");
                $("#photoViewer").html("<img src=\"http://" + esp32IPDomain + target + "\">");
            }
        } else {
            lastExplorerDirectory = target;
            const crumbs = target.split("/");
            const crumbsNum = crumbs.length - 1;
            let breadcrumbs = "";
            let target1 = "", target2 = "", target3 = "", target4 = "", target5 = "";
            for (let cr = 1, crn = crumbsNum; cr < crn; cr++) {
                if (cr === 1) {
                    target1 = "/" + crumbs[1] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 2) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 3) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 4) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }  else if (cr === 5) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/" + crumbs[5] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target5 + "\">" + crumbs[5] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }
            }
            $("#sdBreadcrumbs").html("<i class=\"bi bi-caret-right-fill\"></i> " + breadcrumbs);
            $("#sdExplorer").html(navigate(e.target.id));
        }
    });

    $("#sdBreadcrumbs").click(function(e) {
        e.preventDefault;
        const target = e.target.id;
        const crumbs = target.split("/");
        // Define the type of target
        if (fileTypesArray.includes("." + target.split(".").pop())) {
            $("#homeModal").modal("hide");
            if (touchFileTypesArray.includes("." + target.split(".").pop())) {
                $("#editorModal").modal("show");
                importSourceFromURL(editfileVerify("/", target)[1]);
            }
            else {
                $("#viewerModal").modal("show");
                $("#photoViewer").html("<img src=\"http://" + esp32IPDomain + target + "\">");
            }
        } else {
            lastExplorerDirectory = target;
            const crumbsNum = crumbs.length - 1;
            let breadcrumbs = "";
            let target1 = "", target2 = "", target3 = "", target4 = "", target5 = "";
            for (let cr = 1, crn = crumbsNum; cr < crn; cr++) {
                if (cr === 1) {
                    target1 = "/" + crumbs[1] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 2) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 3) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                } else if (cr === 4) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }  else if (cr === 5) {
                    target1 = "/" + crumbs[1] + "/";
                    target2 = "/" + crumbs[1] + "/" + crumbs[2] + "/";
                    target3 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/";
                    target4 = "/" + crumbs[1] + "/" + crumbs[2] + "/" + crumbs[3] + "/" + crumbs[4] + "/" + crumbs[5] + "/";
                    breadcrumbs = "<button role=\"link\" id=\"" + target1 + "\">" + crumbs[1] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target2 + "\">" + crumbs[2] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target3 + "\">" + crumbs[3] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target4 + "\">" + crumbs[4] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                    breadcrumbs += "<button role=\"link\" id=\"" + target5 + "\">" + crumbs[5] + "</button> <i class=\"bi bi-caret-right\"></i> ";
                }
            }
            $("#sdBreadcrumbs").html("<i class=\"bi bi-caret-right-fill\"></i> " + breadcrumbs);
            $("#sdExplorer").html(navigate(e.target.id));
        }
    });
    // STATUS ------------------------------
    $("#esp32Status").click(function(e) {
        e.preventDefault;
        let status = processUname();
        const usedHeapPercentage = Math.ceil((status.usedHeap / status.totalHeap) * 100);
        const freeHeapPercentage = 100 - usedHeapPercentage;
        const usedHeapPercentageText = usedHeapPercentage + "%";
        const freeHeapPercentageText = freeHeapPercentage + "%";
        $("#heapPane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>Total Heap:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.totalHeap, 2, "file") + "</td></tr>" + 
            "<tr><td>Used Heap:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.usedHeap, 2, "file") + " (" + usedHeapPercentageText + ")" + "</td></tr>" + 
            "<tr><td>Free Heap:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.freeHeap, 2, "file") + " (" + freeHeapPercentageText + ")" + "</td></tr>" + 
            "</table>");
    });

    $("#heapTab").click(function(e) {
        e.preventDefault;
        let status = processUname();
        const usedHeapPercentage = Math.ceil((status.usedHeap / status.totalHeap) * 100);
        const freeHeapPercentage = 100 - usedHeapPercentage;
        const usedHeapPercentageText = usedHeapPercentage + "%";
        const freeHeapPercentageText = freeHeapPercentage + "%";
        $("#heapPane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>Total Heap:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.totalHeap, 2, "file") + "</td></tr>" + 
            "<tr><td>Used Heap:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.usedHeap, 2, "file") + " (" + usedHeapPercentageText + ")" + "</td></tr>" + 
            "<tr><td>Free Heap:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.freeHeap, 2, "file") + " (" + freeHeapPercentageText + ")" + "</td></tr>" + 
            "</table>");
    });

    $("#psramTab").click(function(e) {
        e.preventDefault;
        let status = processUname();
        const usedPsramPercentage = Math.ceil((status.usedPsram / status.totalPsram) * 100);
        const freePsramPercentage = 100 - usedPsramPercentage;
        const usedPsramPercentageText = usedPsramPercentage + "%";
        const freePsramPercentageText = freePsramPercentage + "%";
        $("#psramPane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>Total PSRAM:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.totalPsram, 2, "file") + "</td></tr>" + 
            "<tr><td>Used PSRAM:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.usedPsram, 2, "file") + " (" + usedPsramPercentageText + ")" + "</td></tr>" + 
            "<tr><td>Free PSRAM:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.freePsram, 2, "file") + " (" + freePsramPercentageText + ")" + "</td></tr>" + 
            "</table>");
    });

    $("#mcuTab").click(function(e) {
        e.preventDefault;
        let status = processUname();
        $("#mcuPane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>Chip Model:</td><td style=\"padding-left: 50px\">" + status.chipModel + "</td></tr>" + 
            "<tr><td>Core Processor:</td><td style=\"padding-left: 50px\">" + status.coreProcessor + "</td></tr>" + 
            "<tr><td>Chip Cores:</td><td style=\"padding-left: 50px\">" + status.chipCores + " Cores</td></tr>" + 
            "<tr><td>Chip Revision:</td><td style=\"padding-left: 50px\">" + status.chipRevision + "</td></tr>" + 
            "<tr><td>CPU Frequency:</td><td style=\"padding-left: 50px\">" + status.cpuFrequency + " MHz</td></tr>" + 
            "<tr><td>SDK Version:</td><td style=\"padding-left: 50px\">" + status.sdkVersion + "</td></tr>" + 
            "<tr><td>Flash Chip Size:</td><td style=\"padding-left: 50px\">" + bytesConverter(status.flashChipSize, 2, "file") + "</td></tr>" + 
            "</table>");
    });

    $("#kernelTab").click(function(e) {
        e.preventDefault;
        let status = processUname();
        $("#kernelPane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>OS Name:</td><td style=\"padding-left: 50px\">" + status.osName + "</td></tr>" + 
            "<tr><td>Kernel Name:</td><td style=\"padding-left: 50px\">" + status.kernel + "</td></tr>" + 
            "<tr><td>Kernel Release:</td><td style=\"padding-left: 50px\">" + status.kernelName + "</td></tr>" + 
            "<tr><td>Kernel Version:</td><td style=\"padding-left: 50px\">" + status.kernelVersion + "</td></tr>" + 
            "</table>");
    });

    $("#networkTab").click(function(e) {
        e.preventDefault;
        async function networkStatus() {
            let status = processUname();
            let wifi = await fetch("http://" + esp32IPDomain + "/wifi");
            if (wifi.status === 200) {
                let data = await wifi.text();
                // Separate the elements
                const wifiArray = data.split(",");
                const wifiChunkNum = wifiArray.length;
                let wifiSSID;
                const wifiRSSI = parseInt(wifiArray[0]);
                const wifiLocalIP = wifiArray[1];
                const wifiMACAddress = wifiArray[2];
                if (wifiChunkNum === 4) {
                    wifiSSID = wifiArray[3];
                }
                $("#networkPane").html("<table>" + 
                    "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
                    "<tr><td>Hostname:</td><td style=\"padding-left: 50px\">" + status.hostname + "</td></tr>" + 
                    "<tr><td>IP Address:</td><td style=\"padding-left: 50px\">" + wifiLocalIP + "</td></tr>" + 
                    "<tr><td>MAC Address:</td><td style=\"padding-left: 50px\">" + wifiMACAddress + "</td></tr>" + 
                    "<tr><td>SSID:</td><td style=\"padding-left: 50px\">" + wifiSSID + "</td></tr>" + 
                    "<tr><td>RSSI:</td><td style=\"padding-left: 50px\">" + wifiRSSI + "</td></tr>" + 
                    "</table>");
            }
        }
        networkStatus();
    });

    $("#filesystemsTab").click(function(e) {
        e.preventDefault;
        let status = df();
        $("#filesystemsPane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>LittleFS Total Space:</td><td style=\"padding-left: 50px\">" + status[0] + "</td></tr>" + 
            "<tr><td>LittleFS Used Space:</td><td style=\"padding-left: 50px\">" + status[1] + " (" + status[3] + ")" + "</td></tr>" + 
            "<tr><td>LittleFS Free Space:</td><td style=\"padding-left: 50px\">" + status[2] + " (" + status[4] + ")" + "</td></tr>" + 
            "<tr><td>SD_MMC Total Space:</td><td style=\"padding-left: 50px\">" + status[5] + "</td></tr>" + 
            "<tr><td>SD_MMC Used Space:</td><td style=\"padding-left: 50px\">" + status[6] + " (" + status[8] + ")" + "</td></tr>" + 
            "<tr><td>SD_MMC Free Space:</td><td style=\"padding-left: 50px\">" + status[7] + " (" + status[9] + ")" + "</td></tr>" + 
            "</table>");
    });

    $("#uptimeTab").click(function(e) {
        e.preventDefault;
        let status = processUname();
        $("#uptimePane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>Last Boot:</td><td style=\"padding-left: 50px\">" + bootDateTime(status.bootTime) + "</td></tr>" + 
            "<tr><td>Time Since:</td><td style=\"padding-left: 50px\">" + upTime(status.bootTime) + "</td></tr>" + 
            "</table>");
    });

    $("#otherTab").click(function(e) {
        e.preventDefault;
        $("#otherPane").html("<table>" + 
            "<tr><th>Attribute</th><th style=\"padding-left: 50px\">Value</th></tr>" + 
            "<tr><td>Maximum depth level of directories:</td><td style=\"padding-left: 50px\"> 5 Levels</td></tr>" + 
            "<tr><td>Maximum size of transfered file: </td><td style=\"padding-left: 50px\"> " + bytesConverter(maxSizeOfFileToMoveCopy, 2, "file") + "</td></tr>" + 
            "<tr><td>Maximum number of characters for eligible absolute path (LittleFS): </td><td style=\"padding-left: 50px\"> 35 Characters</td></tr>" + 
            "<tr><td>Maximum number of characters for eligible absolute path (SD_MMC): </td><td style=\"padding-left: 50px\"> N/A</td></tr>" +
            "</table>");
    });

    // TERM ------------------------------
    const termStatement = "<strong>ESP32-OS 0.1.0 - DISCLAIMERS</strong><br><br>~ The programs included with the ESP32-OS are open source software; the exact distribution terms and licenses for each program are described in the individual files in /shared/licenses.<br><br>~ ESP32-OS comes with ABSOLUTELY NO WARRANTY, to the extent permitted by applicable law.<br><br>";
    const termActive = "&gt&nbsp;"
    const termUsername = "user";
    const termAt = "@";
    const termNFQN = esp32IPDomain;
    const termColon = ": ";
    const termDash = "~"
    const termUser = termUsername + termAt + termNFQN + termColon;
    const termDivider = "$&nbsp;";
    const caret = "&gt&nbsp;";
    const nonAscii = "&zwnj;";
    const fsRealPath = "/data";
    const folderColor = "aqua;";
    const fileColor = "fuchsia;";
    const userColor = "orange";
    const termDirColor = "dodgerblue";
    const touchFileTypesArrayNoDot = dotRemover(touchFileTypesArray);
    const esp32FSHelp = [
        [
            "pwd", "Returns the absolute path of the present working directory", "$pwd"
        ],
        [
            "ls", "Lists the folders and files of the present directory or lists the folders and files of a remote directory", "$ls &lt;path and name of directory&gt;"
        ],
        [
            "cd", "Changes directory", "$cd &lt;path and name of directory&gt;"
        ],
        [
            "mkdir", "Makes a new directory", "$mkdir &lt;path and name of the new directory&gt;"
        ],
        [
            "rmdir", "Removes an empty directory", "$rmdir &lt;path and name of directory&gt;"
        ],
        [
            "rm", "Removes a file", "$rm &lt;path name and extension of file&gt;"
        ],
        [
            "touch", "Creates a new file", "$touch &lt;path name and extension of file&gt;"
        ],
        [
            "truncate", "Truncates file", "$truncate &lt;path name and extension of file&gt;"
        ],
        [
            "cp", "Copy file", "$cp &lt;path name extension of copy file&gt; &lt;new path name extension of paste file&gt;"
        ],
        [
            "mv", "Moves or renames file", "$mv &lt;path name extension of file&gt; &lt;new path name extension of file&gt;"
        ],
        [
            "rename", "Renames folder or file (Same directory)", "$rename &lt;path name extension of file&gt; &lt;new path name extension of file&gt;"
        ],
        [
            "locate", "Locates files", "$locate &lt;keyword&gt;"
        ],
        [
            "echo", "Writes in file", "$echo &lt;text&gt; &lt;path name extension of file&gt;"
        ],
        [
            "cat", "Returns contents of file", "$cat &lt;path name extension of file&gt;"
        ],
        [
            "edit", "Opens the editor to edit a file", "$edit &lt;path name extension of file&gt;"
        ],
        [
            "df", "Returns disk filesystem summary including disk space", "$df"
        ],
        [
            "du", "Returns the disk space in use of a particular directory", "$du &lt;path and name of directory&gt;"
        ],
        [
            "uname -&lt;modifier&gt;", "Returns device and OS core information. For more details type uname -help", "$ uname -&lt;modifier&gt;"
        ],
        [
            "hostname", "Returns the hostname", "$hostname"
        ],
        [
            "hostname -I", "Returns the IP address of the host", "$hostname -I"
        ],
        [
            "reboot", "Reboots the device", "$reboot"
        ],
        [
            "clear", "Clears the terminal", "$clear"
        ],
        [
            "exit", "Exits the terminal", "$exit"
        ]
    ];
    const unameHelp = [
        [
            "uname -a", "Returns core information of the OS", "$uname -a"
        ],
        [
            "uname -s", "Returns kernel name", "$uname -s"
        ],
        [
            "uname -n", "Returns node name", "$uname -n"
        ],
        [
            "uname -r", "Returns kernel release", "$uname -r"
        ],
        [
            "uname -v", "Returns kernel version", "$uname -v"
        ],
        [
            "uname -m", "Returns device hardware name", "$uname -m"
        ],
        [
            "uname -p", "Returns processor architecture", "$uname -p"
        ],
        [
            "uname -i", "Return hardware platform", "$uname -i"
        ],
        [
            "uname -o", "Returns OS name", "$uname -o"
        ],
        [
            "uname -th", "Returns device total heap", "$uname -th"
        ],
        [
            "uname -uh", "Returns device used heap ", "$uname -uh"
        ],
        [
            "uname -fh", "Returns device free heap ", "$uname -fh"
        ],
        [
            "uname -tp", "Returns device total PSRAM", "$uname -tp"
        ],
        [
            "uname -up", "Returns device used PSRAM", "$uname -up"
        ],
        [
            "uname -fp", "Returns device free PSRAM", "$uname -fp"
        ],
        [
            "uname -cm", "Returns chip model", "$uname -cm"
        ],
        [
            "uname -cp", "Returns core processor name", "$uname -cp"
        ],
        [
            "uname -cc", "Returns processor core(s) number", "$uname -cc"
        ],
        [
            "uname -cr", "Returns chip revision", "$uname -cr"
        ],
        [
            "uname -cf", "Returns processor frequency", "$uname -cf"
        ],
        [
            "uname -sv", "Returns SDK version", "$uname -sv"
        ],
        [
            "uname -fs", "Returns flash chip size", "$uname -fs"
        ],
        [
            "uname -ma", "Returns device WiFi MAC address", "$uname -ma"
        ],
        [
            "uname -bt", "Returns last boot date and time", "$uname -bt"
        ],
        [
            "uname -ut", "Returns uptime (time lapsed since last boot)", "$uname -ut"
        ],
        [
            "uname -ct", "Returns current date and time", "$uname -ct"
        ]
    ];
    let termDirectory = "/home/ ";
    let prompt = "<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'>" + termDash + termDirectory + "</span> " + termDivider + "</span>";
    let endPosition,
        termTextAreaValue,
        commandArray,
        newDirectory,
        cdSuccess,
        searchFSLevel,
        firstLevelArguments,
        secondLevelArguments,
        thirdLevelArguments,
        fourthLevelArguments,
        fifthLevelArguments,
        termDirectoryArray,
        termDirectoryChunkNum,
        fileFolderColor,
        remotePath;
    let commandHistory = [];
    let commandCounter = 0;

    function dotRemover(somearray) {
        let fileTypesNoDotArray = [];
        for (a = 0, l = somearray.length; a < l; a ++) {
            let converted = somearray[a].split(".").pop();
            fileTypesNoDotArray.push(converted);
        }
        return fileTypesNoDotArray;
    }

    function esp32FSHelpSort() {
        return esp32FSHelp.sort();
    }

    function unameHelpSort() {
        return unameHelp.sort();
    }

    function bytesConverter(bytes, trail, type) {
        if (bytes == 0 && type == "folder") {
            return "";
        } else if (bytes == 0 && type != "folder") {
            return "0 Bytes";
        } else {
            let divider = 1024,
                decimals = trail || 2,
                sizes = [
                    "Bytes", "KB", "MB", "GB"
                ],
                division = Math.floor(Math.log(bytes) / Math.log(divider));
            return parseFloat((bytes / Math.pow(divider, division)).toFixed(decimals)) + ' ' + sizes[division];
        }
    }

    function firstLevelFS(sel) {
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            if (esp32FS.children[i].path == sel) {
                return true;
            }
        }
    }

    function secondLevelFS(sel) {
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                if (esp32FS.children[i].children[ii].path == sel) {
                    return true;
                }
            }
        }
    }

    function thirdLevelFS(sel) {
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    if (esp32FS.children[i].children[ii].children[iii].path == sel) {
                        return true;
                    }
                }
            }
        }
    }

    function fourthLevelFS(sel) {
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        if (esp32FS.children[i].children[ii].children[iii].children[iv].path == sel) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    function fifthLevelFS(sel) {
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path == sel) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }

    function rootLevelFSList() {
        let ls = [];
        for (let r = 0, l0 = esp32FS.children.length; r < l0; r++) {
            let dirFileName = esp32FS.children[r].name;
            if (dirFileName.slice(-1) == "/") {
                dirFileName = dirFileName.slice(0, -1);
            }
            ls.push(dirFileName);
        }
        return ls.sort();
    }

    function firstLevelFSList(sel) {
        let ls = [];
        for (let r = 0, l0 = esp32FS.children.length; r < l0; r++) {
            if (esp32FS.children[r].path == sel) {
                for (let i = 0, l1 = esp32FS.children[r].children.length; i < l1; i++) {
                    let dirFileName = esp32FS.children[r].children[i].name;
                    if (dirFileName.slice(-1) == "/") {
                        dirFileName = dirFileName.slice(0, -1);
                    }
                    ls.push(dirFileName);
                }
            }
        }
        return ls.sort();
    }

    function secondLevelFSList(sel) {
        let ls = [];
        for (let r = 0, l0 = esp32FS.children.length; r < l0; r++) {
            for (let i = 0, l1 = esp32FS.children[r].children.length; i < l1; i++) {
                if (esp32FS.children[r].children[i].path == sel) {
                    for (let ii = 0, l2 = esp32FS.children[r].children[i].children.length; ii < l2; ii++) {
                        let dirFileName = esp32FS.children[r].children[i].children[ii].name;
                        if (dirFileName.slice(-1) == "/") {
                            dirFileName = dirFileName.slice(0, -1);
                        }
                        ls.push(dirFileName);
                    }
                }
            }
        }
        return ls.sort();
    }

    function thirdLevelFSList(sel) {
        let ls = [];
        for (let r = 0, l0 = esp32FS.children.length; r < l0; r++) {
            for (let i = 0, l1 = esp32FS.children[r].children.length; i < l1; i++) {
                for (let ii = 0, l2 = esp32FS.children[r].children[i].children.length; ii < l2; ii++) {
                    if (esp32FS.children[r].children[i].children[ii].path == sel) {
                        for (let iii = 0, l3 = esp32FS.children[r].children[i].children[ii].children.length; iii < l3; iii++) {
                            let dirFileName = esp32FS.children[r].children[i].children[ii].children[iii].name;
                            if (dirFileName.slice(-1) == "/") {
                                dirFileName = dirFileName.slice(0, -1);
                            }
                            ls.push(dirFileName);
                        }
                    }
                }
            }
        }
        return ls.sort();
    }

    function fourthLevelFSList(sel) {
        let ls = [];
        for (let r = 0, l0 = esp32FS.children.length; r < l0; r++) {
            for (let i = 0, l1 = esp32FS.children[r].children.length; i < l1; i++) {
                for (let ii = 0, l2 = esp32FS.children[r].children[i].children.length; ii < l2; ii++) {
                    for (let iii = 0, l3 = esp32FS.children[r].children[i].children[ii].children.length; iii < l3; iii++) {
                        if (esp32FS.children[r].children[i].children[ii].children[iii].path == sel) {
                            for (let iv = 0, l4 = esp32FS.children[r].children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                let dirFileName = esp32FS.children[r].children[i].children[ii].children[iii].children[iv].name;
                                if (dirFileName.slice(-1) == "/") {
                                    dirFileName = dirFileName.slice(0, -1);
                                }
                                ls.push(dirFileName);
                            }
                        }
                    }
                }
            }
        }
        return ls.sort();
    }

    function fifthLevelFSList(sel) {
        let ls = [];
        for (let r = 0, l0 = esp32FS.children.length; r < l0; r++) {
            for (let i = 0, l1 = esp32FS.children[r].children.length; i < l1; i++) {
                for (let ii = 0, l2 = esp32FS.children[r].children[i].children.length; ii < l2; ii++) {
                    for (let iii = 0, l3 = esp32FS.children[r].children[i].children[ii].children.length; iii < l3; iii++) {
                        for (let iv = 0, l4 = esp32FS.children[r].children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            if (esp32FS.children[r].children[i].children[ii].children[iii].children[iv].path == sel) {
                                for (let v = 0, l5 = esp32FS.children[r].children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    let dirFileName = esp32FS.children[r].children[i].children[ii].children[iii].children[iv].children[v].name;
                                    if (dirFileName.slice(-1) == "/") {
                                        dirFileName = dirFileName.slice(0, -1);
                                    }
                                    ls.push(dirFileName);
                                }
                            }
                        }
                    }
                }
            }
        }
        return ls.sort();
    }

    function searchKeyword(keyword) {
        let searchResult = [];
        if (keyword == "/") {
            searchResult.push(["/", "/"]);
        }
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            if (esp32FS.children[i].name.includes(keyword)) {
                searchResult.push([
                    esp32FS.children[i].name,
                    esp32FS.children[i].path
                ]);
            }
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                if (esp32FS.children[i].children[ii].name.includes(keyword)) {
                    searchResult.push([
                        esp32FS.children[i].children[ii].name,
                        esp32FS.children[i].children[ii].path
                    ]);
                }
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    if (esp32FS.children[i].children[ii].children[iii].name.includes(keyword)) {
                        searchResult.push([
                            esp32FS.children[i].children[ii].children[iii].name,
                            esp32FS.children[i].children[ii].children[iii].path
                        ]);
                    }
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        if (esp32FS.children[i].children[ii].children[iii].children[iv].name.includes(keyword)) {
                            searchResult.push([
                                esp32FS.children[i].children[ii].children[iii].children[iv].name,
                                esp32FS.children[i].children[ii].children[iii].children[iv].path
                            ]);
                        }
                        for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].name.includes(keyword)) {
                                searchResult.push([
                                    esp32FS.children[i].children[ii].children[iii].children[iv].children[v].name,
                                    esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path
                                ]);
                            }
                        }
                    }
                }
            }
        }
        return searchResult.sort();
    }

    function pathExists(somepath) {
        if (somepath == "/") {
            return true;
        }
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            if (esp32FS.children[i].path.includes(somepath)) {
                return true;
            }
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                if (esp32FS.children[i].children[ii].path.includes(somepath)) {
                    return true;
                }
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    if (esp32FS.children[i].children[ii].children[iii].path.includes(somepath)) {
                        return true;
                    }
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        if (esp32FS.children[i].children[ii].children[iii].children[iv].path.includes(somepath)) {
                            return true;
                        }
                        for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path.includes(somepath)) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }

    function pathExistsForRename(somepath) {
        if (somepath == "/") {
            return true;
        }
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            if (esp32FS.children[i].path == somepath) {
                return true;
            }
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                if (esp32FS.children[i].children[ii].path == somepath) {
                    return true;
                }
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    if (esp32FS.children[i].children[ii].children[iii].path == somepath) {
                        return true;
                    }
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        if (esp32FS.children[i].children[ii].children[iii].children[iv].path == somepath) {
                            return true;
                        }
                        for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path == somepath) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }

    function pathChildren(path) {
        let childrenPaths = [];
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            if (esp32FS.children[i].path.includes(path)) {
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    childrenPaths.push(esp32FS.children[i].children[ii].path);
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        childrenPaths.push(esp32FS.children[i].children[ii].children[iii].path);
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].path);
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path);
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                    childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path);
                                }
                            }
                        }
                    }
                }
                break;
            }
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                if (esp32FS.children[i].children[ii].path.includes(path)) {
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        childrenPaths.push(esp32FS.children[i].children[ii].children[iii].path);
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].path);
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path);
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                    childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path);
                                }
                            }
                        }
                    }
                    break;
                }
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    if (esp32FS.children[i].children[ii].children[iii].path.includes(path)) {
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].path);
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path);
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                    childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path);
                                }
                            }
                        }
                        break;
                    }
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        if (esp32FS.children[i].children[ii].children[iii].children[iv].path.includes(path)) {
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path);
                            }
                            break;
                        }
                        for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path.includes(path)) {
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                    childrenPaths.push(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path);
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (childrenPaths.length === 0) {
            return [false, "No children"];
        } else {
            return [true, childrenPaths];
        }
    }

    function filesystemSize(path) {
        let directoriesTotalSize = 0;
        if (path == "/") {
            directoriesTotalSize += 4096;
            for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
                directoriesTotalSize += esp32FS.children[i].size;
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    directoriesTotalSize += esp32FS.children[i].children[ii].size;
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].size;
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                    directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
                if (esp32FS.children[i].path.includes(path)) {
                    for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                        directoriesTotalSize += esp32FS.children[i].children[ii].size;
                        for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                            directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].size;
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    if (esp32FS.children[i].children[ii].path.includes(path)) {
                        for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                            directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].size;
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                            }
                        }
                        break;
                    }
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        if (esp32FS.children[i].children[ii].children[iii].path.includes(path)) {
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                            }
                            break;
                        }
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].path.includes(path)) {
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                                break;
                            }
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path.includes(path)) {
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        directoriesTotalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return directoriesTotalSize;
    }

    function df() {
        const sdcardSize = 4294967296;
        const sdcardReserve = 104857600;
        const fsSize = 984040;
        const sdReserve = 311296;
        
        const sdcardMaxUtilSpace = sdcardSize - sdcardReserve;
        const sdcardFilesSpace = filesystemSize("/sdcard/");
        const sdcardPercentageUsed = Math.ceil((sdcardFilesSpace / sdcardMaxUtilSpace) * 100);
        const sdcardPercentageFree = 100 - sdcardPercentageUsed;
        const sdcardMaxUtilSpaceConverted = bytesConverter(sdcardMaxUtilSpace, 2, "filesystem");
        const sdcardOnlyFilesSpaceConverted = bytesConverter(sdcardFilesSpace, 2, "filesystem");
        const sdcardFreeSpaceConverted = bytesConverter(sdcardMaxUtilSpace - sdcardFilesSpace, 2, "filesystem");
        const sdcardPercentageUsedConverted = sdcardPercentageUsed + "%";
        const sdcardPercentageFreeConverted = sdcardPercentageFree + "%";
        
        const fsMaxUtilSpace = fsSize - sdReserve;
        const fsFilesSpace = filesystemSize("/");
        const onlyfsFilesSpace = fsFilesSpace - sdcardFilesSpace;
        const fsPercentageUsed = Math.ceil((onlyfsFilesSpace / fsMaxUtilSpace) * 100);
        const fsPercentageFree = 100 - fsPercentageUsed;
        const fsMaxUtilSpaceConverted = bytesConverter(fsMaxUtilSpace, 2, "filesystem");
        const fsOnlyFilesSpaceConverted = bytesConverter(onlyfsFilesSpace, 2, "filesystem");
        const fsFreeSpaceConverted = bytesConverter(fsMaxUtilSpace - onlyfsFilesSpace, 2, "filesystem");
        const fsPercentageUsedConverted = fsPercentageUsed + "%";
        const fsPercentageFreeConverted = fsPercentageFree + "%";

        return [
            fsMaxUtilSpaceConverted, 
            fsOnlyFilesSpaceConverted, 
            fsFreeSpaceConverted, 
            fsPercentageUsedConverted, 
            fsPercentageFreeConverted, 
            sdcardMaxUtilSpaceConverted, 
            sdcardOnlyFilesSpaceConverted, 
            sdcardFreeSpaceConverted, 
            sdcardPercentageUsedConverted, 
            sdcardPercentageFreeConverted
        ];
    }

    function sizeSum(path) {
        let totalSize = 0;
        if (path == "/") {
            totalSize += 4096;
            for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
                totalSize += esp32FS.children[i].size;
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    totalSize += esp32FS.children[i].children[ii].size;
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        totalSize += esp32FS.children[i].children[ii].children[iii].size;
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                    totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
                if (esp32FS.children[i].path.includes(path)) {
                    if (esp32FS.children[i].type == "file") {
                        totalSize = esp32FS.children[i].size;
                        break;
                    }
                    for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                        totalSize += esp32FS.children[i].children[ii].size;
                        for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                            totalSize += esp32FS.children[i].children[ii].children[iii].size;
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    if (esp32FS.children[i].children[ii].path.includes(path)) {
                        if (esp32FS.children[i].children[ii].type == "file") {
                            totalSize = esp32FS.children[i].children[ii].size;
                            break;
                        }
                        for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                            totalSize += esp32FS.children[i].children[ii].children[iii].size;
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                            }
                        }
                        break;
                    }
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        if (esp32FS.children[i].children[ii].children[iii].path.includes(path)) {
                            if (esp32FS.children[i].children[ii].children[iii].type == "file") {
                                totalSize = esp32FS.children[i].children[ii].children[iii].size;
                                break;
                            }
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].size;
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                            }
                            break;
                        }
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].path.includes(path)) {
                                if (esp32FS.children[i].children[ii].children[iii].children[iv].type == "file") {
                                    totalSize = esp32FS.children[i].children[ii].children[iii].children[iv].size;
                                    break;
                                }
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                }
                                break;
                            }
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path.includes(path)) {
                                    if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].type == "file") {
                                        totalSize = esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                        break;
                                    }
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        totalSize += esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return totalSize;
    }

    function du(path) {
        childrenPaths = [];
        if (path == "/") {
            childrenPaths.push(["/", bytesConverter(sizeSum("/"), 2, "filesystem")]);
            for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
                childrenPaths.push([esp32FS.children[i].path, bytesConverter(sizeSum(esp32FS.children[i].path), 2, "filesystem")]);
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    childrenPaths.push([esp32FS.children[i].children[ii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].path), 2, "filesystem")]);
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].path), 2, "filesystem")]);
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].path), 2, "filesystem")]);
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path), 2, "filesystem")]);
                                for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                    childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path), 2, "filesystem")]);
                                }
                            }
                        }
                    }
                }
            }
        } else {
            for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
                if (esp32FS.children[i].path.includes(path)) {
                    if (esp32FS.children[i].type == "file") {
                        childrenPaths.push([esp32FS.children[i].path, bytesConverter(sizeSum(esp32FS.children[i].path), 2, "filesystem")]);
                        break;
                    }
                    else {
                        childrenPaths.push([esp32FS.children[i].path, bytesConverter(sizeSum(esp32FS.children[i].path), 2, "filesystem")]);
                    }
                    for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                        childrenPaths.push([esp32FS.children[i].children[ii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].path), 2, "filesystem")]);
                        for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                            childrenPaths.push([esp32FS.children[i].children[ii].children[iii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].path), 2, "filesystem")]);
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].path), 2, "filesystem")]);
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path), 2, "filesystem")]);
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path), 2, "filesystem")]);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                    if (esp32FS.children[i].children[ii].path.includes(path)) {
                        if (esp32FS.children[i].children[ii].type == "file") {
                            childrenPaths.push([esp32FS.children[i].children[ii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].path), 2, "filesystem")]);
                            break;
                        }
                        else {
                            childrenPaths.push([esp32FS.children[i].children[ii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].path), 2, "filesystem")]);
                        }
                        for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                            childrenPaths.push([esp32FS.children[i].children[ii].children[iii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].path), 2, "filesystem")]);
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].path), 2, "filesystem")]);
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path), 2, "filesystem")]);
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path), 2, "filesystem")]);
                                    }
                                }
                            }
                        }
                        break;
                    }
                    for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                        if (esp32FS.children[i].children[ii].children[iii].path.includes(path)) {
                            if (esp32FS.children[i].children[ii].children[iii].type == "file") {
                                childrenPaths.push([esp32FS.children[i].children[ii].children[iii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].path), 2, "filesystem")]);
                                break;
                            }
                            else {
                                childrenPaths.push([esp32FS.children[i].children[ii].children[iii].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].path), 2, "filesystem")]);
                            }
                            for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                                childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].path), 2, "filesystem")]);
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path), 2, "filesystem")]);
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path), 2, "filesystem")]);
                                    }
                                }
                            }
                            break;
                        }
                        for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].path.includes(path)) {
                                if (esp32FS.children[i].children[ii].children[iii].children[iv].type == "file") {
                                    childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].path), 2, "filesystem")]);
                                    break;
                                }
                                else {
                                    childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].path), 2, "filesystem")]);
                                }
                                for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                    childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path), 2, "filesystem")]);
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path), 2, "filesystem")]);
                                    }
                                }
                                break;
                            }
                            for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                                if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path.includes(path)) {
                                    if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].type == "file") {
                                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path), 2, "filesystem")]);
                                        break;
                                    }
                                    else {
                                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path), 2, "filesystem")]);
                                    }
                                    for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                        childrenPaths.push([esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path, bytesConverter(sizeSum(esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path), 2, "filesystem")]);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return [true, childrenPaths];
    }

    function fileSize(someprompt, somepath) {
        let pathType = "relative";
        let path = "";

        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            path = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            path = "/" + somepath
        }

        let calcSize = -1;
        for (let i = 0, l1 = esp32FS.children.length; i < l1; i++) {
            if (esp32FS.children[i].path == path) {
                calcSize = esp32FS.children[i].size;
                break;
            }
            for (let ii = 0, l2 = esp32FS.children[i].children.length; ii < l2; ii++) {
                if (esp32FS.children[i].children[ii].path == path) {
                    calcSize = esp32FS.children[i].children[ii].size;
                    break;
                }
                for (let iii = 0, l3 = esp32FS.children[i].children[ii].children.length; iii < l3; iii++) {
                    if (esp32FS.children[i].children[ii].children[iii].path == path) {
                        calcSize = esp32FS.children[i].children[ii].children[iii].size;
                        break;
                    }
                    for (let iv = 0, l4 = esp32FS.children[i].children[ii].children[iii].children.length; iv < l4; iv++) {
                        if (esp32FS.children[i].children[ii].children[iii].children[iv].path == path) {
                            calcSize = esp32FS.children[i].children[ii].children[iii].children[iv].size;
                            break;
                        }
                        for (let v = 0, l5 = esp32FS.children[i].children[ii].children[iii].children[iv].children.length; v < l5; v++) {
                            if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].path == path) {
                                calcSize = esp32FS.children[i].children[ii].children[iii].children[iv].children[v].size;
                                break;
                            }
                            for (let vi = 0, l6 = esp32FS.children[i].children[ii].children[iii].children[iv].children[vi].children.length; vi < l6; vi++) {
                                if (esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].path == path) {
                                    calcSize = esp32FS.children[i].children[ii].children[iii].children[iv].children[v].children[vi].size;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (calcSize >= 0) {
            return [true, calcSize];
        }
        else {
            return [false, "File does not exist. Cannot calculate the size of a non-existing file!"];
        }
    }

    function mkdirVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }
        const promptArray = someprompt.split("/");
        const pathArray = somepath.split("/");
        const absolutePathArray = absolutePath.split("/");
        const promptChunkNum = promptArray.length;
        const pathChunkNum = pathArray.length;
        const totalChunkNum = promptChunkNum + pathChunkNum;
        const newFolderLength = -1 * absolutePathArray[absolutePathArray.length - 1].length;
        const parentFolder = absolutePath.slice(0, newFolderLength);
        if (totalChunkNum <= 5) {
            if (! pathExists(absolutePath + "/")) {
                if (pathExists(parentFolder)) {
                    if (absolutePathArray[1] == "sdcard") {
                        fs = "SD";
                    } else {
                        fs = "LittleFS";
                    }
                } else {
                    errorsNum += 1;
                    errors.push("Parent directory does not exist. Cannot make the dir");
                }
            } else {
                errorsNum += 1;
                errors.push("Directory already exists. Cannot make the directory");
            }
        } else {
            errorsNum += 1;
            errors.push("Path length beyond 5 levels (" + totalChunkNum + ")");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function mkdir(prompt, dir) {
        const mkdirVerification = mkdirVerify(prompt, dir);
        if (mkdirVerification[0]) {
            const reqFS = mkdirVerification[1];
            const reqPath = mkdirVerification[2];

            const request = new XMLHttpRequest();
            request.open("POST", "http://"+ esp32IPDomain +"/mkdir", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path=" + reqPath);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot make directory"];
            }

        } else {
            const mkdirVerificationError = mkdirVerification[1][0];
            return [false, mkdirVerificationError];
        }
    }

    function rmdirVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }

        const absolutePathArray = absolutePath.split("/");

        if (pathExists(absolutePath + "/")) {
            if (absolutePathArray[1] == "sdcard") {
                fs = "SD";
            } else {
                fs = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("Directory does not exist. Cannot delete a non-existing directory");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function rmdir(prompt, dir) {
        const rmdirVerification = rmdirVerify(prompt, dir);
        if (rmdirVerification[0]) {
            const reqFS = rmdirVerification[1];
            const reqPath = rmdirVerification[2];

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/rmdir", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path=" + reqPath);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot delete directory"];
            }

        } else {
            const rmdirVerificationError = rmdirVerification[1][0];
            return [false, rmdirVerificationError];
        }
    }

    function touchVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }
        const promptArray = someprompt.split("/");
        const pathArray = somepath.split("/");
        const absolutePathArray = absolutePath.split("/");
        const promptChunkNum = promptArray.length;
        const pathChunkNum = pathArray.length;
        const totalChunkNum = promptChunkNum + pathChunkNum;
        const newFolderLength = -1 * absolutePathArray[absolutePathArray.length - 1].length;
        const parentFolder = absolutePath.slice(0, newFolderLength);
        if (totalChunkNum <= 5) {
            if (! pathExists(absolutePath)) {
                if (pathExists(parentFolder)) {
                    if (absolutePathArray[1] == "sdcard") {
                        fs = "SD";
                    } else {
                        fs = "LittleFS";
                    }
                } else {
                    errorsNum += 1;
                    errors.push("Parent directory does not exist. Cannot make the file");
                }
            } else {
                errorsNum += 1;
                errors.push("File already exists. Cannot make the file");
            }
        } else {
            errorsNum += 1;
            errors.push("Path length beyond 5 levels (" + totalChunkNum + ")");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function touch(prompt, file) {
        const touchVerification = touchVerify(prompt, file);
        if (touchVerification[0]) {
            const reqFS = touchVerification[1];
            const reqPath = touchVerification[2];

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/touch", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path=" + reqPath);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot make the requested file"];
            }

        } else {
            const touchVerificationError = touchVerification[1][0];
            return [false, touchVerificationError];
        }
    }

    function rmfileVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }

        const absolutePathArray = absolutePath.split("/");

        if (pathExists(absolutePath)) {
            if (absolutePathArray[1] == "sdcard") {
                fs = "SD";
            } else {
                fs = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("File does not exist. Cannot delete a non-existing file");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function rmfile(prompt, file) {
        const rmfileVerification = rmfileVerify(prompt, file);
        if (rmfileVerification[0]) {
            const reqFS = rmfileVerification[1];
            const reqPath = rmfileVerification[2];

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/rm", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path=" + reqPath);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot delete file"];
            }

        } else {
            const rmfileVerificationError = rmfileVerification[1][0];
            return [false, rmfileVerificationError];
        }
    }

    function readfileVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }

        const absolutePathArray = absolutePath.split("/");

        if (pathExists(absolutePath)) {
            if (absolutePathArray[1] == "sdcard") {
                fs = "SD";
            } else {
                fs = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("File does not exist. Cannot display contents of a non-existing file");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    async function readfile(prompt, file) {
        const readfileVerification = readfileVerify(prompt, file);
        if (readfileVerification[0]) {
            const reqPath = readfileVerification[2];

            let response = await fetch("http://" + esp32IPDomain + reqPath);
            if (response.status === 200) {
                let text_data = await response.text();
                $("#termTextHistory").append("<br/><div><pre>// Start of file (read only): " + reqPath + "</pre></div>");
                $("#termTextHistory").append("<div><pre>" + text_data.replaceAll("<", "&lt;").replaceAll(">", "&gt;") + "</pre></div>");
                $("#termTextHistory").append("<div><pre>// End of file (read only): " + reqPath + "</pre></div>");
                return [true];
            } else {
                $("#termTextHistory").append("<div>cat failed: Couldn't get the contents of the file" + reqPath + "</div>");
                return [false];
            }

        } else {
            $("#termTextHistory").append("<div>cat failed: " + file + " does not exist. Cannot display contents</div>");
            return [false];
        }
    }

    function echoVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }

        const absolutePathArray = absolutePath.split("/");

        if (pathExists(absolutePath)) {
            if (absolutePathArray[1] == "sdcard") {
                fs = "SD";
            } else {
                fs = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("echo failed: Cannot amend with contents a non-existing file");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function echo(prompt, content, file) {
        const echoVerification = echoVerify(prompt, file);
        if (echoVerification[0]) {
            const reqFS = echoVerification[1];
            const reqPath = echoVerification[2];
            const reqCont = content
                .replaceAll("%", "%25")
                .replaceAll(" ", "%20")
                .replaceAll("&nbsp;", "%20")
                .replaceAll("&", "%26")
                .replaceAll("+", "%2B");

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/echo", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path=" + reqPath + "&content=" + reqCont);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "echo failed: Cannot amend with content the requested file"];
            }

        } else {
            const echoVerificationError = echoVerification[1][0];
            return [false, echoVerificationError];
        }
    }

    function truncatefileVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }

        const absolutePathArray = absolutePath.split("/");

        if (pathExists(absolutePath)) {
            if (absolutePathArray[1] == "sdcard") {
                fs = "SD";
            } else {
                fs = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("File does not exist. Cannot truncate a non-existing file");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function truncatefile(prompt, file) {
        const truncatefileVerification = truncatefileVerify(prompt, file);
        if (truncatefileVerification[0]) {
            const reqFS = truncatefileVerification[1];
            const reqPath = truncatefileVerification[2];

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/truncate", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path=" + reqPath);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot truncate the file"];
            }

        } else {
            const truncatefileVerificationError = truncatefileVerification[1][0];
            return [false, truncatefileVerificationError];
        }
    }

    function cpfileVerify(someprompt, somepath1, somepath2) {

        let pathType1 = "relative";
        let pathType2 = "relative";
        let fs1 = "";
        let fs2 = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath1.slice(0, 1) == "/") {
            somepath1 = somepath1.slice(1);
            pathType1 = "absolute";
        }
        if (somepath1.slice(-1) == "/") {
            somepath1 = somepath1.slice(0, -1);
        }
        if (pathType1 == "relative") {
            absolutePath1 = "/" + someprompt + "/" + somepath1
        }
        if (pathType1 == "absolute") {
            absolutePath1 = "/" + somepath1
        }
        if (somepath2.slice(0, 1) == "/") {
            somepath2 = somepath2.slice(1);
            pathType2 = "absolute";
        }
        if (somepath2.slice(-1) == "/") {
            somepath2 = somepath2.slice(0, -1);
        }
        if (pathType2 == "relative") {
            absolutePath2 = "/" + someprompt + "/" + somepath2
        }
        if (pathType2 == "absolute") {
            absolutePath2 = "/" + somepath2
        }

        const absolutePathArray1 = absolutePath1.split("/");
        const absolutePathArray2 = absolutePath2.split("/");

        if (pathExists(absolutePath1)) {
            if (absolutePathArray1[1] == "sdcard") {
                fs1 = "SD";
            } else {
                fs1 = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("Source file does not exist. I cannot copy a non existing file");
        }
        if (! pathExists(absolutePath2)) {
            if (absolutePathArray2[1] == "sdcard") {
                fs2 = "SD";
            } else {
                fs2 = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("Target path exists. I cannot copy to an existing file");
        }

        if (errorsNum === 0) {
            return [true, fs1, absolutePath1, fs2, absolutePath2];
        } else {
            return [false, errors];
        }
    }

    function cpfile(prompt, file1, file2) {
        const cpfileVerification = cpfileVerify(prompt, file1, file2);
        if (cpfileVerification[0]) {
            const reqFS1 = cpfileVerification[1];
            const reqPath1 = cpfileVerification[2];
            const reqFS2 = cpfileVerification[3];
            const reqPath2 = cpfileVerification[4];

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/cp", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs1=" + reqFS1 + "&path1=" + reqPath1 + "&fs2=" + reqFS2 + "&path2=" + reqPath2);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot copy file"];
            }

        } else {
            const cpfileVerificationError = cpfileVerification[1][0];
            return [false, cpfileVerificationError];
        }
    }

    function mvfileVerify(someprompt, somepath1, somepath2) {

        let pathType1 = "relative";
        let pathType2 = "relative";
        let fs1 = "";
        let fs2 = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath1.slice(0, 1) == "/") {
            somepath1 = somepath1.slice(1);
            pathType1 = "absolute";
        }
        if (somepath1.slice(-1) == "/") {
            somepath1 = somepath1.slice(0, -1);
        }
        if (pathType1 == "relative") {
            absolutePath1 = "/" + someprompt + "/" + somepath1
        }
        if (pathType1 == "absolute") {
            absolutePath1 = "/" + somepath1
        }
        if (somepath2.slice(0, 1) == "/") {
            somepath2 = somepath2.slice(1);
            pathType2 = "absolute";
        }
        if (somepath2.slice(-1) == "/") {
            somepath2 = somepath2.slice(0, -1);
        }
        if (pathType2 == "relative") {
            absolutePath2 = "/" + someprompt + "/" + somepath2
        }
        if (pathType2 == "absolute") {
            absolutePath2 = "/" + somepath2
        }

        const absolutePathArray1 = absolutePath1.split("/");
        const absolutePathArray2 = absolutePath2.split("/");

        if (pathExists(absolutePath1)) {
            if (absolutePathArray1[1] == "sdcard") {
                fs1 = "SD";
            } else {
                fs1 = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("Source file does not exist. I cannot move/rename a non existing file");
        }
        if (! pathExists(absolutePath2)) {
            if (absolutePathArray2[1] == "sdcard") {
                fs2 = "SD";
            } else {
                fs2 = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("Target path exists. I cannot move/rename.");
        }

        if (errorsNum === 0) {
            return [true, fs1, absolutePath1, fs2, absolutePath2];
        } else {
            return [false, errors];
        }
    }

    function mvfile(prompt, file1, file2) {
        const mvfileVerification = mvfileVerify(prompt, file1, file2);
        if (mvfileVerification[0]) {
            const reqFS1 = mvfileVerification[1];
            const reqPath1 = mvfileVerification[2];
            const reqFS2 = mvfileVerification[3];
            const reqPath2 = mvfileVerification[4];

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/mv", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs1=" + reqFS1 + "&path1=" + reqPath1 + "&fs2=" + reqFS2 + "&path2=" + reqPath2);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot move/rename file"];
            }

        } else {
            const mvfileVerificationError = mvfileVerification[1][0];
            return [false, mvfileVerificationError];
        }
    }

    function renamefileVerify(someprompt, somepath1, somepath2) {

        let pathType1 = "relative";
        let pathType2 = "relative";
        let fs = "";
        let fs1 = "";
        let fs2 = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath1.slice(0, 1) == "/") {
            somepath1 = somepath1.slice(1);
            pathType1 = "absolute";
        }
        if (somepath1.slice(-1) == "/") {
            somepath1 = somepath1.slice(0, -1);
        }
        if (pathType1 == "relative") {
            absolutePath1 = "/" + someprompt + "/" + somepath1
        }
        if (pathType1 == "absolute") {
            absolutePath1 = "/" + somepath1
        }
        if (somepath2.slice(0, 1) == "/") {
            somepath2 = somepath2.slice(1);
            pathType2 = "absolute";
        }
        if (somepath2.slice(-1) == "/") {
            somepath2 = somepath2.slice(0, -1);
        }
        if (pathType2 == "relative") {
            absolutePath2 = "/" + someprompt + "/" + somepath2
        }
        if (pathType2 == "absolute") {
            absolutePath2 = "/" + somepath2
        }

        const absolutePathArray1 = absolutePath1.split("/");
        const absolutePathArray2 = absolutePath2.split("/");

        if (pathExists(absolutePath1)) {
            if (absolutePathArray1[1] == "sdcard") {
                fs1 = "SD";
            } else {
                fs1 = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("Source file does not exist. I cannot move/rename a non existing file");
        }
        if (! pathExistsForRename(absolutePath2) && ! pathExistsForRename(absolutePath2 + "/")) {
            if (absolutePathArray2[1] == "sdcard") {
                fs2 = "SD";
            } else {
                fs2 = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("Target path exists. I cannot move/rename.");
        }
        if (fs1 != fs2) {
            errorsNum += 1;
            errors.push("The two paths belong to a different filesystem. Please use mv instead of rename.");
        }
        else {
            fs = fs1;
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath1, absolutePath2];
        } else {
            return [false, errors];
        }
    }

    function renamefile(prompt, file1, file2) {
        const renamefileVerification = renamefileVerify(prompt, file1, file2);
        if (renamefileVerification[0]) {
            const reqFS = renamefileVerification[1];
            const reqPath1 = renamefileVerification[2];
            const reqPath2 = renamefileVerification[3];

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/rename", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path1=" + reqPath1 + "&path2=" + reqPath2);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "Server error! Cannot rename directory/file"];
            }

        } else {
            const renamefileVerificationError = renamefileVerification[1][0];
            return [false, renamefileVerificationError];
        }
    }

    function editfileVerify(someprompt, somepath) {

        let pathType = "relative";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }

        if (! pathExists(absolutePath)) {
            errorsNum += 1;
            errors.push("echo failed: Cannot amend with contents a non-existing file");
        }
        if (errorsNum === 0) {
            return [true, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function saveVerify(someprompt, somepath) {

        let pathType = "relative";
        let fs = "";
        let errorsNum = 0;
        let errors = [];
        if (someprompt.slice(0, 1) == "/") {
            someprompt = someprompt.slice(1);
        }
        if (someprompt.slice(-1) == "/") {
            someprompt = someprompt.slice(0, -1);
        }
        if (somepath.slice(0, 1) == "/") {
            somepath = somepath.slice(1);
            pathType = "absolute";
        }
        if (somepath.slice(-1) == "/") {
            somepath = somepath.slice(0, -1);
        }
        if (pathType == "relative") {
            absolutePath = "/" + someprompt + "/" + somepath
        }
        if (pathType == "absolute") {
            absolutePath = "/" + somepath
        }

        const absolutePathArray = absolutePath.split("/");

        if (pathExists(absolutePath)) {
            if (absolutePathArray[1] == "sdcard") {
                fs = "SD";
            } else {
                fs = "LittleFS";
            }
        } else {
            errorsNum += 1;
            errors.push("echo failed: Cannot amend with contents a non-existing file");
        }
        if (errorsNum === 0) {
            return [true, fs, absolutePath];
        } else {
            return [false, errors];
        }
    }

    function save(prompt, file) {
        const saveVerification = saveVerify(prompt, file);
        if (saveVerification[0]) {
            const reqFS = saveVerification[1];
            const reqPath = saveVerification[2];
            const reqCont = $("#editorGUI").html()
                .replaceAll("\n", "<div><br></div>")
                .replaceAll("<div><div>", "")
                .replaceAll("</div></div>", "")
                .replaceAll("<div>", "\n")
                .replaceAll("<br>", "")
                .replaceAll("</div>", "")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("<span style=\"font-weight: var(--bs-body-font-weight); text-align: var(--bs-body-text-align);\">", "")
                .replaceAll("</span>", "")
                .replaceAll("%", "%25")
                .replaceAll(" ", "%20")
                .replaceAll("&nbsp;", "%20")
                .replaceAll("&", "%26")
                .replaceAll("+", "%2B");

            const request = new XMLHttpRequest();
            request.open("POST", "http://" + esp32IPDomain + "/echo", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("fs=" + reqFS + "&path=" + reqPath + "&content=" + reqCont);
            if (request.status === 200) {
                esp32FS = getFilesystem();
                return [true];
            } else {
                return [false, "save failed: Cannot amend with content the requested file"];
            }

        } else {
            const saveVerificationError = saveVerification[1][0];
            return [false, saveVerificationError];
        }
    }

    function esp32Reboot() {
        const request = new XMLHttpRequest();
        request.open("POST", "http://" + esp32IPDomain + "/reboot", true);
        request.send();
    }

    function removeNonAscii(str) {
        if ((str === null) || (str === '')) {
            return false;
        } else {
            str = str.toString();
            return str.replace(/[^\x20-\x7E]/g, '');
        }
    }

    function findRowsCols(numVal, cols = 5) {
        let breakPoints = []
        for (i =( cols - 1), s = numVal; i < s; i += cols) {
            breakPoints.push(i);
        }
        let lastRowCols = numVal % cols;
        return [breakPoints, lastRowCols];
    }

    function getUname() {
        let request = new XMLHttpRequest();
        request.open("GET", "http://" + esp32IPDomain + "/uname.json", false);
        request.send(null);
        if (request.status === 200) {
            data = JSON.parse(request.responseText);
            return data;
        }
    }
    
    function processUname() {
        const lx6 = ["ESP32-D0WD-V3", "ESP32-D0WDR2-V3", "ESP32-U4WDH", "ESP32-S0WD", "ESP32-D0WD", "ESP32-D0WDQ6", "ESP32-D0WDQ6-V3"];
        const lx7 = ["ESP32-S2", "ESP32-S2FH2", "ESP32-S2FH4", "ESP32-S2FN4R2", "ESP32-S2R2", "ESP32-S3", "ESP32-S3FN8", "ESP32-S3R2", "ESP32-S3R8", "ESP32-S3R8V", "ESP32-S3FH4R2"];
        const riscV = ["ESP32-C3", "ESP32-C3FN4", "ESP32-C3FH4", "ESP32-C3FH4AZ"];
        const uname = getUname().uname[0];
        const chipModel = uname.chipModel;
        const chipCores = uname.chipCores;
        let coreProcessor;
        let numCores;
        if (lx6.includes(chipModel)) {
            coreProcessor = "Tensilica Xtensa 32-bit LX6";
        } else if (lx7.includes(chipModel)) {
              coreProcessor = "Tensilica Xtensa 32-bit LX7";
        } else if (riscV.includes(chipModel)) {
              coreProcessor = "32­bit RISC­-V";
        } else {
              coreProcessor = "Unknown processor";
        }
        if (chipCores === 2) {
            numCores = "Dual Core";
        }
        else {
            numCores = "Single Core";
        }
        return {
              "totalHeap": uname.totalHeap,
              "usedHeap": uname.usedHeap,
              "freeHeap": uname.freeHeap,
              "totalPsram": uname.totalPsram,
              "usedPsram": uname.usedPsram,
              "freePsram": uname.freePsram,
              "chipModel": uname.chipModel,
              "coreProcessor": coreProcessor + " " + numCores,
              "chipCores": uname.chipCores,
              "chipRevision": uname.chipRevision,
              "cpuFrequency": uname.cpuFrequency,
              "sdkVersion": uname.sdkVersion,
              "flashChipSize": uname.flashChipSize,
              "macAddress": uname.macAddress,
              "kernel": "ESP32-OS",
              "hostname": esp32IPDomain,
              "kernelName": "0.1.0-generic",
              "kernelVersion": "#1~0.1.0-ESP32-OS SMP Tue Jul 11 17:56:10 UTC",
              "osName": "ESP32-OS 0.1.0",
              "deviceName": uname.deviceName,
              "bootTime": uname.bootTime
        }
    }
    
    function requestUname(item) {
        let uname = processUname();
        switch (item) {
            case "all":
                return uname.kernel + " " + uname.deviceName + ".local " + uname.kernelName + " " + uname.kernelVersion + " " + uname.coreProcessor + " " + uname.osName;
            case "totalHeap":
                return uname.totalHeap;
            case "usedHeap":
                return uname.usedHeap;
            case "freeHeap":
                return uname.freeHeap;
            case "totalPsram":
                return uname.totalPsram;
            case "usedPsram":
                return uname.usedPsram;
            case "freePsram":
                return uname.freePsram;
            case "chipModel":
                return uname.chipModel;
            case "coreProcessor":
                return uname.coreProcessor;
            case "chipCores":
                return uname.chipCores;
            case "chipRevision":
                return uname.chipRevision;
            case "cpuFrequency":
                return uname.cpuFrequency;
            case "sdkVersion":
                return uname.sdkVersion;
            case "flashChipSize":
                return uname.flashChipSize;
            case "macAddress":
                return uname.macAddress;
            case "kernel":
                return uname.kernel;
            case "hostname":
                return uname.hostname;
            case "kernelName":
                return uname.kernelName;
            case "kernelVersion":
                return uname.kernelVersion;
            case "osName":
                return uname.osName;
            case "deviceName":
                return uname.deviceName;
            case "bootTime":
                return uname.bootTime;
            default:
                return uname.kernel + " " + uname.deviceName + ".local " + uname.kernelName + " " + uname.kernelVersion + " " + uname.coreProcessor + " " + uname.osName;
        }
    }

    function bootDateTime(timestamp) {
        const bootDateTime = new Date(timestamp*1000);
        return bootDateTime;
    }
    
    function currentDateTime() {
        const currentDateTime = new Date();
        return currentDateTime;
    }
    
    function upTime(timestamp) {
        const bootTimestamp = new Date(timestamp*1000);
        const currentTimestamp = new Date().getTime();
        const upTimeSec = Math.floor((currentTimestamp - bootTimestamp) / 1000);
        const d = Math.floor(upTimeSec / (3600*24));
        const h = Math.floor(upTimeSec % (3600*24) / 3600);
        const m = Math.floor(upTimeSec % 3600 / 60);
        const s = Math.floor(upTimeSec % 60);
        const dt = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
        const ht = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
        const mt = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
        const st = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        const upTime = dt + ht + mt + st;
        return upTime;
    }

    $("#termStatement").html(termStatement);
    $("#termPromptArea").html(prompt);
    $("#termTextArea").html("&zwnj;")

    $("#termTextArea").keydown(function (e) {
        endPosition = $("#termTextArea").html().length;
        if (endPosition <= 2 && e.key == "Backspace") {
            $("#termTextArea").html(nonAscii);
        }
        if (e.key == "ArrowUp") {
            commandCounter -= 1;
            if (commandCounter < 0) {
                commandCounter = 0;
            }
            if (commandCounter >= 0 && commandCounter < commandHistory.length) {
                $("#termTextArea").html(nonAscii + commandHistory[commandCounter].replace("<div>", "").replace("&nbsp;", " ").replace("</div>", ""));
            }
        }
        if (e.key == "ArrowDown") {
            commandCounter += 1;
            if (commandCounter == commandHistory.length) {
                commandCounter = commandHistory.length;
                $("#termTextArea").html(nonAscii);

            }
            if (commandCounter > commandHistory.length) {
                commandCounter = commandHistory.length;
            }
            if (commandCounter >= 0 && commandCounter < commandHistory.length) {
                $("#termTextArea").html(nonAscii + commandHistory[commandCounter].replace("<div>", "").replace("&nbsp;", " ").replace("</div>", ""));
            }
        }
        if ((e.key == "c" || e.key == "C") && e.ctrlKey) {
            e.preventDefault();
        }
        if ((e.key == "z" || e.key == "Z") && e.ctrlKey) {
            e.preventDefault();
        }
        if ((e.key == "v" || e.key == "V") && e.ctrlKey) {
            e.preventDefault();
        }
        if (e.key == "Enter") {
            termTextAreaValue = $("#termTextArea").html();
            termTextAreaValue = removeNonAscii(termTextAreaValue);
            commandArray = termTextAreaValue.split(" ");
            commandChunkNum = commandArray.length;
            switch (commandArray[0]) {
                case "exit":
                    $("#termTextHistory").html("");
                    $("#termPromptArea").html(prompt);
                    $("#termModal").modal("hide");
                    break;
                case "clear":
                    $("#termTextHistory").html("");
                    $("#termPromptArea").html(prompt);
                    break;
                case "cd":
                    if (commandChunkNum == 2) {
                        newDirectory = commandArray[1];
                        if (newDirectory.charAt(0) == "/" && newDirectory.length == 1) {
                            newDirectory = "/";
                        } else if (newDirectory == "." || newDirectory == "./" || newDirectory == ".." || newDirectory == "../" || newDirectory == "../../" || newDirectory == "../../../" || newDirectory == "../../../../" || newDirectory == "../../../../../") {
                            newDirectory = newDirectory;
                        } else if (newDirectory.split("../").length > 5) {
                            newDirectory = "/";
                        } else if (newDirectory.charAt(0) == "/" && newDirectory.length != 1) {
                            newDirectory = newDirectory.substring(1);
                            if (newDirectory.charAt(newDirectory.length - 1) == "/") {
                                newDirectory = newDirectory.substring(0, newDirectory.length - 1);
                            }
                            directoryArray = newDirectory.split("/");
                            newDirectoryChunkNum = directoryArray.length;
                            if (fileTypesArray.some(ft => directoryArray[newDirectoryChunkNum - 1].includes(ft))) { // it is a file, has an extension
                                newDirectory = "/" + newDirectory;
                            } else {
                                newDirectory = "/" + newDirectory + "/";
                            } firstLevelArguments = "/" + directoryArray[0] + "/";
                            secondLevelArguments = directoryArray[1] + "/";
                            thirdLevelArguments = directoryArray[2] + "/";
                            fourthLevelArguments = directoryArray[3] + "/";
                            fifthLevelArguments = directoryArray[4] + "/";

                            switch (newDirectoryChunkNum) {
                                case 1: searchFSLevel = firstLevelFS(firstLevelArguments);
                                    break;
                                case 2: searchFSLevel = secondLevelFS(firstLevelArguments + secondLevelArguments);
                                    break;
                                case 3: searchFSLevel = thirdLevelFS(firstLevelArguments + secondLevelArguments + thirdLevelArguments);
                                    break;
                                case 4: searchFSLevel = fourthLevelFS(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments);
                                    break;
                                case 5: searchFSLevel = fifthLevelFS(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments + fifthLevelArguments);
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            newDirectory = termDirectory.trim() + newDirectory;
                            newDirectory = newDirectory.substring(1);
                            if (newDirectory.charAt(newDirectory.length - 1) == "/") {
                                newDirectory = newDirectory.substring(0, newDirectory.length - 1);
                            }
                            directoryArray = newDirectory.split("/");
                            newDirectoryChunkNum = directoryArray.length;
                            if (fileTypesArray.some(ft => directoryArray[newDirectoryChunkNum - 1].includes(ft))) {
                                newDirectory = "/" + newDirectory;
                            } else {
                                newDirectory = "/" + newDirectory + "/";
                            } firstLevelArguments = "/" + directoryArray[0] + "/";
                            secondLevelArguments = directoryArray[1] + "/";
                            thirdLevelArguments = directoryArray[2] + "/";
                            fourthLevelArguments = directoryArray[3] + "/";
                            fifthLevelArguments = directoryArray[4] + "/";

                            switch (newDirectoryChunkNum) {
                                case 1: searchFSLevel = firstLevelFS(firstLevelArguments);
                                    break;
                                case 2: searchFSLevel = secondLevelFS(firstLevelArguments + secondLevelArguments);
                                    break;
                                case 3: searchFSLevel = thirdLevelFS(firstLevelArguments + secondLevelArguments + thirdLevelArguments);
                                    break;
                                case 4: searchFSLevel = fourthLevelFS(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments);
                                    break;
                                case 5: searchFSLevel = fifthLevelFS(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments + fifthLevelArguments);
                                    break;
                                default:
                                    break;
                            }
                        }
                        if (newDirectory == null) {
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termTextHistory").append("<div>Command is missing argument</div>");
                            $("#termPromptArea").html(prompt);
                            cdSuccess = false;
                        } else if (fileTypesArray.some(ft => newDirectory.includes(ft))) {
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termTextHistory").append("<div>" + termTextAreaValue.slice(3) + " is not a directory</div>");
                            $("#termPromptArea").html(prompt);
                            cdSuccess = false;
                        } else if (newDirectory == "." || newDirectory == "./") {
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termPromptArea").html(prompt);
                            cdSuccess = false;
                        } else if (newDirectory == ".." || newDirectory == "../") {
                            termDirectory = termDirectory.trim();
                            termDirectory = termDirectory.substring(0, termDirectory.length - 1);
                            termDirectoryArray = termDirectory.split("/");
                            termDirectoryChunkNum = termDirectoryArray.length;
                            if (termDirectory[0] != null && termDirectory[1] != null) {
                                const lastTrailDirectory = termDirectoryArray[termDirectoryChunkNum - 1];
                                const lastTrailDirectoryLength = lastTrailDirectory.length;
                                newDirectory = termDirectory.substring(0, termDirectory.length - lastTrailDirectoryLength);
                                $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                                $("#termPromptArea").html("<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'> " + termDash + newDirectory + " </span>" + termDivider + "</span>");
                                termDirectory = newDirectory;
                                cdSuccess = true;
                            } else {
                                newDirectory = "/";
                                $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                                $("#termPromptArea").html("<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'> " + termDash + newDirectory + " </span>" + termDivider + "</span>");
                                termDirectory = newDirectory;
                                cdSuccess = true;
                            }
                        } else if (newDirectory == "../../" || newDirectory == "../../../" || newDirectory == "../../../../" || newDirectory == "../../../../../") {
                            termDirectory = termDirectory.trim();
                            termDirectory = termDirectory.substring(0, termDirectory.length - 1);
                            termDirectoryArray = termDirectory.split("/");
                            termDirectoryChunkNum = termDirectoryArray.length;

                            if (termDirectory[0] != null && termDirectory[1] != null) {
                                newDirectory = newDirectory.trim();
                                newDirectory = newDirectory.substring(0, newDirectory.length - 1);
                                directoryArray = newDirectory.split("/");
                                newDirectoryChunkNum = directoryArray.length;
                                termDirectory = termDirectory.trim();
                                termDirectory = termDirectory.substring(0, termDirectory.length - 1);
                                termDirectoryArray = termDirectory.split("/");
                                termDirectoryChunkNum = termDirectoryArray.length - 1;
                                if (termDirectoryChunkNum > newDirectoryChunkNum) {
                                    let availableDirectories = termDirectoryChunkNum - newDirectoryChunkNum;
                                    newDirectory = "";
                                    for (let tbr = 0, chn = availableDirectories; tbr <= chn; tbr++) {
                                        newDirectory += termDirectoryArray[tbr] + "/";
                                    }
                                } else {
                                    newDirectory = "/";
                                }
                                $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                                $("#termPromptArea").html("<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'> " + termDash + newDirectory + " </span>" + termDivider + "</span>");
                                termDirectory = newDirectory;
                                cdSuccess = true;
                            } else {
                                newDirectory = "/";
                                $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                                $("#termPromptArea").html("<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'> " + termDash + newDirectory + " </span>" + termDivider + "</span>");
                                termDirectory = newDirectory;
                                cdSuccess = true;
                            }

                        } else if (newDirectory == "/") {
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termPromptArea").html("<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'> " + termDash + newDirectory + " </span>" + termDivider + "</span>");
                            termDirectory = newDirectory;
                            cdSuccess = true;
                        } else if (searchFSLevel && newDirectory != "/" && newDirectory != null) {
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termPromptArea").html("<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'> " + termDash + newDirectory + " </span>" + termDivider + "</span>");
                            termDirectory = newDirectory;
                            cdSuccess = true;
                        } else {
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termTextHistory").append("<div>Non existing directory</div>");
                            $("#termPromptArea").html(prompt);
                            cdSuccess = false;
                        }
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has more or less arguments: (" + commandChunkNum + ") instead of (2)</div>");
                        $("#termPromptArea").html(prompt);
                        cdSuccess = false;
                    }
                    break;
                case "pwd":
                    $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                    if (commandChunkNum == 1) {
                        $("#termTextHistory").append("<div>" + fsRealPath + termDirectory + "</div>");
                    } else {
                        $("#termTextHistory").append("<div>Command has more arguments: (" + commandChunkNum + ") instead of (1)</div>");
                    }
                    break;
                case "ls":
                    if (commandChunkNum == 1) {
                        let localDirectory = termDirectory.trim();
                        if (localDirectory == "/") {
                            searchFSLevel = rootLevelFSList();
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termTextHistory").append("<div><table style='width: 100%'><tr>");
                            for (let fs = 0, fsl = searchFSLevel.length; fs < fsl; fs++) {
                                if (fileTypesArray.includes("." + searchFSLevel[fs].split(".").pop()) && ! fileTypesArrayNoDot.includes(searchFSLevel[fs])) {
                                    fileFolderColor = fileColor;
                                } else {
                                    fileFolderColor = folderColor;
                                }
                                $("#termTextHistory").append("<td><span style='color: " + fileFolderColor + " margin-right: 30px;'>" + searchFSLevel[fs] + "</span></td>");
                                if (findRowsCols(searchFSLevel.length)[0].includes(fs)) {
                                    $("#termTextHistory").append("</tr><tr>");
                                }
                            }
                            $("#termTextHistory").append("</tr></table></div>");
                            break;
                        } else {
                            localDirectory = localDirectory.substring(1, localDirectory.length - 1);
                            localDirectoryArray = localDirectory.split("/");
                            localDirectoryChunkNum = localDirectoryArray.length;
                            firstLevelArguments = "/" + localDirectoryArray[0] + "/";
                            secondLevelArguments = localDirectoryArray[1] + "/";
                            thirdLevelArguments = localDirectoryArray[2] + "/";
                            fourthLevelArguments = localDirectoryArray[3] + "/";
                            fifthLevelArguments = localDirectoryArray[4] + "/";

                            switch (localDirectoryChunkNum) {
                                case 1: searchFSLevel = firstLevelFSList(firstLevelArguments);
                                    break;
                                case 2: searchFSLevel = secondLevelFSList(firstLevelArguments + secondLevelArguments);
                                    break;
                                case 3: searchFSLevel = thirdLevelFSList(firstLevelArguments + secondLevelArguments + thirdLevelArguments);
                                    break;
                                case 4: searchFSLevel = fourthLevelFSList(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments);
                                    break;
                                case 5: searchFSLevel = fifthLevelFSList(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments + fifthLevelArguments);
                                    break;
                                default:
                                    break;
                            }
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termTextHistory").append("<div><table style='width: 100%'><tr>");
                            for (let fs = 0, fsl = searchFSLevel.length; fs < fsl; fs++) {
                                if (fileTypesArray.includes("." + searchFSLevel[fs].split(".").pop()) && ! fileTypesArrayNoDot.includes(searchFSLevel[fs])) {
                                    fileFolderColor = fileColor;
                                } else {
                                    fileFolderColor = folderColor;
                                }
                                $("#termTextHistory").append("<td><span style='color: " + fileFolderColor + " margin-right: 30px;'>" + searchFSLevel[fs] + "</span></td>");
                                if (findRowsCols(searchFSLevel.length)[0].includes(fs)) {
                                    $("#termTextHistory").append("</tr><tr>");
                                }
                            }
                            $("#termTextHistory").append("</tr></table></div>");
                        }
                    } else if (commandChunkNum == 2) {
                        remotePath = commandArray[1].trim();
                        if (remotePath == "/") {
                            searchFSLevel = rootLevelFSList();
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termTextHistory").append("<div><table style='width: 100%'><tr>");
                            for (let fs = 0, fsl = searchFSLevel.length; fs < fsl; fs++) {
                                if (fileTypesArray.includes("." + searchFSLevel[fs].split(".").pop()) && ! fileTypesArrayNoDot.includes(searchFSLevel[fs])) {
                                    fileFolderColor = fileColor;
                                } else {
                                    fileFolderColor = folderColor;
                                }
                                $("#termTextHistory").append("<td><span style='color: " + fileFolderColor + " margin-right: 30px;'>" + searchFSLevel[fs] + "</span></td>");
                                if (findRowsCols(searchFSLevel.length)[0].includes(fs)) {
                                    $("#termTextHistory").append("</tr><tr>");
                                }
                            }
                            $("#termTextHistory").append("</tr></table></div>");
                            break;
                        } else {
                            if (remotePath.substring(0, 1) == "/") {
                                remotePathLength = remotePath.length;
                                remotePath = remotePath.substring(1, remotePath.length);
                                remotePathLength = remotePath.length;
                                if (remotePath.substring(remotePath.length - 1, remotePath.length) == "/") {
                                    remotePath = remotePath.substring(0, remotePath.length - 1);
                                }
                                let remoteDirectoryArray = remotePath.split("/");
                                var remoteDirectoryChunkNum = remoteDirectoryArray.length;
                                firstLevelArguments = "/" + remoteDirectoryArray[0] + "/";
                                secondLevelArguments = remoteDirectoryArray[1] + "/";
                                thirdLevelArguments = remoteDirectoryArray[2] + "/";
                                fourthLevelArguments = remoteDirectoryArray[3] + "/";
                                fifthLevelArguments = remoteDirectoryArray[4] + "/";
                            } else {
                                let combinedDirectory = termDirectory.trim() + remotePath.trim();
                                combinedDirectory = combinedDirectory.substring(1, combinedDirectory.length);
                                if (combinedDirectory.substring(combinedDirectory.length - 1, combinedDirectory.length) == "/") {
                                    combinedDirectory = combinedDirectory.substring(0, combinedDirectory.length - 1);
                                }
                                let remoteDirectoryArray = combinedDirectory.split("/");
                                var remoteDirectoryChunkNum = remoteDirectoryArray.length;
                                firstLevelArguments = "/" + remoteDirectoryArray[0] + "/";
                                secondLevelArguments = remoteDirectoryArray[1] + "/";
                                thirdLevelArguments = remoteDirectoryArray[2] + "/";
                                fourthLevelArguments = remoteDirectoryArray[3] + "/";
                                fifthLevelArguments = remoteDirectoryArray[4] + "/";
                            }

                            switch (remoteDirectoryChunkNum) {
                                case 1: searchFSLevel = firstLevelFSList(firstLevelArguments);
                                    break;
                                case 2: searchFSLevel = secondLevelFSList(firstLevelArguments + secondLevelArguments);
                                    break;
                                case 3: searchFSLevel = thirdLevelFSList(firstLevelArguments + secondLevelArguments + thirdLevelArguments);
                                    break;
                                case 4: searchFSLevel = fourthLevelFSList(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments);
                                    break;
                                case 5: searchFSLevel = fifthLevelFSList(firstLevelArguments + secondLevelArguments + thirdLevelArguments + fourthLevelArguments + fifthLevelArguments);
                                    break;
                                default:
                                    break;
                            }
                            $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                            $("#termTextHistory").append("<div><div><table style='width: 100%'><tr>");
                            if (searchFSLevel) {
                                for (let fs = 0, fsl = searchFSLevel.length; fs < fsl; fs++) {
                                    if (fileTypesArray.includes("." + searchFSLevel[fs].split(".").pop()) && ! fileTypesArrayNoDot.includes(searchFSLevel[fs])) {
                                        fileFolderColor = fileColor;
                                    } else {
                                        fileFolderColor = folderColor;
                                    }
                                    $("#termTextHistory").append("<td><span style='color: " + fileFolderColor + " margin-right: 30px;'>" + searchFSLevel[fs] + "</span></td>");
                                    if (findRowsCols(searchFSLevel.length)[0].includes(fs)) {
                                        $("#termTextHistory").append("</tr><tr>");
                                    }
                                }
                            } else {
                                $("#termTextHistory").append("<td>Improper arguments or non existing directory</td>");
                            }
                            $("#termTextHistory").append("</tr></table></div>");
                        }
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "mkdir":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (fileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>mkdir failed: " + commandArray[1].trim() + " is not a directory but a file!</div>");
                        } else if (! mkdir(termDirectory.trim(), commandArray[1].trim())[0]) {
                            $("#termTextHistory").append("<div>mkdir failed: " + mkdir(termDirectory.trim(), commandArray[1].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "rmdir":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (fileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>rmdir failed: " + commandArray[1].trim() + " is not a directory but a file!</div>");
                        } else if (pathChildren(commandArray[1].trim())[0]) {
                            $("#termTextHistory").append("<div>rmdir failed: Directory " + commandArray[1].trim() + " is not empty. Please remove the contents first!</div>");
                        } else if (! rmdir(termDirectory.trim(), commandArray[1].trim())[0]) {
                            $("#termTextHistory").append("<div>rmdir failed: " + rmdir(termDirectory.trim(), commandArray[1].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "rm":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! fileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>rm failed: " + commandArray[1].trim() + " is either not a file or a non-supporting file!</div>");
                        } else if (! rmfile(termDirectory.trim(), commandArray[1].trim())[0]) {
                            $("#termTextHistory").append("<div>rm failed: " + rmfile(termDirectory.trim(), commandArray[1].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2), or command has unknown rm argument(s).</div>");
                    }
                    break;
                case "touch":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! touchFileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>touch failed: " + commandArray[1].trim() + " is either a folder or a non-supporting type of file!</div>");
                        } else if (! touch(termDirectory.trim(), commandArray[1].trim())[0]) {
                            $("#termTextHistory").append("<div>touch failed: " + touch(termDirectory.trim(), commandArray[1].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "cp":
                    if (commandChunkNum == 3) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! fileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>cp failed: " + commandArray[1].trim() + " is either not a file or a non-supporting file!</div>");
                        } else if (! fileTypesArrayNoDot.includes(commandArray[2].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>cp failed: " + commandArray[2].trim() + " is either not a file or a non-supporting file!</div>");
                        } else if (! fileSize(termDirectory.trim(),commandArray[1].trim())[0] ||  fileSize(termDirectory.trim(), commandArray[1].trim())[1] > maxSizeOfFileToMoveCopy) {
                            $("#termTextHistory").append("<div>cp failed: File size (" + bytesConverter(fileSize(termDirectory.trim(), commandArray[1].trim())[1], 2, "file") + ") is greater than the maximum size (" + bytesConverter(maxSizeOfFileToMoveCopy, 2, "file") + ")</div>");
                        } else if (! cpfile(termDirectory.trim(), commandArray[1].trim(), commandArray[2].trim())[0]) {
                            $("#termTextHistory").append("<div>cp failed: " + cpfile(termDirectory.trim(), commandArray[1].trim(), commandArray[2].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (3), or command has unknown rm argument(s).</div>");
                    }
                    break;
                case "mv":
                    if (commandChunkNum == 3) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! fileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>mv failed: " + commandArray[1].trim() + " is either not a file or a non-supporting file!</div>");
                        } else if (! fileTypesArrayNoDot.includes(commandArray[2].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>mv failed: " + commandArray[2].trim() + " is either not a file or a non-supporting file!</div>");
                        } else if (! mvfile(termDirectory.trim(), commandArray[1].trim(), commandArray[2].trim())[0]) {
                            $("#termTextHistory").append("<div>mv failed: " + mvfile(termDirectory.trim(), commandArray[1].trim(), commandArray[2].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2), or command has unknown rm argument(s).</div>");
                    }
                    break;
                case "rename":
                    if (commandChunkNum == 3) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! renamefile(termDirectory.trim(), commandArray[1].trim(), commandArray[2].trim())[0]) {
                            $("#termTextHistory").append("<div>rename failed: " + renamefile(termDirectory.trim(), commandArray[1].trim(), commandArray[2].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2), or command has unknown rm argument(s).</div>");
                    }
                    break;
                case "locate":
                    if (commandChunkNum == 2) {
                        let searchResult = searchKeyword(commandArray[1]);
                        let resultNum = searchResult.length;
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div><table style='width: 100%'>");
                        for (let si = 0, sl = resultNum; si < sl; si++) {
                            $("#termTextHistory").append("<tr><td>" + searchResult[si][0] + "</td><td style='padding-left: 30px;'>" + searchResult[si][1] + "</td></tr>");
                        }
                        $("#termTextHistory").append("</table></div>");
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "echo":
                    const quotesRegExp = /"(\\.|[^"\\])*"/g;
                    const extractContentWithQuotes = termTextAreaValue.match(quotesRegExp)[0];
                    const extractContent = extractContentWithQuotes.slice(1, -1).replaceAll('\\"', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
                    const file = commandArray[commandArray.length - 1];
                    const carrier = commandArray[commandArray.length - 2];
                    if (touchFileTypesArrayNoDot.includes(file.trim().split(".").pop()) && carrier == "&gt;") {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! echo(termDirectory.trim(), extractContent, file.trim())[0]) {
                            $("#termTextHistory").append("<div>echo failed: " + echo(termDirectory.trim(), extractContent, file.trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>echo failed: Improper format of command, or non-supported file</div>");
                    }
                    break;
                case "cat":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! touchFileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>cat failed: " + commandArray[1].trim() + " is either a folder or a non-supporting type of file!</div>");
                        } else {
                            readfile(termDirectory.trim(), commandArray[1].trim());
                        }
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "truncate":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! touchFileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>truncate failed: " + commandArray[1].trim() + " is either a folder or a non-supporting type of file!</div>");
                        } else if (! truncatefile(termDirectory.trim(), commandArray[1].trim())[0]) {
                            $("#termTextHistory").append("<div>truncate failed: " + truncatefile(termDirectory.trim(), commandArray[1].trim())[1] + "</div>");
                        } else {}
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "edit":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (! touchFileTypesArrayNoDot.includes(commandArray[1].trim().split(".").pop())) {
                            $("#termTextHistory").append("<div>edit failed: " + commandArray[1].trim() + " is either a folder or a non-supporting type of file!</div>");
                        } else if (editfileVerify(termDirectory.trim(), commandArray[1].trim())[0]) {
                            $("#termModal").modal("hide");
                            $("#editorModal").modal("show");
                            importSourceFromURL(editfileVerify(termDirectory.trim(), commandArray[1].trim())[1]);
                        } else {
                            $("#termTextHistory").append("<div>edit failed: " + editfileVerify(termDirectory.trim(), commandArray[1].trim())[1] + "</div>");
                        }
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "df":
                    if (commandChunkNum == 1) {
                        const dfReturn = df();
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div><table>");
                        $("#termTextHistory").append("<tr><th>Filesystem</th><th style='padding-left: 20px'>Size</th><th style='padding-left: 20px'>Used</th><th style='padding-left: 20px'>Avail</th><th style='padding-left: 20px'>Use%</th><th style='padding-left: 20px'>Mounted on</th></tr>");
                        $("#termTextHistory").append("<tr><td>LittleFS</td><td style='padding-left: 20px'>" + dfReturn[0] + "</td><td style='padding-left: 20px'>" + dfReturn[1] + "</td><td style='padding-left: 20px'>" + dfReturn[2] + "</td><td style='padding-left: 20px'>" + dfReturn[3] + "</td><td style='padding-left: 20px'>/</td></tr>");
                        $("#termTextHistory").append("<tr><td>SD_MMC</td><td style='padding-left: 20px'>" + dfReturn[5] + "</td><td style='padding-left: 20px'>" + dfReturn[6] + "</td><td style='padding-left: 20px'>" + dfReturn[7] + "</td><td style='padding-left: 20px'>" + dfReturn[8] + "</td><td style='padding-left: 20px'>/sdcard</td></tr>");
                        $("#termTextHistory").append("</table></div>");
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has more arguments: (" + commandChunkNum + ") instead of (1)</div>");
                    }
                    break;
                case "du":
                    if (commandChunkNum == 1) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (du("/")[0]) {
                            const duResult = du("/")[1];
                            $("#termTextHistory").append("<div><table>");
                            $("#termTextHistory").append("<tr><th>Size</th><th style='padding-left: 20px'>Path</th></tr>");
                            for (let drn = 0, drl = duResult.length; drn < drl; drn++) {
                                $("#termTextHistory").append("<tr><td>" + duResult[drn][1] + "</td><td style='padding-left: 20px'>" + duResult[drn][0] + "</td></tr>");
                            }
                            $("#termTextHistory").append("</table></div>");
                        }
                        else {
                            $("#termTextHistory").append("<div>du failed: Server error!</div>");
                        }
                    } else if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        if (pathExists(commandArray[1].trim() || pathExists(commandArray[1].trim() + "/"))) {
                            const duResult = du(commandArray[1].trim())[1];
                            $("#termTextHistory").append("<div><table>");
                            $("#termTextHistory").append("<tr><th>Size</th><th style='padding-left: 20px'>Path</th></tr>");
                            for (let drn = 0, drl = duResult.length; drn < drl; drn++) {
                                $("#termTextHistory").append("<tr><td>" + duResult[drn][1] + "</td><td style='padding-left: 20px'>" + duResult[drn][0] + "</td></tr>");
                            }
                            $("#termTextHistory").append("</table></div>");
                        }
                        else {
                            $("#termTextHistory").append("<div>du failed: Directory/File does not exist</div>");
                        }
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "uname":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        switch (commandArray[1]) {
                            case "-a":
                                $("#termTextHistory").append("<div>" + requestUname("all") + "</div>");
                                break;
                            case "-s":
                                $("#termTextHistory").append("<div>" + requestUname("kernel") + "</div>");
                                break;
                            case "-n":
                                $("#termTextHistory").append("<div>" + requestUname("deviceName") + ".local</div>");
                                break;
                            case "-r":
                                $("#termTextHistory").append("<div>" + requestUname("kernelName") + "</div>");
                                break;
                            case "-v":
                                $("#termTextHistory").append("<div>" + requestUname("kernelVersion") + "</div>");
                                break;
                            case "-m":
                                $("#termTextHistory").append("<div>" + requestUname("coreProcessor") + "</div>");
                                break;
                            case "-p":
                                $("#termTextHistory").append("<div>" + requestUname("coreProcessor") + "</div>");
                                break;
                            case "-i":
                                $("#termTextHistory").append("<div>" + requestUname("coreProcessor") + "</div>");
                                break;
                            case "-o":
                                $("#termTextHistory").append("<div>" + requestUname("osName") + "</div>");
                                break;
                            case "-th":
                                $("#termTextHistory").append("<div>" + bytesConverter(requestUname("totalHeap"), 2, "default") + "</div>");
                                break;
                            case "-uh":
                                $("#termTextHistory").append("<div>" + bytesConverter(requestUname("usedHeap"), 2, "default") + "</div>");
                                break;
                            case "-fh":
                                $("#termTextHistory").append("<div>" + bytesConverter(requestUname("freeHeap"), 2, "default") + "</div>");
                                break;
                            case "-tp":
                                $("#termTextHistory").append("<div>" + bytesConverter(requestUname("totalPsram"), 2, "default") + "</div>");
                                break;
                            case "-up":
                                $("#termTextHistory").append("<div>" + bytesConverter(requestUname("usedPsram"), 2, "default") + "</div>");
                                break;
                            case "-fp":
                                $("#termTextHistory").append("<div>" + bytesConverter(requestUname("freePsram"), 2, "default") + "</div>");
                                break;
                            case "-cm":
                                $("#termTextHistory").append("<div>" + requestUname("chipModel") + "</div>");
                                break;
                            case "-cp":
                                $("#termTextHistory").append("<div>" + requestUname("coreProcessor") + "</div>");
                                break;    
                            case "-cc":
                                $("#termTextHistory").append("<div>" + requestUname("chipCores") + " cores</div>");
                                break;
                            case "-cr":
                                $("#termTextHistory").append("<div>Revision " + requestUname("chipRevision") + "</div>");
                                break;
                            case "-cf":
                                $("#termTextHistory").append("<div>" + requestUname("cpuFrequency") + " MHz</div>");
                                break;
                            case "-sv":
                                $("#termTextHistory").append("<div>" + requestUname("sdkVersion") + "</div>");
                                break;
                            case "-fs":
                                $("#termTextHistory").append("<div>" + bytesConverter(requestUname("flashChipSize"), 2, "default") + "</div>");
                                break;
                            case "-ma":
                                $("#termTextHistory").append("<div>" + requestUname("macAddress") + "</div>");
                                break;
                            case "-bt":
                                $("#termTextHistory").append("<div>" + bootDateTime(requestUname("bootTime")) + "</div>");
                                break;
                            case "-ut":
                                $("#termTextHistory").append("<div>" + upTime(requestUname("bootTime")) + "</div>");
                                break;
                            case "-ct":
                                $("#termTextHistory").append("<div>" + currentDateTime() + "</div>");
                                break;
                            case "-help":
                                $("#termTextHistory").append("<div><table style='width: 100%'>");
                                for (let hfn = 0, hfa = unameHelp.length; hfn < hfa; hfn++) {
                                    $("#termTextHistory").append("<tr><td style='width: 20%'>" + unameHelpSort()[hfn][0] + "</td><td style='width: 40%; padding-right: 20px;'>" + unameHelpSort()[hfn][1] + "</td><td style='width: 40%'>" + unameHelpSort()[hfn][2] + "</td></tr>");
                                }
                                $("#termTextHistory").append("</table></div>");
                                break;
                            default:
                                $("#termTextHistory").append("<div>Unknown uname argument</div>");
                                break;
                        }
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "hostname":
                    if (commandChunkNum == 1) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>http://" + esp32IPDomain + "</div>");
                    } else if (commandChunkNum == 2 && commandArray[1] == "-I") {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>" + esp32IPDomain + "</div>");
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has either more arguments: (" + commandChunkNum + ") instead of (2), or the argument is unknown.</div>");
                    }
                    break;
                case "ping":
                    if (commandChunkNum == 2) {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Command has less or more arguments: (" + commandChunkNum + ") instead of (2)</div>");
                    }
                    break;
                case "reboot":
                    if (commandChunkNum == 1) {
                        esp32Reboot();
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>ESP32 reboot initiated! Please wait 20 seconds...</div>");
                        setTimeout(() => {
                            location.reload();
                        }, "20000");
                    } else {
                        $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                        $("#termTextHistory").append("<div>Unknown reboot argument</div>");
                    }
                    break;
                case "help":
                    $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                    $("#termTextHistory").append("<div><table style='width: 100%'>");
                    for (let hfn = 0, hfa = esp32FSHelp.length; hfn < hfa; hfn++) {
                        $("#termTextHistory").append("<tr><td style='width: 20%'>" + esp32FSHelpSort()[hfn][0] + "</td><td style='width: 40%; padding-right: 20px;'>" + esp32FSHelpSort()[hfn][1] + "</td><td style='width: 40%'>" + esp32FSHelpSort()[hfn][2] + "</td></tr>");
                    }
                    $("#termTextHistory").append("</table></div>");
                    break;
                default:
                    $("#termTextHistory").append("<div>" + prompt.replace(caret, "") + termTextAreaValue + "</div>");
                    $("#termTextHistory").append("<div>Unknown command or command missing arguments</div>");
                    $("#termPromptArea").html(prompt);
                    break;
            }
        }
    });
    $("#termTextArea").keyup(function (e) {
        if (e.key == "Enter") {
            termTextAreaValue = $("#termTextArea").html();
            commandHistory.push(termTextAreaValue.replace("<div><br></div>", ""));
            commandCounter = commandHistory.length;
            $("#termTextArea").html(nonAscii);
            if (cdSuccess) {
                prompt = "<span style='color: " + userColor + "'>" + termActive + termUser + "</span>" + "<span style='color: " + termDirColor + "'>" + termDash + newDirectory + "</span> " + termDivider + "</span>";
            }
        }
    });

    // EDITOR ------------------------------
    // Initialize history
    let editorHistory = [];
    // Set limit of historical entries (More entries => More browser heap)
    let editorHistoryMaxLength = 50;
    // Initialize counter
    let editorHistoryCounter;
    // Initialize absolute path of edit file
    let editFileAbsolutePath;
    // Template for html5 document
    let html5Template = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <title>Document</title>\n</head>\n<body>\n\n</body>\n</html>";
    // Update history with an empty element as the editorGUI is still empty
    updateHistory();

    // TRACK KEYS ON PRESS (All keys on press must be prevented from default action)
    $("#editorGUI").keydown(function (e) {
        // Single key
        if (e.key === "Tab") {
            e.preventDefault();
        }
        // CTRL + SHIFT Modifiers + Key(s)
        if (e.ctrlKey && e.shiftKey && (e.key === "a" || e.key === "A")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "b" || e.key === "B")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "d" || e.key === "D")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "h" || e.key === "H")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "l" || e.key === "L")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "o" || e.key === "O")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "p" || e.key === "P")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "r" || e.key === "R")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "u" || e.key === "U")) {
            e.preventDefault();
        }
        // ALT Modifier + Arrow(s)
        if (e.altKey && e.key === "ArrowLeft") {
            e.preventDefault();
        }
        if (e.altKey && e.key === "ArrowRight") {
            e.preventDefault();
        }
        // CTRL Modifier + Key(s)
        if (e.ctrlKey && (e.key === "y" || e.key === "Y")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "v" || e.key === "V")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "x" || e.key === "X")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
            e.preventDefault();
        }
        // CTRL Modifier + Arrow(s) 
        if (e.ctrlKey && e.key === "ArrowLeft") {
            e.preventDefault();
        }
        if (e.ctrlKey && e.key === "ArrowRight") {
            e.preventDefault();
        }
        if (e.ctrlKey && e.key === "ArrowUp") {
            e.preventDefault();
        }
        if (e.ctrlKey && e.key === "ArrowDown") {
            e.preventDefault();
        }
    });

    // TRACK KEYS ON RELEASE
    $("#editorGUI").keyup(function (e) {
        // Single key
        if (e.key === "Tab") {
            e.preventDefault();
            wrapSelected("", "    ");
        }
        // CTRL + SHIFT Modifiers + Key(s)
        if (e.ctrlKey && e.shiftKey && (e.key === "a" || e.key === "A")) {
            e.preventDefault();
            wrapSelected("<a href=\"\" target=\"\">", "</a>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "b" || e.key === "B")) {
            e.preventDefault();
            wrapSelected("<b>", "</b>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "d" || e.key === "D")) {
            e.preventDefault();
            wrapSelected("<div id=\"\" class=\"\">", "</div>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "h" || e.key === "H")) {
            e.preventDefault();
            wrapSelected("", html5Template);
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I")) {
            e.preventDefault();
            wrapSelected("<i>", "</i>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "l" || e.key === "L")) {
            e.preventDefault();
            wrapSelected("<li>", "</li>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "o" || e.key === "O")) {
            e.preventDefault();
            wrapSelected("<ol>", "</ol>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "p" || e.key === "P")) {
            e.preventDefault();
            wrapSelected("", "<img src=\"\"/>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "r" || e.key === "R")) {
            e.preventDefault();
            wrapSelected("", "<hr/>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
            e.preventDefault();
            wrapSelected("<script>", "</script>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "u" || e.key === "U")) {
            e.preventDefault();
            wrapSelected("<ul>", "</ul>");
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "y" || e.key === "Y")) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === "z" || e.key === "Z")) {
            e.preventDefault();
        }
        // ALT Modifier + Arrow(s)
        if (e.altKey && e.key === "ArrowLeft") {
            e.preventDefault();
        }
        if (e.altKey && e.key === "ArrowRight") {
            e.preventDefault();
            //console.log(editorHistory[editorHistory.length - 1]);
            if (truncatefile("default", editFileAbsolutePath)) {
                if (save("default", editFileAbsolutePath)) {
                    $("#editorGUIFooter").text("Saved buffer successfuly to " + editFileAbsolutePath);
                    $("#editorGUIDate").text("Date: " + new Date($.now()));
                } else {
                    $("#editorGUIFooter").text("Save failed: Could not write the file. Please retry");
                    $("#editorGUIDate").text("Date: " + new Date($.now()));
                }
            }
            else {
                $("#editorGUIFooter").text("Save failed: Could not truncate the file. Please retry");
                $("#editorGUIDate").text("Date: " + new Date($.now()));
            }
        }
        // CTRL Modifier + Key(s)
        if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "v" || e.key === "V")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "x" || e.key === "X")) {
            e.preventDefault();
        }
        if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
            e.preventDefault();
        }
        // CTRL Modifier + Arrow(s) 
        if (e.ctrlKey && e.key === "ArrowLeft") {
            e.preventDefault();
            if (editorHistoryCounter == editorHistory.length) {
                editorHistoryCounter -= 1; // Only the first time (when the counter is equal to the array length)
                $("#editorGUIFooter").text("");
                $("#editorGUIDate").text("");
            }
            if (editorHistory.length > 0 && editorHistoryCounter > 0) {
                editorHistoryCounter -= 1; // To access the previous historical entry
                $("#editorGUIFooter").text("");
                $("#editorGUIDate").text("");
            }
            else {
                editorHistoryCounter = 0; // Set the counter to zero if counter goes below zero
            }
            // Update editorGUI (text not html) with the historical entry
            $("#editorGUI").text(editorHistory[editorHistoryCounter]);
            $("#editorGUIFooter").text("");
            $("#editorGUIDate").text("");
        }
        if (e.ctrlKey && e.key === "ArrowRight") {
            e.preventDefault();
            if (editorHistory.length >= 0 && editorHistoryCounter < editorHistory.length - 1) {
                editorHistoryCounter += 1; // To access the next historical entry
                $("#editorGUIFooter").text("");
                $("#editorGUIDate").text("");
            }
            else {
                editorHistoryCounter = editorHistory.length - 1; // Set the counter to the maximum allowable number (When historical counter reaches the array length -1)
                $("#editorGUIFooter").text("");
                $("#editorGUIDate").text("");
            }
            // Update editorGUI (text not html) with the historical entry
            $("#editorGUI").text(editorHistory[editorHistoryCounter]);
            $("#editorGUIFooter").text("");
            $("#editorGUIDate").text("");
        }
        if (e.ctrlKey && e.key === "ArrowUp") {
            e.preventDefault();
        }
        if (e.ctrlKey && e.key === "ArrowDown") {
            e.preventDefault();
        }
        // Filter and update the history (When the user did not select to retrieve the historical elements)
        if (e.key != "ArrowLeft" && e.key != "ArrowRight" && e.key != "ArrowUp" && e.key != "ArrowDown" && e.key != "Control") {
            if (editorHistory[editorHistory.length - 1] != $("#editorGUI").html()
                .replaceAll("\n", "<div><br></div>")
                .replaceAll("<div><div>", "")
                .replaceAll("</div></div>", "")
                .replaceAll("<div>", "\n")
                .replaceAll("<br>", "")
                .replaceAll("</div>", "")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("<span style=\"font-weight: var(--bs-body-font-weight); text-align: var(--bs-body-text-align);\">", "")
                .replaceAll("</span>", "")) {
                // Shift (editorHistory[n] => editorHistoryyy[n-1]) the historical entries if the limit has been achieved
                if (editorHistory.length == editorHistoryMaxLength) {
                    editorHistory.shift();
                }
                // Call the updateHistory to collect the editorGUI (html)
                updateHistory();
                editorHistoryCounter = editorHistory.length;
            }
        }
    });

    // Disable the context menu on right click
    $("#editorGUI").contextmenu(function (e) {
        e.preventDefault();
    });

    // Track mouse left and right button
    $("#editorGUI").mouseup(function (e) {
        if (typeof e === "object" && e.button === 0) {
            //console.log("Left click");
            e.preventDefault();
        }
        if (typeof e === "object" && e.button === 2) {
            //console.log("Right click");
            e.preventDefault();
        }
    });

    // Wrapper for tags in form of text
    function wrapSelected(pre, post) {
        let sel, range, selectedText, tagged;
        if (window.getSelection && window.getSelection().rangeCount) {
            sel = window.getSelection();     
            range = sel.getRangeAt(0);          
            selectedText = range.toString();
            range.deleteContents();
            tagged = document.createTextNode(pre + selectedText + post);
            range.insertNode(tagged); 
            range.setStartAfter(tagged);
            range.setEndAfter(tagged); 
            sel.removeAllRanges();
            sel.addRange(range);
        } 
    }

    // History updater
    function updateHistory() {
        const cleanText = $("#editorGUI").html()
            .replaceAll("\n", "<div><br></div>")
            .replaceAll("<div><div>", "")
            .replaceAll("</div></div>", "")
            .replaceAll("<div>", "\n")
            .replaceAll("<br>", "")
            .replaceAll("</div>", "")
            .replaceAll("&amp;", "&")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("<span style=\"font-weight: var(--bs-body-font-weight); text-align: var(--bs-body-text-align);\">", "")
            .replaceAll("</span>", "");
        //$("#code").text(cleanText);
        editorHistory.push(cleanText);
        $("#editorGUIFooter").text("");
        $("#editorGUIDate").text("");
    }

    // URL Source fetcher (async)
    async function importSourceFromURL(url) {
        let fetchData = await fetch(url);
        let data = await fetchData.text();
        $("#editorGUIHeader").text("// Opened file (edit mode): " + url);
        $("#editorGUIHelper").text("// Save buffer: ALT & Right Arrow | History back (" + editorHistoryMaxLength + " steps): CTRL & Left Arrow | History forward: CTRL & Right Arrow");
        $("#editorGUI").text(data);
        editFileAbsolutePath = url;
        updateHistory();
    }

    // Empty history buffer and reset the editorGUI, editorGUIHeader, and editorGUIFooter
    $("#editorCloseButton").click(function() {
        $("#editorGUIHeader").text("");
        $("#editorGUI").text("");
        $("#editorGUIFooter").text("");
        $("#editorGUIDate").text("");
        editorHistory = [""];
        editFileAbsolutePath = "";
    });
});