
// =============================================
// COMRADEHUSTLE - MAIN JAVASCRIPT
// =============================================

// 1. Store demo accounts in memory.
// These accounts reset when the page is refreshed.
// This is for demonstration, not production authentication.
const demoUsers = [];

let selectedRole = "freelancer";
let selectedHirerType = "student";
let currentJobId = null;
let currentMyPostingId = null;
let employerWelcomeMode = "new";
let selectedPaymentProvider = "";
const savedPaymentMethods = [];
let activeMessageThreadId = "judy";
let activeMessageFilter = "all";
let accountNotificationPreferences = {
    messages: true,
    tasks: true,
    tips: false
};

const messageThreads = [
    {
        id: "judy",
        name: "Judy Wanza",
        initials: "JW",
        context: "Campus Event Assistant",
        time: "10:42 AM",
        unread: true,
        messages: [
            { sender: "them", text: "Hi! I saw your post for the campus event assistant role." },
            { sender: "me", text: "Hi Judy, thanks for reaching out. What would you like to know?" },
            { sender: "them", text: "Could you share what time setup starts on Friday?" }
        ]
    },
    {
        id: "evan",
        name: "Evan Gichuhi",
        initials: "EG",
        context: "Poster and Flyer Designer",
        time: "Yesterday",
        unread: false,
        messages: [
            { sender: "them", text: "The poster draft looks great. Could you send the final version by Thursday?" },
            { sender: "me", text: "Absolutely, I will have it ready by then." }
        ]
    },
    {
        id: "oscar",
        name: "Oscar Kiplagat",
        initials: "OK",
        context: "Data Entry Assistant",
        time: "Mon",
        unread: false,
        messages: [
            { sender: "them", text: "I have shared the spreadsheet for the project. Let me know if you have any questions." },
            { sender: "me", text: "Thanks, I can access it. I will get started this afternoon." }
        ]
    }
];

// 2. Sample jobs shown when the website opens.
const sampleJobs = [
    {
        id: 1,
        title: "Campus Event Assistant",
        category: "Events",
        pay: 500,
        location: "Kirinyaga University",
        deadline: "2026-12-15",
        description:
            "Help organize a campus event. Tasks include arranging chairs, " +
            "assisting with registration, welcoming guests and cleaning up.",
        requirements:
            "Be punctual, communicate well and be available on the event day.",
        hirer: "Student Affairs Department",
        email: "events@example.com"
    },
    {
        id: 2,
        title: "Poster and Flyer Designer",
        category: "Creative",
        pay: 800,
        location: "Kirinyaga University",
        deadline: "2026-12-20",
        description:
            "Design promotional posters and digital flyers for a student event.",
        requirements:
            "Basic graphic design skills and the ability to meet deadlines.",
        hirer: "Campus Events Team",
        email: "design@example.com"
    },
    {
        id: 3,
        title: "Data Entry Assistant",
        category: "Technology",
        pay: 400,
        location: "Kirinyaga University",
        deadline: "2026-12-18",
        description:
            "Enter information into a spreadsheet and check the data for errors.",
        requirements:
            "Basic computer skills, attention to detail and familiarity with spreadsheets.",
        hirer: "Student Project Team",
        email: "projects@example.com"
    },
    {
        id: 4,
        title: "Social Media Assistant",
        category: "Marketing",
        pay: 700,
        location: "Kirinyaga University",
        deadline: "2026-12-22",
        description:
            "Help prepare social media posts and promote a student initiative.",
        requirements:
            "Good writing skills, creativity and familiarity with social media.",
        hirer: "Campus Marketing Team",
        email: "marketing@example.com"
    },
    {
        id: 5,
        title: "Computer Setup Assistant",
        category: "Technology",
        pay: 600,
        location: "Kirinyaga University",
        deadline: "2026-12-25",
        description:
            "Help arrange computers and check basic software settings for a workshop.",
        requirements:
            "Basic computer knowledge and a willingness to learn.",
        hirer: "Workshop Coordinator",
        email: "workshop@example.com"
    },
    {
        id: 6,
        title: "Academic Research Assistant",
        category: "Academic",
        pay: 1000,
        location: "Kirinyaga University",
        deadline: "2026-12-28",
        description:
            "Help organize public research materials and format references for a project.",
        requirements:
            "Good research, organization and document formatting skills.",
        hirer: "Student Research Team",
        email: "research@example.com"
    }
];

// 3. Load jobs saved in this browser.
function loadJobs() {
    try {
        const savedJobs = localStorage.getItem("comradeHustleJobs");

        if (savedJobs) {
            const parsedJobs = JSON.parse(savedJobs);

            if (Array.isArray(parsedJobs)) {
                return parsedJobs;
            }
        }
    } catch (error) {
        console.error("Could not load saved jobs:", error);
    }

    return sampleJobs;
}

let jobs = loadJobs();

// Save jobs to this browser.
function saveJobs() {
    try {
        localStorage.setItem("comradeHustleJobs", JSON.stringify(jobs));
    } catch (error) {
        showNotice("Could not save jobs in this browser.");
        console.error("Could not save jobs:", error);
    }
}

// 4. Navigate between website pages.
function showPage(pageId) {
    const user = getCurrentUser();
    if (pageId === "jobs" && user && user.role === "hirer") {
        pageId = "employerWelcome";
    }

    const pages = document.querySelectorAll(".page");
    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
        return;
    }

    const isHirerWorkspace = pageId === "postJob" ||
        pageId === "myPostings" || pageId === "employerWelcome";
    document.body.classList.toggle("is-hirer-workspace", isHirerWorkspace);

    pages.forEach(function (page) {
        page.classList.remove("active");
    });

    targetPage.classList.add("active");

    const accountMenuButton = document.getElementById("accountMenuButton");
    accountMenuButton.disabled = pageId === "login" || pageId === "signup";
    if (accountMenuButton.disabled) {
        closeAccountMenu();
    }

    if (pageId === "jobs") {
        renderJobs();
    }

    if (pageId === "profile") {
        renderProfile();
    }

    if (pageId === "myPostings") {
        renderMyPostings();
    }

    if (pageId === "employerWelcome") {
        renderEmployerWelcome();
    }

    if (pageId === "settings") {
        renderAccountSettings();
        setAccountSettingsTab("personal-info");
    }

    if (pageId === "billing") {
        renderBilling();
        setBillingTab("history");
    }

    if (pageId === "referrals") {
        renderReferralLink();
    }

    if (pageId === "messages") {
        renderMessages();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// 5. Show a temporary message.
let noticeTimer;

function showNotice(message) {
    const notice = document.getElementById("notice");

    notice.textContent = message;
    notice.classList.add("show");

    clearTimeout(noticeTimer);

    noticeTimer = setTimeout(function () {
        notice.classList.remove("show");
    }, 3000);
}

// 6. Select an account role for login or registration.
function selectRole(role) {
    if (role !== "freelancer" && role !== "hirer") {
        return;
    }

    selectedRole = role;

    document.querySelectorAll("[data-role-option]").forEach(function (option) {
        const isSelected = option.dataset.roleOption === role;
        option.classList.toggle("active", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
    });

    document.querySelectorAll(".hirer-type-selector").forEach(function (selector) {
        selector.hidden = role !== "hirer";
    });

    updateAuthFields();
    updateAuthStory();
}

function selectHirerType(type) {
    if (type !== "student" && type !== "department") {
        return;
    }

    selectedHirerType = type;

    document.querySelectorAll("[data-hirer-type-option]").forEach(function (option) {
        const isSelected = option.dataset.hirerTypeOption === type;
        option.classList.toggle("active", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
    });

    updateAuthFields();
}

function forceUppercaseIdentifierInput(inputId) {
    const input = document.getElementById(inputId);

    if (!input || input.dataset.uppercaseBound === "true") {
        return;
    }

    input.dataset.uppercaseBound = "true";
    input.addEventListener("input", function () {
        input.value = input.value.toUpperCase();
    });
}

function updateAuthFields() {
    const isFreelancer = selectedRole === "freelancer";
    const isDepartment = selectedRole === "hirer" &&
        selectedHirerType === "department";
    const studentDetails = document.getElementById("signupStudentDetails");
    const courseInput = document.getElementById("signupCourse");
    const yearInput = document.getElementById("signupYearOfStudy");

    studentDetails.hidden = !isFreelancer;
    courseInput.disabled = !isFreelancer;
    courseInput.required = isFreelancer;
    yearInput.disabled = !isFreelancer;
    yearInput.required = isFreelancer;

    const nameLabel = document.getElementById("signupNameLabel");
    const emailLabel = document.getElementById("signupEmailLabel");
    const identifierLabel = document.getElementById("signupIdentifierLabel");

    nameLabel.textContent = isDepartment ? "Department / Contact Name" : "Full Name";
    emailLabel.textContent = isFreelancer
        ? "Student Email"
        : isDepartment ? "University Email" : "Email Address";
    identifierLabel.textContent = isFreelancer
        ? "Reg No."
        : isDepartment ? "Department / Unit" : "Admission No.";

    document.getElementById("signupName").placeholder = isDepartment
        ? "e.g. Student Affairs Department"
        : "e.g. Nicholas Mwendwa Mutuku";
    document.getElementById("signupEmail").placeholder = isFreelancer
        ? "you.12345@students.kyu.ac.ke"
        : isDepartment ? "office@kyu.ac.ke" : "you@example.com";
    document.getElementById("signupIdentifier").placeholder = isFreelancer
        ? "e.g. PA123/G/12345/25"
        : isDepartment ? "e.g. Student Affairs" : "e.g. PA123/G/12345/25";

    const loginLabel = document.getElementById("loginIdentifierLabel");
    const loginInput = document.getElementById("loginIdentifier");

    loginLabel.textContent = isFreelancer
        ? "Reg No."
        : isDepartment
            ? "University department email"
            : "Admission No.";
    loginInput.placeholder = isFreelancer
        ? "e.g. PA123/G/12345/25"
        : isDepartment
            ? "office@kyu.ac.ke"
            : "e.g. PA123/G/12345/25";

    forceUppercaseIdentifierInput("signupIdentifier");
    forceUppercaseIdentifierInput("loginIdentifier");
}

function updateAuthStory() {
    const heading = selectedRole === "hirer"
        ? "Get your tasks done by talented comrades."
        : "Your next side hustle is one tap away.";
    const description = selectedRole === "hirer"
        ? "Post a short task and reach reliable student helpers around campus."
        : "Tutoring, events, data entry and more — flexible work around your lectures.";

    document.querySelectorAll(".auth-story-heading").forEach(function (element) {
        element.textContent = heading;
    });

    document.querySelectorAll(".auth-story-description").forEach(function (element) {
        element.textContent = description;
    });
}

function chooseFreelancer() {
    showPage("jobs");
}

function chooseHirer() {
    showNotice("Accounts and job posting are unavailable on this static website.");
}

// 7. Account creation is disabled on this static website.
document.getElementById("signupForm").addEventListener("submit", function (event) {
    event.preventDefault();
    showNotice("Account creation is disabled on this static website.");
});

// 8. Account sessions are disabled on this static website.
function setCurrentUser() {
    showNotice("Accounts are disabled on this static website.");
}

function updateRoleNavigation() {
    const user = getCurrentUser();
    const isLoggedIn = Boolean(user);
    document.getElementById("browseJobsButton").hidden =
        isLoggedIn && user.role !== "freelancer";
    document.getElementById("hirerPostJobButton").hidden =
        !isLoggedIn || user.role !== "hirer";
    document.getElementById("accountReferralMenuItem").hidden =
        !isLoggedIn || user.role !== "freelancer";
    document.getElementById("loginNavButton").hidden = false;
    document.getElementById("signupNavButton").hidden = false;
    document.getElementById("accountMenu").hidden = true;
    document.getElementById("accountMenuButton").disabled = true;

    if (user) {
        const initials = user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0);
            })
            .join("")
            .toUpperCase();
        document.getElementById("accountMenuAvatar").textContent = initials;
    } else {
        closeAccountMenu();
    }
}

