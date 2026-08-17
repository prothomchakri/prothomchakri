// =====================================================
// PROTHOMCHAKRI - SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL =
    "https://sckqfcquvltoycnqyfcp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_X7Ln-nQRPbgLjoTZCADvrg_L7tMs-ML";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentUser = null;
let currentProfile = null;


// =====================================================
// PAGE NAVIGATION
// =====================================================

function hideAllPages() {

    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("jobsPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.add("hidden");
    document.getElementById("profilePage").classList.add("hidden");

}


function showHome() {

    hideAllPages();

    document.getElementById("homePage")
        .classList.remove("hidden");

}


function showJobs() {

    hideAllPages();

    document.getElementById("jobsPage")
        .classList.remove("hidden");

}


function showDashboard() {

    if (!currentUser) {

        openLogin();
        return;

    }

    hideAllPages();

    document.getElementById("dashboardPage")
        .classList.remove("hidden");

    loadProfile();

}


function showProfileForm() {

    if (!currentUser) {

        openLogin();
        return;

    }

    hideAllPages();

    document.getElementById("profilePage")
        .classList.remove("hidden");

    fillProfileForm();

}


// =====================================================
// AUTH MODAL
// =====================================================

function openLogin() {

    document.getElementById("authModal")
        .classList.remove("hidden");

    document.getElementById("loginFormContainer")
        .classList.remove("hidden");

    document.getElementById("registerFormContainer")
        .classList.add("hidden");

    clearMessages();

}


function openRegister() {

    document.getElementById("authModal")
        .classList.remove("hidden");

    document.getElementById("loginFormContainer")
        .classList.add("hidden");

    document.getElementById("registerFormContainer")
        .classList.remove("hidden");

    clearMessages();

}


function closeAuth() {

    document.getElementById("authModal")
        .classList.add("hidden");

    clearMessages();

}


function clearMessages() {

    document.querySelectorAll(".message")
        .forEach(element => {

            element.textContent = "";

        });

}


// =====================================================
// REGISTER
// =====================================================

document
    .getElementById("registerForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const fullName =
            document
                .getElementById("registerFullName")
                .value
                .trim();


        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("registerPassword")
                .value;


        const genderIdentity =
            document
                .getElementById("genderIdentity")
                .value;


        const message =
            document
                .getElementById("registerMessage");


        message.textContent =
            "Creating your account...";

        message.style.color = "#146cda";


        try {

            // Create Supabase Auth account

            const {
                data,
                error
            } = await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {

                        full_name: fullName,

                        gender_identity:
                            genderIdentity

                    }

                }

            });


            if (error) {

                throw error;

            }


            // Create profile if user was returned

            if (data.user) {

                const profileData = {

                    auth_user_id:
                        data.user.id,

                    full_name:
                        fullName,

                    email:
                        email,

                    gender_identity:
                        genderIdentity

                };


                const {
                    error: profileError
                } = await supabaseClient
                    .from("profiles")
                    .upsert(

                        profileData,

                        {
                            onConflict:
                                "auth_user_id"
                        }

                    );


                if (profileError) {

                    console.log(
                        "Profile creation:",
                        profileError.message
                    );

                }

            }


            // Successful registration

            message.style.color =
                "#198754";


            if (data.session) {

                message.textContent =
                    "Registration successful!";


                currentUser =
                    data.user;


                await loadProfile();


                document
                    .getElementById("registerForm")
                    .reset();


                setTimeout(function() {

                    closeAuth();

                    showDashboard();

                    showToast(
                        "Welcome to ProthomChakri!"
                    );

                }, 500);


            } else {

                message.textContent =
                    "Account created! Please check your email to verify your account.";

                document
                    .getElementById("registerForm")
                    .reset();

            }


        } catch (error) {

            console.error(error);


            message.style.color =
                "#d34848";


            message.textContent =
                error.message ||
                "Registration failed.";

        }

    });


// =====================================================
// LOGIN
// =====================================================

