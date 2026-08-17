/* =========================================================
   PROTHOMCHAKRI - SUPABASE SCRIPT
   ========================================================= */

/* -----------------------------
   SUPABASE CONFIGURATION
----------------------------- */

const SUPABASE_URL = "https://sckqfcquvltoycnqyfcp.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_X7Ln-nQRPbgLjoTZCADvrg_L7tMs-ML";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* -----------------------------
   DOM ELEMENTS
----------------------------- */

const authOverlay =
  document.getElementById("authOverlay");

const authClose =
  document.getElementById("authClose");

const signInTab =
  document.getElementById("signInTab");

const registerTab =
  document.getElementById("registerTab");

const authForm =
  document.getElementById("authForm");

const authTitle =
  document.getElementById("authTitle");

const authSubtitle =
  document.getElementById("authSubtitle");

const authSubmit =
  document.getElementById("authSubmit");

const authMessage =
  document.getElementById("authMessage");

const authEmail =
  document.getElementById("authEmail");

const authPassword =
  document.getElementById("authPassword");

const profileFields =
  document.getElementById("profileFields");

const profileName =
  document.getElementById("profileName");

const profilePhone =
  document.getElementById("profilePhone");

const profileLocation =
  document.getElementById("profileLocation");

const profileEducation =
  document.getElementById("profileEducation");

const profileSkills =
  document.getElementById("profileSkills");

const profileBio =
  document.getElementById("profileBio");

const profileCv =
  document.getElementById("profileCv");

const loginButton =
  document.querySelector(".login-btn");

const employerButton =
  document.querySelector(".employer-btn");

const mobileMenu =
  document.getElementById("mobileMenu");

const searchButton =
  document.getElementById("searchButton");

const jobSearch =
  document.getElementById("jobSearch");

const locationSearch =
  document.getElementById("locationSearch");

const jobList =
  document.getElementById("jobList");


/* -----------------------------
   AUTH MODE
----------------------------- */

let authMode = "signin";


/* =========================================================
   AUTH MODAL
========================================================= */

function openAuthModal(mode = "signin") {

  authMode = mode;

  authOverlay.classList.add("open");

  authOverlay.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";

  setAuthMode(mode);

  clearAuthMessage();
}


function closeAuthModal() {

  authOverlay.classList.remove("open");

  authOverlay.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";

  clearAuthMessage();
}


function setAuthMode(mode) {

  authMode = mode;

  if (mode === "register") {

    signInTab.classList.remove("active");
    registerTab.classList.add("active");

    authTitle.textContent =
      "Create your account";

    authSubtitle.textContent =
      "Create your ProthomChakri profile.";

    authSubmit.textContent =
      "Create account";

    profileFields.hidden = false;

    authPassword.autocomplete =
      "new-password";

  } else {

    signInTab.classList.add("active");
    registerTab.classList.remove("active");

    authTitle.textContent =
      "Welcome back";

    authSubtitle.textContent =
      "Sign in to continue.";

    authSubmit.textContent =
      "Sign in";

    profileFields.hidden = true;

    authPassword.autocomplete =
      "current-password";
  }

  clearAuthMessage();
}


function clearAuthMessage() {

  if (!authMessage) return;

  authMessage.textContent = "";

  authMessage.classList.remove("error");
}


function showAuthMessage(message, isError = false) {

  if (!authMessage) return;

  authMessage.textContent = message;

  authMessage.classList.toggle(
    "error",
    isError
  );
}


/* =========================================================
   SIGN IN
========================================================= */

async function signInUser(email, password) {

  const {
    data,
    error
  } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {

    console.error(
      "Sign in error:",
      error
    );

    throw error;
  }

  return data;
}


/* =========================================================
   REGISTRATION
========================================================= */