function toggleAccountMenu() {
    const options = document.getElementById("accountMenuOptions");
    const isExpanded = document.getElementById("accountMenuButton")
        .getAttribute("aria-expanded") === "true";

    options.hidden = isExpanded;
    document.getElementById("accountMenuButton")
        .setAttribute("aria-expanded", String(!isExpanded));
}

function closeAccountMenu() {
    const options = document.getElementById("accountMenuOptions");
    const button = document.getElementById("accountMenuButton");

    options.hidden = true;
    button.setAttribute("aria-expanded", "false");
}

function handleAccountMenuAction(action) {
    closeAccountMenu();

    if (action === "messages") {
        showPage("messages");
        return;
    }

    if (action === "profile") {
        showPage("profile");
        return;
    }

    if (action === "settings") {
        showPage("settings");
        return;
    }

    if (action === "billing") {
        showPage("billing");
        return;
    }

    if (action === "referrals") {
        showPage("referrals");
        return;
    }

    if (action === "help") {
        showPage("help");
        return;
    }

    const labels = {
        help: "Help"
    };
    showNotice(labels[action] + " options are coming soon.");
}

function renderAccountSettings() {
    const user = getCurrentUser();
    const summary = document.getElementById("settingsSummary");
    const actions = document.getElementById("settingsActions");
    const form = document.getElementById("accountSettingsForm");
    const securityForm = document.getElementById("accountSecurityForm");
    const notificationForm = document.getElementById("accountNotificationsForm");

    if (!user) {
        summary.innerHTML = "";
        actions.innerHTML = `<button class="btn btn-primary" type="button" onclick="showPage('login')">Log in</button>`;
        form.hidden = true;
        securityForm.hidden = true;
        notificationForm.hidden = true;
        return;
    }

    form.hidden = false;
    securityForm.hidden = false;
    notificationForm.hidden = false;
    document.getElementById("settingsName").value = user.name || "";
    document.getElementById("settingsEmail").value = user.email || "";
    document.getElementById("settingsPhone").value = user.phone || "";
    document.getElementById("settingsCourse").value = user.course || "Not provided";
    document.getElementById("settingsRegistrationNumber").value =
        user.identifier ? user.identifier.toUpperCase() : "Not provided";
    document.getElementById("settingsYearOfStudy").value = user.yearOfStudy || "Not provided";
    document.getElementById("notifyMessages").checked = accountNotificationPreferences.messages;
    document.getElementById("notifyTasks").checked = accountNotificationPreferences.tasks;
    document.getElementById("notifyTips").checked = accountNotificationPreferences.tips;

    const initials = user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (part) {
            return part.charAt(0);
        })
        .join("")
        .toUpperCase();
    const accountType = user.role === "hirer"
        ? user.hirerType === "department" ? "Department hirer" : "Student hirer"
        : "Freelancer";

    summary.innerHTML = `
        <div class="profile-avatar" aria-hidden="true">${escapeHTML(initials)}</div>
        <h2>${escapeHTML(user.name)}</h2>
        <span class="profile-role">${escapeHTML(accountType)}</span>
    `;
    actions.innerHTML = `<button class="btn btn-outline" type="button" onclick="logout()">Log out</button>`;
}

function setAccountSettingsTab(tab) {
    const tabs = {
        "personal-info": ["settingsPersonalInfoTab", "settingsPersonalInfoPanel"],
        security: ["settingsSecurityTab", "settingsSecurityPanel"],
        notifications: ["settingsNotificationsTab", "settingsNotificationsPanel"],
        verification: ["settingsVerificationTab", "settingsVerificationPanel"]
    };

    if (!Object.prototype.hasOwnProperty.call(tabs, tab)) {
        return;
    }

    Object.keys(tabs).forEach(function (key) {
        const isActive = key === tab;
        const tabButton = document.getElementById(tabs[key][0]);
        const panel = document.getElementById(tabs[key][1]);

        tabButton.classList.toggle("active", isActive);
        tabButton.setAttribute("aria-selected", String(isActive));
        panel.hidden = !isActive;
        panel.classList.toggle("active", isActive);
    });
}

document.getElementById("accountSettingsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotice("Log in to update your account settings.");
        showPage("login");
        return;
    }

    const phone = document.getElementById("settingsPhone").value.trim();

    const updatedUser = Object.assign({}, currentUser, {
        phone: phone
    });
    const demoAccount = demoUsers.find(function (account) {
        return account.id === currentUser.id;
    });
    if (demoAccount) {
        Object.assign(demoAccount, updatedUser);
    }

    setCurrentUser(updatedUser);
    renderAccountSettings();
    showNotice("Account settings saved for this demo session.");
});

document.getElementById("accountSecurityForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const demoAccount = currentUser && demoUsers.find(function (account) {
        return account.id === currentUser.id;
    });

    if (!demoAccount) {
        showNotice("Password changes require an active demo account. Create or log in again after refreshing.");
        return;
    }

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;

    if (currentPassword !== demoAccount.password) {
        showNotice("Your current password is incorrect.");
        return;
    }

    if (newPassword.length < 6 || newPassword !== confirmPassword) {
        showNotice("Enter a new password of at least 6 characters and confirm it.");
        return;
    }

    demoAccount.password = newPassword;
    document.getElementById("accountSecurityForm").reset();
    showNotice("Password updated for this demo session.");
});

document.getElementById("accountNotificationsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    accountNotificationPreferences = {
        messages: document.getElementById("notifyMessages").checked,
        tasks: document.getElementById("notifyTasks").checked,
        tips: document.getElementById("notifyTips").checked
    };
    showNotice("Notification preferences saved for this demo session.");
});