document
    .getElementById("loginForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        const message =
            document
                .getElementById("loginMessage");


        message.textContent =
            "Logging in...";

        message.style.color =
            "#146cda";


        try {

            const {
                data,
                error
            } = await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


            if (error) {

                throw error;

            }


            currentUser =
                data.user;


            await loadProfile();


            message.style.color =
                "#198754";


            message.textContent =
                "Login successful!";


            setTimeout(function() {

                closeAuth();

                showDashboard();

                showToast(
                    "Welcome back!"
                );

            }, 500);


        } catch (error) {

            console.error(error);


            message.style.color =
                "#d34848";


            message.textContent =
                error.message ||
                "Login failed.";

        }

    });


// =====================================================
// AUTH SESSION
// =====================================================

async function initializeAuth() {

    const {
        data
    } = await supabaseClient
        .auth
        .getSession();


    if (data.session) {

        currentUser =
            data.session.user;

        await loadProfile();

    }


    updateNavigation();


    supabaseClient.auth
        .onAuthStateChange(
            async function(event, session) {

                currentUser =
                    session?.user || null;


                if (currentUser) {

                    await loadProfile();

                } else {

                    currentProfile = null;

                }


                updateNavigation();

            }
        );

}


// =====================================================
// NAVIGATION STATE
// =====================================================

function updateNavigation() {

    document
        .getElementById("loginBtn")
        .classList.toggle(
            "hidden",
            !!currentUser
        );


    document
        .getElementById("registerBtn")
        .classList.toggle(
            "hidden",
            !!currentUser
        );


    document
        .getElementById("dashboardBtn")
        .classList.toggle(
            "hidden",
            !currentUser
        );


    document
        .getElementById("logoutBtn")
        .classList.toggle(
            "hidden",
            !currentUser
        );

}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile() {

    if (!currentUser) {

        return;

    }


    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
            "auth_user_id",
            currentUser.id
        )
        .maybeSingle();


    if (error) {

        console.log(
            "Profile loading error:",
            error.message
        );

    }


    currentProfile =
        data || {

            auth_user_id:
                currentUser.id,

            full_name:
                currentUser
                    .user_metadata
                    ?.full_name ||
                "Your Name",

            email:
                currentUser.email,

            gender_identity:
                currentUser
                    .user_metadata
                    ?.gender_identity ||
                ""

        };


    renderProfile();

}


// =====================================================
// DISPLAY PROFILE
// =====================================================

function renderProfile() {

    if (!currentProfile) {

        return;

    }


    const name =
        currentProfile.full_name ||
        "Your Name";


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase();


    document
        .getElementById("welcomeName")
        .textContent =
        name.split(" ")[0];


    document
        .getElementById("profileName")
        .textContent =
        name;


    document
        .getElementById("profileGender")
        .textContent =
        currentProfile.gender_identity ||
        "Gender not added";


    document
        .getElementById("profileAvatar")
        .textContent =
        firstLetter;


    document
        .getElementById("profileBio")
        .textContent =
        currentProfile.bio ||
        "Add your professional bio.";


    document
        .getElementById("profileEducation")
        .textContent =
        currentProfile.education ||
        "Not added";


    document
        .getElementById("profileSkills")
        .textContent =
        currentProfile.skills ||
        "Not added";


    document
        .getElementById("profileExperience")
        .textContent =
        currentProfile.experience ||
        "Not added";


    document
        .getElementById("profileLocation")
        .textContent =
        currentProfile.location ||
        "Not added";


    // Profile completion

    const fields = [

        "full_name",
        "gender_identity",
        "headline",
        "bio",
        "education",
        "skills",
        "experience",
        "location"

    ];


    let completed = 0;


    fields.forEach(function(field) {

        if (
            currentProfile[field] &&
            String(
                currentProfile[field]
            ).trim()
        ) {

            completed++;

        }

    });


    const percentage =
        Math.round(
            completed /
            fields.length *
            100
        );


    document
        .getElementById("profileProgress")
        .style.width =
        percentage + "%";


    document
        .getElementById("completionText")
        .textContent =
        percentage +
        "% Complete";

}