async function registerUser() {

  const email =
    authEmail.value.trim();

  const password =
    authPassword.value;

  const name =
    profileName.value.trim();

  const phone =
    profilePhone.value.trim();

  const location =
    profileLocation.value.trim();

  const education =
    profileEducation.value.trim();

  const skills =
    profileSkills.value.trim();

  const bio =
    profileBio.value.trim();

  const cvUrl =
    profileCv.value.trim();


  if (!email || !password) {

    throw new Error(
      "Please enter your email and password."
    );
  }


  if (password.length < 6) {

    throw new Error(
      "Password must be at least 6 characters."
    );
  }


  if (!name) {

    throw new Error(
      "Please enter your full name."
    );
  }


  /* Create Supabase Auth user */

  const {
    data,
    error
  } = await supabaseClient.auth.signUp({

    email: email,

    password: password,

    options: {
      data: {
        full_name: name
      }
    }

  });


  if (error) {

    console.error(
      "Registration error:",
      error
    );

    throw error;
  }


  /*
    If email confirmation is disabled,
    data.user will have an active session.

    If email confirmation is enabled,
    the user will need to confirm their email.
  */

  if (!data.user) {

    throw new Error(
      "Account could not be created."
    );
  }


  /*
    Create profile only when we have
    an authenticated session.
  */

  if (data.session) {

    await createProfile(
      data.user.id,
      {
        full_name: name,
        phone: phone,
        location: location,
        education: education,
        skills: skills,
        bio: bio,
        cv_url: cvUrl
      }
    );

  }


  return data;
}


/* =========================================================
   CREATE PROFILE
========================================================= */

async function createProfile(
  userId,
  profileData
) {

  const profile = {

    id: userId,

    full_name:
      profileData.full_name || null,

    phone:
      profileData.phone || null,

    location:
      profileData.location || null,

    education:
      profileData.education || null,

    skills:
      profileData.skills || null,

    bio:
      profileData.bio || null,

    cv_url:
      profileData.cv_url || null
  };


  const {
    data,
    error
  } = await supabaseClient
    .from("profiles")
    .insert(profile)
    .select()
    .single();


  if (error) {

    console.error(
      "Profile creation error:",
      error
    );

    throw error;
  }


  return data;
}


/* =========================================================
   UPDATE PROFILE
========================================================= */

async function updateProfile(
  userId,
  profileData
) {

  const {
    data,
    error
  } = await supabaseClient
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select()
    .single();


  if (error) {

    console.error(
      "Profile update error:",
      error
    );

    throw error;
  }


  return data;
}


/* =========================================================
   GET PROFILE
========================================================= */

async function getProfile(userId) {

  const {
    data,
    error
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();


  if (error) {

    console.error(
      "Profile loading error:",
      error
    );

    return null;
  }


  return data;
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

  const {
    error
  } = await supabaseClient.auth.signOut();


  if (error) {

    console.error(
      "Logout error:",
      error
    );

    throw error;
  }


  updateLoginButton(null);

  alert(
    "You have been signed out."
  );
}


/* =========================================================
   UPDATE SIGN-IN BUTTON
========================================================= */

function updateLoginButton(user) {

  if (!loginButton) return;


  if (!user) {

    loginButton.textContent =
      "Sign in";

    loginButton.onclick = () => {
      openAuthModal("signin");
    };

    return;
  }


  let displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Account";


  loginButton.textContent =
    displayName;


  loginButton.onclick =
    async () => {

      const choice =
        confirm(
          "You are signed in as " +
          displayName +
          ".\n\nPress OK to sign out."
        );


      if (choice) {

        try {

          await logoutUser();

        } catch (error) {

          alert(
            error.message ||
            "Could not sign out."
          );

        }

      }

    };

}


/* =========================================================
   AUTH STATE
========================================================= */

async function handleAuthState() {

  const {
    data
  } = await supabaseClient.auth.getSession();


  const session =
    data?.session;


  if (session?.user) {

    updateLoginButton(
      session.user
    );

  } else {

    updateLoginButton(null);

  }


  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      console.log(
        "Auth event:",
        event
      );


      if (session?.user) {

        updateLoginButton(
          session.user
        );

      } else {

        updateLoginButton(null);

      }

    }
  );

}