function renderMessages() {
    const activeThread = messageThreads.find(function (thread) {
        return thread.id === activeMessageThreadId;
    });
    if (activeThread) {
        activeThread.unread = false;
    }

    const searchTerm = document.getElementById("messageSearch").value.trim().toLowerCase();
    const filteredThreads = messageThreads.filter(function (thread) {
        const matchesFilter = activeMessageFilter !== "unread" || thread.unread;
        const matchesSearch = (thread.name + " " + thread.context + " " +
            thread.messages.map(function (message) {
                return message.text;
            }).join(" ")).toLowerCase().includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    document.getElementById("messagesCount").textContent =
        messageThreads.length + " conversations";

    const threadList = document.getElementById("messageThreadList");
    threadList.replaceChildren();

    if (filteredThreads.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "messages-empty-list";
        emptyState.textContent = activeMessageFilter === "unread" && !searchTerm
            ? "You are all caught up."
            : "No conversations found.";
        threadList.appendChild(emptyState);
    }

    filteredThreads.forEach(function (thread) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "message-thread";
        button.classList.toggle("active", thread.id === activeMessageThreadId);
        button.setAttribute("aria-current",
            thread.id === activeMessageThreadId ? "true" : "false");
        button.dataset.threadId = thread.id;

        const avatar = document.createElement("span");
        avatar.className = "message-avatar";
        avatar.textContent = thread.initials;

        const copy = document.createElement("span");
        copy.className = "message-thread-copy";
        const name = document.createElement("span");
        name.className = "message-thread-name";
        name.textContent = thread.name;
        const preview = document.createElement("span");
        preview.className = "message-thread-preview";
        preview.textContent = thread.messages[thread.messages.length - 1].text;
        copy.append(name, preview);

        const meta = document.createElement("span");
        meta.className = "message-thread-meta";
        const time = document.createElement("span");
        time.textContent = thread.time;
        meta.appendChild(time);
        if (thread.unread) {
            const unreadMark = document.createElement("span");
            unreadMark.className = "message-unread-mark";
            unreadMark.setAttribute("aria-label", "Unread");
            meta.appendChild(unreadMark);
        }

        button.append(avatar, copy, meta);
        button.addEventListener("click", function () {
            activeMessageThreadId = thread.id;
            thread.unread = false;
            renderMessages();
        });
        threadList.appendChild(button);
    });

    const header = document.getElementById("messageConversationHeader");
    const body = document.getElementById("messageConversationBody");
    const composer = document.getElementById("messageComposer");

    if (!activeThread) {
        header.replaceChildren();
        body.replaceChildren();
        composer.hidden = true;
        return;
    }

    composer.hidden = false;
    const avatar = document.createElement("span");
    avatar.className = "message-avatar message-conversation-avatar";
    avatar.textContent = activeThread.initials;
    const identity = document.createElement("div");
    identity.className = "message-conversation-identity";
    const name = document.createElement("h2");
    name.textContent = activeThread.name;
    const context = document.createElement("p");
    context.textContent = activeThread.context;
    identity.append(name, context);
    header.replaceChildren(avatar, identity);

    body.replaceChildren();
    const dateDivider = document.createElement("div");
    dateDivider.className = "message-date-divider";
    dateDivider.textContent = "Recent messages";
    body.appendChild(dateDivider);

    activeThread.messages.forEach(function (message) {
        const row = document.createElement("div");
        row.className = "message-row " +
            (message.sender === "me" ? "message-row-own" : "message-row-other");
        const bubble = document.createElement("p");
        bubble.className = "message-bubble";
        bubble.textContent = message.text;
        row.appendChild(bubble);
        body.appendChild(row);
    });
    body.scrollTop = body.scrollHeight;
}

function sendMessage(event) {
    event.preventDefault();
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    const activeThread = messageThreads.find(function (thread) {
        return thread.id === activeMessageThreadId;
    });

    if (!text || !activeThread) {
        return;
    }

    activeThread.messages.push({ sender: "me", text: text });
    activeThread.time = "Now";
    activeThread.unread = false;
    input.value = "";
    renderMessages();
    input.focus();
}

document.getElementById("messageSearch").addEventListener("input", renderMessages);
document.querySelectorAll("[data-message-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
        activeMessageFilter = button.dataset.messageFilter;
        document.querySelectorAll("[data-message-filter]").forEach(function (filterButton) {
            const isActive = filterButton === button;
            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });
        renderMessages();
    });
});
document.getElementById("messageComposer").addEventListener("submit", sendMessage);

function renderReferralLink() {
    const user = getCurrentUser();
    const linkInput = document.getElementById("referralLink");

    if (!user || !linkInput) {
        return;
    }

    const source = String(user.id || user.email || user.name);
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
        hash = ((hash << 5) - hash) + source.charCodeAt(index);
        hash |= 0;
    }

    const referralCode = "CH" + Math.abs(hash).toString(36).toUpperCase();
    const referralUrl = new URL(window.location.href);
    referralUrl.searchParams.set("ref", referralCode);
    referralUrl.hash = "";
    linkInput.value = referralUrl.toString();
}

async function copyReferralLink() {
    const linkInput = document.getElementById("referralLink");

    if (!linkInput.value) {
        renderReferralLink();
    }

    if (!navigator.clipboard || !window.isSecureContext) {
        linkInput.focus();
        linkInput.select();
        showNotice("Clipboard access is unavailable. Select and copy your referral link.");
        return;
    }

    try {
        await navigator.clipboard.writeText(linkInput.value);
        showNotice("Referral link copied!");
    } catch (error) {
        console.error("Could not copy the referral link:", error);
        showNotice("Could not copy the referral link. Select and copy it instead.");
        linkInput.focus();
        linkInput.select();
    }
}

async function shareReferralLink() {
    const linkInput = document.getElementById("referralLink");

    if (!linkInput.value) {
        renderReferralLink();
    }

    if (!navigator.share) {
        await copyReferralLink();
        return;
    }

    try {
        await navigator.share({
            title: "Join me on ComradeHustle",
            text: "Find campus opportunities with me on ComradeHustle!",
            url: linkInput.value
        });
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Could not share the referral link:", error);
            showNotice("Could not share the referral link. Try copying it instead.");
        }
    }
}

function getCurrentUser() {
    return null;
}

// 9. Login is disabled on this static website.
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    showNotice("Login is disabled on this static website.");
});

// 10. Show jobs on the dashboard.
function renderJobs() {
    const jobList = document.getElementById("jobList");
    const searchInput = document.getElementById("jobSearch");
    const categorySelect = document.getElementById("categoryFilter");

    const searchTerm = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;

    const filteredJobs = jobs.filter(function (job) {
        const searchableText = [
            job.title,
            job.category,
            job.categoryDisplay,
            job.location,
            job.summary,
            job.description,
            job.hirer
        ].concat(job.tasks || []).join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);
        const matchesCategory =
            category === "all" || job.category === category;

        return matchesSearch && matchesCategory;
    });

    document.getElementById("jobCount").textContent =
        filteredJobs.length + (filteredJobs.length === 1
            ? " opportunity found"
            : " opportunities found");

    if (filteredJobs.length === 0) {
        jobList.innerHTML = `
            <div class="empty-state">
                <h3>No jobs found</h3>
                <p>Try a different search term or category.</p>
            </div>
        `;
        return;
    }

    jobList.innerHTML = filteredJobs.map(function (job) {
        return `
            <article class="job-card">
                <div class="job-icon">${getJobIcon(job.category)}</div>
                <span class="tag">${escapeHTML(job.categoryDisplay || job.category)}</span>
                <h3>${escapeHTML(job.title)}</h3>
                <p class="job-pay">${formatMoney(job.pay)}${job.payType === "hourly"
                    ? " / hour"
                    : job.payType === "daily" ? " / day" : ""}</p>
                <p class="job-description">
                    ${escapeHTML(job.summary || job.description)}
                </p>
                <p class="job-meta">📍 ${escapeHTML(job.location)}</p>
                <p class="job-meta">🏢 ${escapeHTML(job.hirer)}</p>
                <p class="job-meta">📅 Deadline: ${escapeHTML(job.deadline)}</p>
                <button class="btn btn-primary"
                        onclick="viewJob(${Number(job.id)})">
                    View Job Details
                </button>
            </article>
        `;
    }).join("");
}

// 11. Search and filter jobs as the user types.
document.getElementById("jobSearch")
    .addEventListener("input", renderJobs);

document.getElementById("categoryFilter")
    .addEventListener("change", renderJobs);