// =====================================================
// PROFILE FORM
// =====================================================

function fillProfileForm() {

    if (!currentProfile) {

        return;

    }


    document
        .getElementById("editFullName")
        .value =
        currentProfile.full_name || "";


    document
        .getElementById("editGender")
        .value =
        currentProfile.gender_identity || "";


    document
        .getElementById("editHeadline")
        .value =
        currentProfile.headline || "";


    document
        .getElementById("editBio")
        .value =
        currentProfile.bio || "";


    document
        .getElementById("editEducation")
        .value =
        currentProfile.education || "";


    document
        .getElementById("editSkills")
        .value =
        currentProfile.skills || "";


    document
        .getElementById("editExperience")
        .value =
        currentProfile.experience || "";


    document
        .getElementById("editLocation")
        .value =
        currentProfile.location || "";

}


// =====================================================
// SAVE PROFILE
// =====================================================

document
    .getElementById("profileForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        if (!currentUser) {

            openLogin();

            return;

        }


        const message =
            document
                .getElementById(
                    "profileMessage"
                );


        message.textContent =
            "Saving profile...";

        message.style.color =
            "#146cda";


        const profileData = {

            auth_user_id:
                currentUser.id,

            full_name:
                document
                    .getElementById(
                        "editFullName"
                    )
                    .value
                    .trim(),

            email:
                currentUser.email,

            gender_identity:
                document
                    .getElementById(
                        "editGender"
                    )
                    .value,

            headline:
                document
                    .getElementById(
                        "editHeadline"
                    )
                    .value
                    .trim(),

            bio:
                document
                    .getElementById(
                        "editBio"
                    )
                    .value
                    .trim(),

            education:
                document
                    .getElementById(
                        "editEducation"
                    )
                    .value
                    .trim(),

            skills:
                document
                    .getElementById(
                        "editSkills"
                    )
                    .value
                    .trim(),

            experience:
                document
                    .getElementById(
                        "editExperience"
                    )
                    .value
                    .trim(),

            location:
                document
                    .getElementById(
                        "editLocation"
                    )
                    .value
                    .trim()

        };


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("profiles")
                .upsert(

                    profileData,

                    {
                        onConflict:
                            "auth_user_id"
                    }

                )
                .select()
                .single();


            if (error) {

                throw error;

            }


            currentProfile =
                data;


            renderProfile();


            message.style.color =
                "#198754";


            message.textContent =
                "Profile saved successfully!";


            showToast(
                "Profile updated successfully."
            );


            setTimeout(function() {

                showDashboard();

            }, 700);


        } catch (error) {

            console.error(error);


            message.style.color =
                "#d34848";


            message.textContent =
                "Could not save profile: " +
                error.message;

        }

    });


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    const {
        error
    } = await supabaseClient
        .auth
        .signOut();


    if (error) {

        showToast(
            error.message
        );

        return;

    }


    currentUser = null;

    currentProfile = null;


    updateNavigation();

    showHome();


    showToast(
        "You have been logged out."
    );

}


// =====================================================
// JOB SEARCH
// =====================================================

function filterJobs() {

    const query =
        document
            .getElementById(
                "jobSearch"
            )
            .value
            .toLowerCase();


    document
        .querySelectorAll(
            ".job-card"
        )
        .forEach(function(card) {

            if (
                card.textContent
                    .toLowerCase()
                    .includes(query)
            ) {

                card.style.display =
                    "flex";

            } else {

                card.style.display =
                    "none";

            }

        });

}


// =====================================================
// TOAST
// =====================================================

function showToast(text) {

    const toast =
        document
            .getElementById(
                "toast"
            );


    toast.textContent =
        text;


    toast.classList.add(
        "show"
    );


    setTimeout(function() {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


// =====================================================
// START WEBSITE
// =====================================================

initializeAuth();