/* =========================================================
   AUTH FORM SUBMIT
========================================================= */

if (authForm) {

  authForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();

      clearAuthMessage();

      const email =
        authEmail.value.trim();

      const password =
        authPassword.value;


      if (!email || !password) {

        showAuthMessage(
          "Please enter your email and password.",
          true
        );

        return;
      }


      authSubmit.disabled = true;


      if (authMode === "signin") {

        authSubmit.textContent =
          "Signing in...";

      } else {

        authSubmit.textContent =
          "Creating account...";
      }


      try {

        if (authMode === "signin") {

          const result =
            await signInUser(
              email,
              password
            );


          updateLoginButton(
            result.user
          );


          showAuthMessage(
            "Signed in successfully."
          );


          setTimeout(() => {

            closeAuthModal();

          }, 700);


        } else {

          const result =
            await registerUser();


          if (result.session) {

            updateLoginButton(
              result.user
            );


            showAuthMessage(
              "Account created successfully."
            );


            setTimeout(() => {

              closeAuthModal();

            }, 1000);

          } else {

            showAuthMessage(
              "Account created. Please check your email to confirm your account."
            );

          }

        }

      } catch (error) {

        console.error(error);

        let message =
          error?.message ||
          "Something went wrong.";


        /*
          Make common Supabase messages
          easier to understand.
        */

        if (
          message.toLowerCase().includes(
            "invalid login credentials"
          )
        ) {

          message =
            "Incorrect email or password.";

        }


        if (
          message.toLowerCase().includes(
            "user already registered"
          )
        ) {

          message =
            "This email is already registered. Please sign in.";

        }


        showAuthMessage(
          message,
          true
        );

      } finally {

        authSubmit.disabled = false;

        authSubmit.textContent =
          authMode === "signin"
            ? "Sign in"
            : "Create account";

      }

    }
  );

}


/* =========================================================
   AUTH BUTTON EVENTS
========================================================= */

if (loginButton) {

  loginButton.addEventListener(
    "click",
    () => {

      /*
        If updateLoginButton() has replaced
        onclick for a logged-in user,
        this listener may still open the modal.

        The current onclick handler takes
        precedence for logged-in users.
      */

      if (
        !loginButton.onclick ||
        loginButton.textContent === "Sign in"
      ) {

        openAuthModal("signin");

      }

    }
  );

}


if (authClose) {

  authClose.addEventListener(
    "click",
    closeAuthModal
  );

}


if (authOverlay) {

  authOverlay.addEventListener(
    "click",
    function(event) {

      if (
        event.target === authOverlay
      ) {

        closeAuthModal();

      }

    }
  );

}


document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape" &&
      authOverlay.classList.contains("open")
    ) {

      closeAuthModal();

    }

  }
);


if (signInTab) {

  signInTab.addEventListener(
    "click",
    () => {

      setAuthMode("signin");

    }
  );

}


if (registerTab) {

  registerTab.addEventListener(
    "click",
    () => {

      setAuthMode("register");

    }
  );

}


/* =========================================================
   SEARCH
========================================================= */

function performJobSearch() {

  const query =
    jobSearch.value
      .trim()
      .toLowerCase();

  const location =
    locationSearch.value
      .trim()
      .toLowerCase();


  const cards =
    Array.from(
      document.querySelectorAll(".job-card")
    );


  let visibleCount = 0;


  cards.forEach(card => {

    const title =
      (
        card.dataset.title ||
        ""
      ).toLowerCase();

    const category =
      (
        card.dataset.category ||
        ""
      ).toLowerCase();

    const cardLocation =
      (
        card.dataset.location ||
        ""
      ).toLowerCase();

    const company =
      (
        card.querySelector(
          ".company-name"
        )?.textContent ||
        ""
      ).toLowerCase();


    const matchesQuery =
      !query ||
      title.includes(query) ||
      category.includes(query) ||
      company.includes(query);


    const matchesLocation =
      !location ||
      cardLocation === location;


    if (
      matchesQuery &&
      matchesLocation
    ) {

      card.style.display =
        "flex";

      visibleCount++;

    } else {

      card.style.display =
        "none";

    }

  });


  showNoResultsMessage(
    visibleCount === 0
  );

}