// 12. Open a specific job description.
function viewJob(jobId) {
    const job = jobs.find(function (item) {
        return item.id === jobId;
    });

    if (!job) {
        showNotice("This job could not be found.");
        return;
    }

    currentJobId = jobId;
    const user = getCurrentUser();
    const contactPhone = normalizePhoneForContact(job.whatsapp || job.phone);
    const callPhone = normalizePhoneForContact(job.phone);
    const emailHref = getApplicationEmailHref(job, user);
    const phoneContactLinks = contactPhone
        ? `
            <p class="hirer-phone">☎ ${escapeHTML(job.phone || job.whatsapp)}</p>
            <a class="btn btn-primary contact-link"
               href="https://wa.me/${contactPhone}?text=${encodeURIComponent(
                   "Hello " + job.hirer + ", I am interested in your job listing: " +
                   job.title + "."
               )}"
               target="_blank" rel="noopener noreferrer"
               onclick="return canContactHirer()">
                WhatsApp
            </a>
            ${callPhone ? `
            <a class="btn btn-outline contact-link"
               href="tel:+${callPhone}"
               onclick="return canContactHirer()">
               Call
            </a>` : ""}
        `
        : '<p class="muted">Phone and WhatsApp contact details were not provided.</p>';

    document.getElementById("jobDetailsContent").innerHTML = `
        <div class="details-layout">
            <article class="details-card">
               <span class="tag">${escapeHTML(job.categoryDisplay || job.category)}</span>
               <h2>${escapeHTML(job.title)}</h2>
               <p class="job-pay">${formatMoney(job.pay)}${job.payType === "hourly"
                   ? " / hour"
                   : job.payType === "daily" ? " / day" : ""}</p>

               <p class="job-meta">📍 ${escapeHTML(job.location)}</p>
               <p class="job-meta">📅 Deadline: ${escapeHTML(job.deadline)}</p>
               ${job.openings ? `<p class="job-meta">👥 ${escapeHTML(job.openings)} opening${job.openings === 1 ? "" : "s"}</p>` : ""}
               ${job.duration ? `<p class="job-meta">⏱ ${escapeHTML(job.duration)}</p>` : ""}
               ${job.schedule ? `<p class="job-meta">🗓 ${escapeHTML(job.schedule)}</p>` : ""}

               ${job.summary ? `<p class="job-summary">${escapeHTML(job.summary)}</p>` : ""}
               <h3>Job Description</h3>
               <p>${escapeHTML(job.description)}</p>
               ${Array.isArray(job.tasks) && job.tasks.length ? `
                   <h3>What you'll do</h3>
                   <ul class="job-task-details">
                       ${job.tasks.map(function (task) {
                           return `<li>${escapeHTML(task)}</li>`;
                       }).join("")}
                   </ul>
               ` : ""}

               <h3>Requirements</h3>
               <p>${escapeHTML(job.requirements || "No specific requirements.")}</p>
               ${job.meetingPoint ? `<p class="job-meta">Meeting point: ${escapeHTML(job.meetingPoint)}</p>` : ""}
               ${job.bestTime ? `<p class="job-meta">Best time to reach: ${escapeHTML(job.bestTime)}</p>` : ""}
               ${job.preferredContact ? `<p class="job-meta">Preferred contact: ${escapeHTML(job.preferredContact)}</p>` : ""}

               <button class="btn btn-primary" onclick="applyForJob()">
                    Contact Hirer to Apply
                </button>
            </article>

            <aside class="hirer-card">
                <h3>About the Hirer</h3>
                <p><strong>${escapeHTML(job.hirer)}</strong></p>
                <p class="muted">
                    Job poster on ComradeHustle
                </p>

                <h3>Contact Information</h3>
                <a class="hirer-email"
                   href="${escapeHTML(emailHref)}"
                   onclick="return canContactHirer()">
                    ✉ ${escapeHTML(job.email)}
                </a>
                ${phoneContactLinks}

                <button class="btn btn-primary"
                        onclick="applyForJob()">
                    Contact Hirer
                </button>
            </aside>
        </div>
    `;

    showPage("jobDetails");
}

function canContactHirer() {
    const user = getCurrentUser();
    if (!user) {
        showNotice("Please sign up or log in before contacting a hirer.");
        showPage("login");
        return false;
    }

    if (user.role !== "freelancer") {
        showNotice("Only freelancer accounts can apply for jobs.");
        return false;
    }

    return true;
}

function getApplicationEmailHref(job, user) {
    const subject = encodeURIComponent("Job application: " + job.title);
    const body = encodeURIComponent(
        "Hello " + job.hirer + ",\n\n" +
        "I am interested in your job listing: " + job.title + ".\n" +
        (user ? "My name is " + user.name + ".\n" : "") +
        "Please share more information about the opportunity.\n\n" +
        "Thank you."
    );

    return "mailto:" + encodeURIComponent(job.email).replace(/%40/gi, "@") +
        "?subject=" + subject + "&body=" + body;
}

function normalizePhoneForContact(phone) {
    let digits = String(phone || "").replace(/\D/g, "");

    if (digits.startsWith("0")) {
        digits = "254" + digits.slice(1);
    } else if (digits.length === 9 && /^[17]/.test(digits)) {
        digits = "254" + digits;
    }

    return digits.length >= 8 && digits.length <= 15 ? digits : "";
}

// 13. Contact the hirer using the user's email application.
function applyForJob() {
    const job = jobs.find(function (item) {
        return item.id === currentJobId;
    });

    if (!job) {
        showNotice("Please select a job first.");
        return;
    }

    if (!canContactHirer()) {
        return;
    }

    window.location.href = getApplicationEmailHref(job, getCurrentUser());
}

// 14. Open the job posting page.
function openPostJob() {
    const user = getCurrentUser();

    if (!user) {
        showNotice("Please sign up or log in as a hirer first.");
        selectRole("hirer");
        showPage("signup");
        return;
    }

    if (user.role !== "hirer") {
        showNotice("Please use a hirer account to post jobs.");
        return;
    }

    const today = new Date();
    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);
    const deadlineInput = document.getElementById("jobDeadline");
    deadlineInput.min = localToday;
    document.getElementById("jobEmail").value =
        document.getElementById("jobEmail").value || user.email || "";
    document.getElementById("jobPhone").value =
        document.getElementById("jobPhone").value || user.phone || "";
    document.getElementById("jobWhatsapp").value =
        document.getElementById("jobWhatsapp").value || user.phone || "";
    document.getElementById("postJobSidebarName").textContent =
        user.name || "Your account";
    updateHirerPostingCount(user);

    showPage("postJob");
    updatePostJobPreview();
}

function openMyPostings() {
    const user = getCurrentUser();

    if (!user) {
        showNotice("Please sign up or log in as a hirer first.");
        selectRole("hirer");
        showPage("signup");
        return;
    }

    if (user.role !== "hirer") {
        showNotice("Please use a hirer account to view your postings.");
        return;
    }

    showPage("myPostings");
}

function updateHirerPostingCount(user) {
    const userEmail = String(user.email || "").trim().toLowerCase();
    const postingCount = jobs.filter(function (job) {
        const ownerEmail = job.hirerEmail || job.email;
        return userEmail && String(ownerEmail || "").trim().toLowerCase() === userEmail;
    }).length;
    const countLabels = [
        document.getElementById("postJobPostingsCount"),
        document.getElementById("myPostingsNavCount"),
        document.getElementById("myPostingsTotal")
    ];

    countLabels.forEach(function (label) {
        label.textContent = String(postingCount);
    });
}

function getUserInitials(user) {
    const name = String(user.name || "").trim();

    return name
        ? name.split(/\s+/).slice(0, 2).map(function (part) {
            return part.charAt(0);
        }).join("").toUpperCase()
        : "CH";
}

function renderMyPostings() {
    const user = getCurrentUser();
    const postingList = document.getElementById("myPostingsList");
    const applicantsPanel = document.getElementById("myPostingApplicants");

    if (!user || user.role !== "hirer") {
        postingList.innerHTML = `
            <div class="my-postings-empty">
                <h3>Sign in as a hirer to view your tasks</h3>
                <button class="btn btn-primary" type="button" onclick="openMyPostings()">
                    Log in as a hirer
                </button>
            </div>
        `;
        applicantsPanel.innerHTML = "";
        return;
    }

    const userEmail = String(user.email || "").trim().toLowerCase();
    const userJobs = jobs.filter(function (job) {
        const ownerEmail = job.hirerEmail || job.email;
        return userEmail && String(ownerEmail || "").trim().toLowerCase() === userEmail;
    });

    updateHirerPostingCount(user);
    document.getElementById("myPostingsSidebarName").textContent =
        user.name || "Your account";
    document.getElementById("myPostingsSidebarAvatar").textContent =
        getUserInitials(user);

    if (!userJobs.some(function (job) {
        return Number(job.id) === Number(currentMyPostingId);
    })) {
        currentMyPostingId = userJobs.length ? Number(userJobs[0].id) : null;
    }

    if (userJobs.length === 0) {
        postingList.innerHTML = `
            <div class="my-postings-empty">
                <span class="my-postings-empty-icon" aria-hidden="true">▤</span>
                <h3>No tasks posted yet</h3>
                <p>Your tasks will appear here after you publish them.</p>
                <button class="btn btn-primary" type="button" onclick="openPostJob()">
                    <span aria-hidden="true">＋</span> Post a task
                </button>
            </div>
        `;
        applicantsPanel.innerHTML = `
            <div class="my-applicants-empty">
                <span aria-hidden="true">✦</span>
                <h2>Applicants will appear here</h2>
                <p>Once you post a task, you can review its details here. Applications are coordinated directly with you in this demo.</p>
            </div>
        `;
        return;
    }

    postingList.innerHTML = userJobs.map(function (job) {
        const jobId = Number(job.id);
        const isSelected = jobId === currentMyPostingId;
        const openings = Number(job.openings) > 0 ? Number(job.openings) : 1;
        const deadline = job.deadline
            ? new Date(job.deadline + "T00:00:00").toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
                year: "numeric"
            })
            : "No deadline";
        const postedAt = job.createdAt
            ? new Date(job.createdAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
                year: "numeric"
            })
            : Number.isFinite(jobId) && jobId > 1000000000000
                ? new Date(jobId).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
                : "Date not available";
        const payType = job.payType === "hourly"
            ? "per hour"
            : job.payType === "daily" ? "per day" : "fixed";

        return `
            <button type="button"
                    class="my-posting-row${isSelected ? " selected" : ""}"
                    data-my-posting-id="${jobId}"
                    aria-pressed="${isSelected}">
                <span class="my-posting-row-main">
                    <strong>${escapeHTML(job.title)}</strong>
                    <small>Posted ${escapeHTML(postedAt)} · Apply by ${escapeHTML(deadline)} · ${openings} ${openings === 1 ? "place" : "places"}</small>
                </span>
                <span class="my-posting-row-pay">
                    <strong>${formatMoney(job.pay)}</strong>
                    <small>${escapeHTML(payType)}</small>
                </span>
                <span class="my-posting-row-arrow" aria-hidden="true">›</span>
            </button>
        `;
    }).join("");

    const selectedJob = userJobs.find(function (job) {
        return Number(job.id) === currentMyPostingId;
    }) || userJobs[0];
    renderMyPostingApplicants(selectedJob);
}