function showNoResultsMessage(show) {

  const existing =
    document.querySelector(
      ".no-results"
    );


  if (show) {

    if (existing) return;


    const message =
      document.createElement("div");


    message.className =
      "no-results";


    message.innerHTML = `
      <h3>No jobs found</h3>
      <p>Try another job title, skill, company or location.</p>
    `;


    jobList.appendChild(message);

  } else {

    if (existing) {

      existing.remove();

    }

  }

}


if (searchButton) {

  searchButton.addEventListener(
    "click",
    performJobSearch
  );

}


if (jobSearch) {

  jobSearch.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        performJobSearch();

      }

    }
  );

}


if (locationSearch) {

  locationSearch.addEventListener(
    "change",
    performJobSearch
  );

}


/* =========================================================
   POPULAR SEARCH BUTTONS
========================================================= */

document
  .querySelectorAll(
    ".popular-searches button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        jobSearch.value =
          button.textContent.trim();

        performJobSearch();

        document
          .getElementById("jobs")
          ?.scrollIntoView({
            behavior:"smooth"
          });

      }
    );

  });


/* =========================================================
   CATEGORY FILTERS
========================================================= */

document
  .querySelectorAll(
    ".category-card"
  )
  .forEach(card => {

    card.addEventListener(
      "click",
      () => {

        const category =
          card.dataset.category || "";


        jobSearch.value =
          category;


        locationSearch.value =
          "";


        performJobSearch();


        document
          .getElementById("jobs")
          ?.scrollIntoView({
            behavior:"smooth"
          });

      }
    );

  });


/* =========================================================
   BOOKMARKS
========================================================= */

document
  .querySelectorAll(
    ".bookmark"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      async function() {

        const {
          data
        } =
          await supabaseClient.auth.getSession();


        if (!data?.session) {

          openAuthModal("signin");

          return;

        }


        this.classList.toggle(
          "saved"
        );


        this.textContent =
          this.classList.contains("saved")
            ? "♥"
            : "♡";

      }
    );

  });


/* =========================================================
   POST A JOB BUTTON
========================================================= */

if (employerButton) {

  employerButton.addEventListener(
    "click",
    () => {

      alert(
        "Employer job posting will be available soon."
      );

    }
  );

}


document
  .querySelectorAll(
    ".employer-cta, .dark-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        alert(
          "Employer job posting will be available soon."
        );

      }
    );

  });


/* =========================================================
   MOBILE MENU
========================================================= */

if (mobileMenu) {

  mobileMenu.addEventListener(
    "click",
    () => {

      const nav =
        document.querySelector(
          ".nav-links"
        );


      if (!nav) return;


      const visible =
        nav.style.display === "flex";


      if (visible) {

        nav.style.display =
          "";

      } else {

        nav.style.display =
          "flex";

        nav.style.position =
          "absolute";

        nav.style.top =
          "72px";

        nav.style.left =
          "0";

        nav.style.right =
          "0";

        nav.style.padding =
          "20px";

        nav.style.background =
          "#fff";

        nav.style.flexDirection =
          "column";

        nav.style.borderBottom =
          "1px solid #edf0f3";

      }

    }
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "ProthomChakri loaded."
    );


    try {

      await handleAuthState();

    } catch (error) {

      console.error(
        "Supabase initialization error:",
        error
      );

    }

  }
);