function renderMyPostingApplicants(job) {
    const panel = document.getElementById("myPostingApplicants");
    const openings = Number(job.openings) > 0 ? Number(job.openings) : 1;

    panel.innerHTML = `
        <div class="my-applicants-heading">
            <p class="eyebrow">TASK OVERVIEW</p>
            <h2>Applicants for</h2>
            <h3>${escapeHTML(job.title)}</h3>
            <div class="my-applicants-summary">
                <span>0 of ${openings} ${openings === 1 ? "place" : "places"} filled</span>
                <button type="button" class="my-view-task-link"
                        onclick="viewJob(${Number(job.id)})">View task page</button>
            </div>
        </div>
        <div class="my-applicants-empty">
            <span aria-hidden="true">✉</span>
            <h2>No applicants to review yet</h2>
            <p>Comrades can contact you using the details on your task page. Applications are not tracked in this demo.</p>
        </div>
    `;
}

function selectMyPosting(jobId) {
    const parsedId = Number(jobId);

    if (!Number.isFinite(parsedId)) {
        showNotice("This posting could not be found.");
        return;
    }

    currentMyPostingId = parsedId;
    renderMyPostings();
}

document.getElementById("myPostingsList").addEventListener("click", function (event) {
    const postingButton = event.target.closest("[data-my-posting-id]");

    if (postingButton) {
        selectMyPosting(postingButton.dataset.myPostingId);
    }
});

function showEmployerWelcome(mode) {
    employerWelcomeMode = mode;
    showPage("employerWelcome");
}

function renderEmployerWelcome() {
    const user = getCurrentUser();
    const content = document.getElementById("employerWelcomeContent");

    if (!user || user.role !== "hirer") {
        content.innerHTML = `
            <div class="employer-welcome-empty">
                <h1>Sign in as a hirer to continue</h1>
                <p>Create a hirer account or log in to manage campus tasks.</p>
                <button class="btn btn-primary" type="button" onclick="chooseHirer()">
                    Continue as a hirer
                </button>
            </div>
        `;
        return;
    }

    const userEmail = String(user.email || "").trim().toLowerCase();
    const userJobs = jobs.filter(function (job) {
        const ownerEmail = job.hirerEmail || job.email;
        return userEmail && String(ownerEmail || "").trim().toLowerCase() === userEmail;
    });
    const today = new Date();
    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);
    const activeJobs = userJobs.filter(function (job) {
        return !job.deadline || job.deadline >= localToday;
    });
    const openPlaces = activeJobs.reduce(function (total, job) {
        const places = Number(job.openings);
        return total + (Number.isInteger(places) && places > 0 ? places : 1);
    }, 0);
    const listedBudget = activeJobs.reduce(function (total, job) {
        const pay = Number(job.pay);
        const places = Number(job.openings);
        return total + (Number.isFinite(pay) && pay > 0
            ? pay * (Number.isInteger(places) && places > 0 ? places : 1)
            : 0);
    }, 0);
    const firstName = String(user.name || "").trim().split(/\s+/)[0] || "Comrade";
    const initials = getUserInitials(user);
    const greeting = employerWelcomeMode === "new"
        ? `Karibu, ${escapeHTML(firstName)}. What do you need done?`
        : `Welcome back, ${escapeHTML(firstName)}.`;
    const recentTasks = userJobs.slice(0, 3).map(function (job) {
        const places = Number(job.openings) > 0 ? Number(job.openings) : 1;
        const postedDate = job.createdAt
            ? new Date(job.createdAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short"
            })
            : "Recently";

        return `
            <button type="button" class="employer-recent-task"
                    onclick="openMyPostingById(${Number(job.id)})">
                <span class="employer-recent-icon" aria-hidden="true">${escapeHTML(getJobIcon(job.category))}</span>
                <span class="employer-recent-copy">
                    <strong>${escapeHTML(job.title)}</strong>
                    <small>${escapeHTML(postedDate)} · ${places} ${places === 1 ? "place" : "places"}</small>
                </span>
                <span class="employer-recent-pay">${formatMoney(job.pay)}</span>
            </button>
        `;
    }).join("");

    updateHirerPostingCount(user);

    const navigation = `
        <header class="employer-welcome-nav">
            <a href="#" class="post-job-brand"
               onclick="showPage('landing'); return false;">Comrade<span>Hustle</span></a>
            <p>KIRINYAGA UNIVERSITY · KUTUS</p>
            <div class="employer-welcome-nav-actions">
                <button type="button" onclick="openMyPostings()">My postings
                    <span>${userJobs.length}</span>
                </button>
                <button type="button" class="employer-welcome-profile"
                        onclick="showPage('profile')" aria-label="Open profile for ${escapeHTML(user.name)}">
                    ${initials}
                </button>
            </div>
        </header>
    `;

    if (employerWelcomeMode === "new") {
        content.innerHTML = `
            <div class="employer-welcome-shell employer-welcome-new">
                ${navigation}
                <main>
                    <section class="employer-welcome-hero">
                        <div class="employer-welcome-copy">
                            <span class="employer-welcome-kicker"><span></span> YOUR CAMPUS, YOUR COMRADE</span>
                            <h1>${greeting}</h1>
                            <p>Post a short task and get help from fellow comrades who want to earn between lectures. Set the pay, share the details, and connect directly.</p>
                            <div class="employer-welcome-actions">
                                <button class="btn btn-primary" type="button" onclick="openPostJob()">
                                    <span aria-hidden="true">＋</span> Post a Job
                                </button>
                            </div>
                        </div>
                        <div class="employer-welcome-art" aria-label="Illustration of a campus task card">
                            <span class="employer-art-orbit employer-art-orbit-one"></span>
                            <span class="employer-art-orbit employer-art-orbit-two"></span>
                            <span class="employer-art-spark employer-art-spark-one">✦</span>
                            <span class="employer-art-spark employer-art-spark-two">✳</span>
                            <div class="employer-art-note employer-art-note-top">A little help goes a long way</div>
                            <article class="employer-art-task">
                                <div class="employer-art-task-top"><span>✦</span><span>NEW CAMPUS TASK</span><span>•••</span></div>
                                <span class="employer-art-task-category">CAMPUS · FLEXIBLE</span>
                                <strong>Something needs doing?</strong>
                                <p>Find a comrade with the right skills.</p>
                                <div class="employer-art-task-bottom"><span>✦ Student-ready</span><span class="employer-art-task-cta">Post yours →</span></div>
                            </article>
                            <div class="employer-art-avatar employer-art-avatar-one">J</div>
                            <div class="employer-art-avatar employer-art-avatar-two">M</div>
                            <div class="employer-art-note employer-art-note-bottom"><strong>Made for campus</strong><span>Real people. Flexible help.</span></div>
                        </div>
                    </section>

                    <section class="employer-welcome-next" aria-labelledby="employer-next-heading">
                        <div class="employer-section-heading">
                            <div><p class="eyebrow">SIMPLE FROM THE START</p><h2 id="employer-next-heading">What happens next</h2></div>
                            <span class="employer-time-note">About 3 minutes to post</span>
                        </div>
                        <div class="employer-welcome-steps">
                            <article><span class="employer-step-number">01</span><span class="employer-step-icon">＋</span><h3>Post your task</h3><p>Describe the job, set the pay and choose how comrades contact you.</p></article>
                            <article><span class="employer-step-number">02</span><span class="employer-step-icon">✉</span><h3>Comrades reach out</h3><p>Students see your task in their feed and contact you directly to apply.</p></article>
                            <article><span class="employer-step-number">03</span><span class="employer-step-icon">✓</span><h3>Pick and pay</h3><p>Agree on the details together, then pay your comrade when the work is done.</p></article>
                        </div>
                    </section>

                    <section class="employer-task-ideas" aria-labelledby="employer-ideas-heading">
                        <div class="employer-section-heading">
                            <div><p class="eyebrow">NEED A STARTING POINT?</p><h2 id="employer-ideas-heading">Popular campus tasks</h2></div>
                            <span class="employer-ideas-caption">Choose an idea and make it your own</span>
                        </div>
                        <div class="employer-idea-grid">
                            <button type="button" class="employer-idea-card" onclick="startTaskTemplate('library')">
                                <span class="employer-idea-icon idea-library">▤</span><span class="employer-idea-meta">CAMPUS SUPPORT</span><strong>Library shelving assistant</strong><small>Organise books and help keep study spaces ready.</small><span class="employer-idea-cta">Use this idea <b>→</b></span>
                            </button>
                            <button type="button" class="employer-idea-card" onclick="startTaskTemplate('research')">
                                <span class="employer-idea-icon idea-research">✎</span><span class="employer-idea-meta">ACADEMICS</span><strong>Type &amp; format a project</strong><small>Find help with document layout and careful formatting.</small><span class="employer-idea-cta">Use this idea <b>→</b></span>
                            </button>
                            <button type="button" class="employer-idea-card" onclick="startTaskTemplate('event')">
                                <span class="employer-idea-icon idea-event">✦</span><span class="employer-idea-meta">EVENTS</span><strong>Event ushers</strong><small>Welcome guests and help your campus event run smoothly.</small><span class="employer-idea-cta">Use this idea <b>→</b></span>
                            </button>
                        </div>
                    </section>
                </main>
                <footer class="employer-welcome-footer"><span>✦</span> Your campus community is ready to lend a hand.</footer>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div class="employer-welcome-shell employer-welcome-returning">
            ${navigation}
            <main>
                <section class="employer-returning-hero">
                    <div class="employer-returning-copy">
                        <span class="employer-welcome-kicker"><span></span> YOUR HIRING DASHBOARD</span>
                        <h1>${greeting}</h1>
                        <p>Pick up where you left off. Review your campus tasks, check the details, or post something new.</p>
                        <button class="btn btn-primary" type="button" onclick="openPostJob()">
                            <span aria-hidden="true">＋</span> Post a task
                        </button>
                    </div>
                    <div class="employer-returning-highlight">
                        <span class="employer-highlight-orb"></span>
                        <span class="employer-highlight-icon">✦</span>
                        <p>Good work starts with a clear task.</p>
                        <small>Simple details help the right comrade find you.</small>
                    </div>
                </section>

                <section class="employer-metrics" aria-label="Your hiring overview">
                    <article class="employer-metric-card"><span class="employer-metric-icon metric-green">▤</span><span class="employer-metric-value">${activeJobs.length}</span><span class="employer-metric-label">Active tasks</span><small>${userJobs.length} total posted</small></article>
                    <article class="employer-metric-card"><span class="employer-metric-icon metric-gold">◎</span><span class="employer-metric-value">${openPlaces}</span><span class="employer-metric-label">Open places</span><small>Across active tasks</small></article>
                    <article class="employer-metric-card"><span class="employer-metric-icon metric-lilac">KSh</span><span class="employer-metric-value">${formatMoney(listedBudget)}</span><span class="employer-metric-label">Listed budgets</span><small>Based on your active posts</small></article>
                </section>

                <section class="employer-returning-grid">
                    <div class="employer-recent-panel">
                        <div class="employer-section-heading">
                            <div><p class="eyebrow">YOUR CAMPUS TASKS</p><h2>Recent postings</h2></div>
                            <button type="button" class="employer-text-link" onclick="openMyPostings()">View all <span aria-hidden="true">→</span></button>
                        </div>
                        ${userJobs.length
                            ? `<div class="employer-recent-list">${recentTasks}</div>`
                            : `<div class="employer-no-posts"><span>✦</span><h3>Your next task starts here</h3><p>Post a campus task and it will appear in this list.</p><button class="btn btn-primary" type="button" onclick="openPostJob()">Create your first task</button></div>`
                        }
                    </div>
                    <aside class="employer-contact-card">
                        <span class="employer-contact-icon">✉</span>
                        <p class="eyebrow">A QUICK NOTE</p>
                        <h2>Stay connected</h2>
                        <p>Applications are not collected in this demo. Comrades use the contact details on each task to reach you directly.</p>
                        <button type="button" class="employer-text-link" onclick="handleAccountMenuAction('messages')">Open messages <span aria-hidden="true">→</span></button>
                    </aside>
                </section>
            </main>
            <footer class="employer-welcome-footer"><span>✦</span> Thanks for making campus life work better, together.</footer>
        </div>
    `;
}

function startTaskTemplate(templateId) {
    const templates = {
        library: {
            title: "Library shelving assistant",
            category: "Other",
            categoryLabel: "Campus support",
            summary: "Help organise returned books and keep library shelves tidy.",
            description: "Assist with shelving returned books and keeping the study area organised. The hirer will share the exact timing and instructions.",
            tasks: ["Sort and return books to the correct shelves", "Keep the nearby study area tidy"]
        },
        research: {
            title: "Type and format a research project",
            category: "Academic",
            categoryLabel: "Academics",
            summary: "Help format a research document and check its layout.",
            description: "Help organise and format a research project document. The hirer will provide the draft, formatting guide and agreed deadline.",
            tasks: ["Apply consistent headings and page layout", "Check spacing, page numbers and references"]
        },
        event: {
            title: "Event ushers for a campus fair",
            category: "Events",
            categoryLabel: "Events",
            summary: "Welcome guests and guide them around a campus event.",
            description: "Support a campus event by welcoming attendees and helping them find the right rooms. Event timing and instructions will be confirmed with the hirer.",
            tasks: ["Welcome and register arriving guests", "Give directions and assist the event team"]
        }
    };
    const template = templates[templateId];

    if (!template) {
        showNotice("That task template could not be found.");
        return;
    }

    openPostJob();

    if (!document.getElementById("postJob").classList.contains("active")) {
        return;
    }

    document.getElementById("jobTitle").value = template.title;
    document.getElementById("jobSummary").value = template.summary;
    document.getElementById("jobDescription").value = template.description;
    document.getElementById("jobLocation").value = "Kirinyaga University";
    document.getElementById("jobDuration").value = "";
    document.getElementById("jobPay").value = "";
    document.getElementById("jobDeadline").value = "";
    document.getElementById("jobRequirements").innerHTML = `
        <div class="post-job-list-item">
            <span aria-hidden="true">•</span>
            <input type="text" class="job-requirement-input"
                   aria-label="Required skill or qualification"
                   placeholder="e.g. Own laptop with Microsoft Word">
            <button type="button" class="post-job-remove"
                    aria-label="Remove requirement">×</button>
        </div>
    `;
    const categoryButton = Array.from(
        document.querySelectorAll(".post-job-category")
    ).find(function (button) {
        return button.dataset.categoryLabel === template.categoryLabel;
    });
    selectPostJobCategory(categoryButton);

    const taskList = document.getElementById("jobTasks");
    taskList.innerHTML = "";
    template.tasks.forEach(function (task, index) {
        const item = document.createElement("div");
        item.className = "post-job-list-item";
        const bullet = document.createElement("span");
        bullet.setAttribute("aria-hidden", "true");
        bullet.textContent = "•";
        const input = document.createElement("input");
        input.type = "text";
        input.className = "job-task-input";
        input.setAttribute("aria-label", "Task to be completed " + (index + 1));
        input.value = task;
        input.required = true;
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "post-job-remove";
        removeButton.setAttribute("aria-label", "Remove task");
        removeButton.textContent = "×";
        item.append(bullet, input, removeButton);
        taskList.append(item);
    });

    updatePostJobPreview();
    document.getElementById("jobPay").focus();
}

function openMyPostingById(jobId) {
    currentMyPostingId = Number(jobId);
    openMyPostings();
}

function selectPostJobCategory(button) {
    document.querySelectorAll(".post-job-category").forEach(function (option) {
        const isSelected = option === button;
        option.classList.toggle("active", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
    });

    document.getElementById("jobCategory").value = button.dataset.category;
    updatePostJobPreview();
}

function addPostJobListItem(listId, kind) {
    const list = document.getElementById(listId);
    const item = document.createElement("div");
    const input = document.createElement("input");
    const removeButton = document.createElement("button");
    const inputClass = kind === "task" ? "job-task-input" : "job-requirement-input";
    const label = kind === "task" ? "Task to be completed" : "Required skill or qualification";
    const placeholder = kind === "task"
        ? "Add another task"
        : "Add another skill or qualification";

    item.className = "post-job-list-item";
    item.innerHTML = '<span aria-hidden="true">•</span>';
    input.type = "text";
    input.className = inputClass;
    input.setAttribute("aria-label", label);
    input.placeholder = placeholder;
    input.required = kind === "task";
    removeButton.type = "button";
    removeButton.className = "post-job-remove";
    removeButton.setAttribute("aria-label", "Remove " + kind);
    removeButton.textContent = "×";
    item.append(input, removeButton);
    list.append(item);
    input.focus();
}

function removePostJobListItem(button) {
    const list = button.closest(".post-job-list");
    const item = button.closest(".post-job-list-item");

    if (!list || !item) {
        return;
    }

    if (list.children.length === 1) {
        const input = item.querySelector("input");
        input.value = "";
    } else {
        item.remove();
    }

    updatePostJobPreview();
}

function updatePostJobChecklist(id, isComplete) {
    const item = document.getElementById(id);
    item.classList.toggle("complete", isComplete);
    item.querySelector("span").textContent = isComplete ? "✓" : "○";
}

function updatePostJobPreview() {
    const getValue = function (id) {
        return document.getElementById(id).value.trim();
    };
    const title = getValue("jobTitle");
    const summary = getValue("jobSummary");
    const location = getValue("jobLocation");
    const duration = getValue("jobDuration");
    const pay = Number(getValue("jobPay"));
    const openings = Number(getValue("jobOpenings"));
    const user = getCurrentUser();
    const selectedCategory = document.querySelector(".post-job-category.active");
    const categoryLabel = selectedCategory
        ? selectedCategory.dataset.categoryLabel
        : "Category";
    const payType = document.querySelector('input[name="jobPayType"]:checked').value;
    const initials = (user && user.name
        ? user.name.trim().split(/\s+/).slice(0, 2).map(function (part) {
            return part.charAt(0);
        }).join("")
        : "CH").toUpperCase();
    const taskItems = Array.from(
        document.querySelectorAll(".job-task-input")
    ).filter(function (input) {
        return input.value.trim();
    });
    const hasDetails = Boolean(
        title && summary && document.getElementById("jobCategory").value &&
        getValue("jobDescription")
    );
    const hasTiming = Number.isFinite(pay) && pay > 0 &&
        Number.isInteger(openings) && openings > 0 &&
        duration && getValue("jobDeadline");
    const hasContact = getValue("jobPhone") && getValue("jobEmail") && location;

    document.getElementById("postJobPreviewTitle").textContent =
        title || "Your task title";
    document.getElementById("postJobPreviewHirer").textContent =
        (user && user.name ? user.name : "Your name") + " · " + categoryLabel;
    document.getElementById("postJobPreviewSummary").textContent =
        summary || "A one-line summary of the task appears here.";
    document.getElementById("postJobPreviewLocation").textContent =
        location || "Location";
    document.getElementById("postJobPreviewDuration").textContent =
        duration || "Duration";
    document.getElementById("postJobPreviewOpenings").textContent =
        (openings > 0 ? openings : 1) + (openings === 1 ? " opening" : " openings");
    document.getElementById("postJobPreviewPay").textContent =
        Number.isFinite(pay) && pay > 0
            ? "KES " + pay.toLocaleString("en-KE") +
                (payType === "hourly" ? " / hour" :
                    payType === "daily" ? " / day" : "")
            : "KES —";
    document.querySelectorAll(".post-job-avatar").forEach(function (avatar) {
        avatar.textContent = initials;
    });
    document.getElementById("jobTitleCounter").textContent =
        document.getElementById("jobTitle").value.length + "/70";
    document.getElementById("jobSummaryCounter").textContent =
        document.getElementById("jobSummary").value.length + "/120";

    updatePostJobChecklist("postJobCheckDetails", hasDetails);
    updatePostJobChecklist("postJobCheckTasks", taskItems.length > 0);
    updatePostJobChecklist("postJobCheckPay", hasTiming);
    updatePostJobChecklist("postJobCheckContact", Boolean(hasContact));
}

document.querySelectorAll("[data-add-list]").forEach(function (button) {
    button.addEventListener("click", function () {
        addPostJobListItem(button.dataset.addList, button.dataset.addKind);
    });
});

document.getElementById("postJobForm").addEventListener("input", updatePostJobPreview);
document.getElementById("postJobForm").addEventListener("change", updatePostJobPreview);
document.getElementById("postJobForm").addEventListener("click", function (event) {
    const removeButton = event.target.closest(".post-job-remove");

    if (removeButton) {
        removePostJobListItem(removeButton);
    }
});

// 15. Publish a new job.
document.getElementById("postJobForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user || user.role !== "hirer") {
        showNotice("Please log in using a hirer account.");
        return;
    }

    const title = document.getElementById("jobTitle").value.trim();
    const category = document.getElementById("jobCategory").value;
    const categoryButton = document.querySelector(".post-job-category.active");
    const categoryDisplay = categoryButton.dataset.categoryLabel;
    const summary = document.getElementById("jobSummary").value.trim();
    const pay = Number(document.getElementById("jobPay").value);
    const location = document.getElementById("jobLocation").value.trim();
    const deadline = document.getElementById("jobDeadline").value;
    const description = document.getElementById("jobDescription").value.trim();
    const tasks = Array.from(document.querySelectorAll(".job-task-input"))
        .map(function (input) {
            return input.value.trim();
        })
        .filter(Boolean);
    const requirements = Array.from(
        document.querySelectorAll(".job-requirement-input")
    ).map(function (input) {
        return input.value.trim();
    }).filter(Boolean);
    const openings = Number(document.getElementById("jobOpenings").value);
    const duration = document.getElementById("jobDuration").value.trim();
    const email = document.getElementById("jobEmail").value.trim();
    const phone = document.getElementById("jobPhone").value.trim();
    const whatsapp = document.getElementById("jobWhatsapp").value.trim();
    const today = new Date();
    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);

    if (!title || !category || !summary || !location || !description ||
        tasks.length === 0 || !duration || !deadline || !email || !phone ||
        !Number.isFinite(pay) || pay <= 0 ||
        !Number.isInteger(openings) || openings < 1) {
        showNotice("Please complete every field correctly.");
        return;
    }

    if (deadline < localToday) {
        showNotice("The deadline cannot be in the past.");
        return;
    }

    const newJob = {
        id: Date.now(),
        title: title,
        category: category,
        categoryDisplay: categoryDisplay,
        summary: summary,
        tasks: tasks,
        pay: pay,
        payType: document.querySelector('input[name="jobPayType"]:checked').value,
        openings: openings,
        duration: duration,
        location: location,
        deadline: deadline,
        description: description,
        requirements: requirements.join("\n"),
        schedule: document.getElementById("jobSchedule").value.trim(),
        meetingPoint: document.getElementById("jobMeetingPoint").value.trim(),
        preferredContact: document.querySelector(
            'input[name="jobPreferredContact"]:checked'
        ).value,
        bestTime: document.getElementById("jobBestTime").value.trim(),
        hirer: user.name,
        hirerEmail: user.email,
        email: email,
        phone: phone,
        whatsapp: whatsapp,
        createdAt: new Date().toISOString()
    };

    jobs.unshift(newJob);
    saveJobs();

    const postJobForm = document.getElementById("postJobForm");
    postJobForm.reset();
    ["jobTasks", "jobRequirements"].forEach(function (listId) {
        const list = document.getElementById(listId);
        while (list.children.length > 1) {
            list.lastElementChild.remove();
        }
        list.querySelector("input").value = "";
    });
    selectPostJobCategory(
        document.querySelector('.post-job-category[data-category-label="Tutoring"]')
    );
    updatePostJobPreview();

    showNotice("Your job has been published in this browser!");
    showPage("employerWelcome");
});

// 16. Display the logged-in user's profile.
function renderProfile() {
    const user = getCurrentUser();
    const profileContent = document.getElementById("profileContent");
    const profileSummary = document.getElementById("profileSummary");
    const profileActions = document.getElementById("profileActions");

    if (!user) {
        profileSummary.innerHTML = "";
        profileContent.innerHTML = `
            <section class="profile-information-card profile-empty-state">
                <h2>You are not logged in</h2>
                <p>Log in to view your ComradeHustle profile.</p>
                <button class="btn btn-primary" onclick="showPage('login')">Log in</button>
            </section>
        `;
        profileActions.innerHTML = "";
        return;
    }

    const initials = user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (part) {
            return part.charAt(0);
        })
        .join("")
        .toUpperCase();
    const accountType = user.role === "hirer"
        ? user.hirerType === "department" ? "Department hirer" : "Student hirer"
        : "Freelancer";
    const identifierLabel = user.role === "freelancer"
        ? "Registration number"
        : user.hirerType === "department" ? "Department / unit" : "Admission number";

    profileSummary.innerHTML = `
        <div class="profile-avatar" aria-hidden="true">${escapeHTML(initials)}</div>
        <h2>${escapeHTML(user.name)}</h2>
        <span class="profile-role">${escapeHTML(accountType)}</span>
    `;

    profileContent.innerHTML = `
        <section class="profile-information-card">
            <div class="profile-panel-heading">
                <div>
                    <h2>Personal information</h2>
                    <p>Your account details and contact information.</p>
                </div>
                <span class="profile-status"><span aria-hidden="true"></span> Active</span>
            </div>
            <dl class="profile-info-list">
                <div class="profile-info-row">
                    <dt>Full name</dt>
                    <dd>${escapeHTML(user.name)}</dd>
                </div>
                <div class="profile-info-row">
                    <dt>Email address</dt>
                    <dd>${escapeHTML(user.email)}</dd>
                </div>
                <div class="profile-info-row">
                    <dt>Phone number</dt>
                    <dd>${escapeHTML(user.phone || "Not provided")}</dd>
                </div>
                ${user.identifier ? `
                    <div class="profile-info-row">
                        <dt>${escapeHTML(identifierLabel)}</dt>
                        <dd>${escapeHTML(user.identifier)}</dd>
                    </div>
                ` : ""}
                <div class="profile-info-row">
                    <dt>Account type</dt>
                    <dd>${escapeHTML(accountType)}</dd>
                </div>
            </dl>
        </section>
        <section class="profile-note-card">
            <h3>Keep your profile up to date</h3>
            <p>Accurate contact details help campus members connect with you about jobs and tasks.</p>
        </section>
    `;

    profileActions.innerHTML = user.role === "hirer"
        ? `<button class="btn btn-primary" onclick="openPostJob()">Post a Task</button>
           <button class="btn btn-outline" onclick="logout()">Log out</button>`
        : `<button class="btn btn-primary" onclick="showPage('jobs')">Browse Jobs</button>
           <button class="btn btn-outline" onclick="logout()">Log out</button>`;
}

function renderBilling() {
    const user = getCurrentUser();
    const billingSummary = document.getElementById("billingSummary");
    const billingActions = document.getElementById("billingActions");

    if (!user) {
        billingSummary.innerHTML = "";
        billingActions.innerHTML = `
            <button class="btn btn-primary" onclick="showPage('login')">Log in</button>
        `;
        return;
    }

    const initials = user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (part) {
            return part.charAt(0);
        })
        .join("")
        .toUpperCase();
    const accountType = user.role === "hirer"
        ? user.hirerType === "department" ? "Department hirer" : "Student hirer"
        : "Freelancer";
    document.getElementById("registeredPaymentPhoneValue").textContent =
        user.phone || "No registered phone number";

    billingSummary.innerHTML = `
        <div class="profile-avatar" aria-hidden="true">${escapeHTML(initials)}</div>
        <h2>${escapeHTML(user.name)}</h2>
        <span class="profile-role">${escapeHTML(accountType)}</span>
    `;
    billingActions.innerHTML = `
        <button class="btn btn-outline" onclick="logout()">Log out</button>
    `;
    renderSavedPaymentMethods();
}

function selectPaymentMethod(provider) {
    const methods = {
        mpesa: {
            title: "M-Pesa",
            description: "Choose the phone number where you want to receive M-Pesa payments."
        },
        airtel: {
            title: "Airtel Money",
            description: "Choose the phone number where you want to receive Airtel Money payments."
        },
        bank: {
            title: "Bank Account",
            description: "Enter the bank account details where you want to receive payments."
        }
    };

    if (!Object.prototype.hasOwnProperty.call(methods, provider)) {
        return;
    }

    selectedPaymentProvider = provider;
    document.querySelectorAll(".payment-method-option").forEach(function (option) {
        const isSelected = option.classList.contains(provider + "-theme");
        option.classList.toggle("selected", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
    });

    const method = methods[provider];
    document.getElementById("paymentSetupTitle").textContent = method.title;
    document.getElementById("paymentSetupDescription").textContent = method.description;

    const usesPhone = provider !== "bank";
    const phoneOptions = document.getElementById("paymentPhoneOptions");
    const bankFields = document.getElementById("bankPaymentFields");
    const registeredPhone = document.getElementById("registeredPaymentPhone");
    const alternatePhone = document.getElementById("alternatePaymentPhone");
    const user = getCurrentUser();
    const hasRegisteredPhone = Boolean(user && user.phone);

    phoneOptions.hidden = !usesPhone;
    bankFields.hidden = usesPhone;
    document.getElementById("paymentMethodForm").hidden = false;

    registeredPhone.disabled = !hasRegisteredPhone;
    registeredPhone.checked = hasRegisteredPhone;
    alternatePhone.checked = !hasRegisteredPhone;
    document.getElementById("alternatePaymentPhoneNumber").required = !hasRegisteredPhone;

    document.getElementById("paymentBankName").required = !usesPhone;
    document.getElementById("paymentAccountName").required = !usesPhone;
    document.getElementById("paymentAccountNumber").required = !usesPhone;
    togglePaymentPhoneInput();
}

function togglePaymentPhoneInput() {
    const useAlternatePhone = selectedPaymentProvider !== "bank" &&
        document.getElementById("alternatePaymentPhone").checked;
    const alternatePhoneField = document.getElementById("alternatePhoneField");
    const alternatePhoneInput = document.getElementById("alternatePaymentPhoneNumber");

    alternatePhoneField.hidden = !useAlternatePhone;
    alternatePhoneInput.required = useAlternatePhone;
}

function savePaymentMethod(event) {
    event.preventDefault();

    if (!selectedPaymentProvider) {
        showNotice("Choose a payment method first.");
        return;
    }

    const methods = {
        mpesa: "M-Pesa",
        airtel: "Airtel Money",
        bank: "Bank Account"
    };
    const savedMethod = { provider: methods[selectedPaymentProvider], detail: "" };

    if (selectedPaymentProvider === "bank") {
        const bankName = document.getElementById("paymentBankName").value.trim();
        const accountName = document.getElementById("paymentAccountName").value.trim();
        const accountNumber = document.getElementById("paymentAccountNumber").value.trim();

        if (!bankName || !accountName || !accountNumber) {
            showNotice("Complete all bank account fields to save this method.");
            return;
        }

        savedMethod.detail = bankName + " · ending " + accountNumber.slice(-4);
    } else {
        const useRegisteredPhone =
            document.getElementById("registeredPaymentPhone").checked;
        const user = getCurrentUser();
        const phone = useRegisteredPhone
            ? (user ? user.phone : "")
            : document.getElementById("alternatePaymentPhoneNumber").value.trim();

        if (!phone) {
            showNotice("Enter the phone number where you want to receive payment.");
            return;
        }

        savedMethod.detail = "Phone ending " + phone.replace(/\D/g, "").slice(-4);
    }

    savedPaymentMethods.push(savedMethod);
    renderSavedPaymentMethods();
    resetPaymentMethodForm();
    showNotice("Payment method saved for this page session.");
}

function resetPaymentMethodForm() {
    const form = document.getElementById("paymentMethodForm");
    form.reset();
    form.hidden = true;
    document.getElementById("paymentPhoneOptions").hidden = true;
    document.getElementById("bankPaymentFields").hidden = true;
    document.getElementById("alternatePaymentPhoneNumber").required = false;
    document.getElementById("paymentBankName").required = false;
    document.getElementById("paymentAccountName").required = false;
    document.getElementById("paymentAccountNumber").required = false;
    document.getElementById("registeredPaymentPhone").disabled = false;
    document.querySelectorAll(".payment-method-option").forEach(function (option) {
        option.classList.remove("selected");
        option.setAttribute("aria-pressed", "false");
    });
    selectedPaymentProvider = "";
}

function renderSavedPaymentMethods() {
    const container = document.getElementById("savedPaymentMethods");
    container.hidden = savedPaymentMethods.length === 0;
    container.innerHTML = savedPaymentMethods.map(function (method) {
        const themeClass = method.provider === "M-Pesa"
            ? "mpesa-theme"
            : method.provider === "Airtel Money" ? "airtel-theme" : "bank-theme";
        return `
            <article class="saved-payment-method ${themeClass}">
                <span class="payment-brand-mark" aria-hidden="true">
                    ${getPaymentBrandMarkup(method.provider)}
                </span>
                <span><strong>${escapeHTML(method.provider)}</strong>
                    <small>${escapeHTML(method.detail)}</small></span>
                <span class="saved-method-label">Added</span>
            </article>
        `;
    }).join("");
}

function getPaymentBrandMarkup(provider) {
    if (provider === "M-Pesa") {
        return `<img class="payment-logo-img"
                    src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
                    alt="" loading="lazy">`;
    }

    if (provider === "Airtel Money") {
        return `<img class="payment-logo-img"
                    src="https://upload.wikimedia.org/wikipedia/commons/d/da/Airtel_Africa_logo.svg"
                    alt="" loading="lazy">`;
    }

    return `<svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 3 2 8v2h20V8L12 3ZM4 12v6H2v2h20v-2h-2v-6h-2v6h-3v-6h-2v6h-3v-6H7v6H6v-6H4Z"/>
            </svg>`;
}

function setBillingTab(tab) {
    const tabs = {
        history: ["billingHistoryTab", "billingHistoryPanel"],
        methods: ["paymentMethodsTab", "paymentMethodsPanel"],
        balances: ["balancesTab", "balancesPanel"]
    };

    if (!Object.prototype.hasOwnProperty.call(tabs, tab)) {
        return;
    }

    Object.keys(tabs).forEach(function (key) {
        const isActive = key === tab;
        const tabButton = document.getElementById(tabs[key][0]);
        const panel = document.getElementById(tabs[key][1]);

        tabButton.classList.toggle("active", isActive);
        tabButton.setAttribute("aria-selected", String(isActive));
        panel.hidden = !isActive;
        panel.classList.toggle("active", isActive);
    });
}

// 17. Log out of the demo session.
function logout() {
    try {
        sessionStorage.removeItem("comradeHustleCurrentUser");
    } catch (error) {
        console.error("Could not clear session:", error);
    }

    savedPaymentMethods.length = 0;
    resetPaymentMethodForm();
    renderSavedPaymentMethods();
    updateRoleNavigation();
    showNotice("You have logged out.");
    showPage("landing");
}

document.addEventListener("click", function (event) {
    if (!document.getElementById("accountMenu").contains(event.target)) {
        closeAccountMenu();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeAccountMenu();
    }
});

// 18. Helper functions.
function getJobIcon(category) {
    const icons = {
        Events: "📣",
        Technology: "💻",
        Creative: "🎨",
        Academic: "📚",
        Marketing: "📱",
        Other: "💼"
    };

    return icons[category] || "💼";
}

function formatMoney(amount) {
    return "KSh " + Number(amount).toLocaleString("en-KE");
}

// Escape user-entered text before placing it in HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

// 19. Initialize the website.
document.getElementById("year").textContent = new Date().getFullYear();

try {
    sessionStorage.removeItem("comradeHustleCurrentUser");
} catch (error) {
    console.error("Could not clear the disabled demo session:", error);
}

selectRole("freelancer");
updateRoleNavigation();
renderJobs();

// Show the loading screen briefly, then open the landing page.
showPage("loading");

setTimeout(function () {
    showPage("landing");
}, 1500);
