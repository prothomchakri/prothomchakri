const searchButton=document.getElementById("searchButton");const jobSearch=document.getElementById("jobSearch");const locationSearch=document.getElementById("locationSearch");const jobList=document.getElementById("jobList");

function searchJobs(){
  const keyword=jobSearch.value.trim().toLowerCase();
  const location=locationSearch.value.trim().toLowerCase();
  const jobs=document.querySelectorAll(".job-card");
  let visibleJobs=0;

  jobs.forEach(job=>{
    const title=job.dataset.title.toLowerCase();
    const category=job.dataset.category.toLowerCase();
    const jobLocation=job.dataset.location.toLowerCase();
    const keywordMatch=keyword===""||title.includes(keyword)||category.includes(keyword);
    const locationMatch=location===""||jobLocation===location;
    if(keywordMatch&&locationMatch){job.style.display="flex";visibleJobs++}
    else{job.style.display="none"}
  });

  const existingMessage=document.querySelector(".no-results");
  if(existingMessage)existingMessage.remove();

  if(visibleJobs===0){
    const message=document.createElement("div");
    message.className="no-results";
    message.innerHTML="<h3>No jobs found</h3><p>Try another job title, skill or location.</p>";
    jobList.appendChild(message);
  }
}

searchButton.addEventListener("click",searchJobs);
jobSearch.addEventListener("keypress",event=>{if(event.key==="Enter")searchJobs()});
locationSearch.addEventListener("change",searchJobs);

document.querySelectorAll(".popular-searches button").forEach(button=>{
  button.addEventListener("click",()=>{
    jobSearch.value=button.textContent;
    searchJobs();
    document.getElementById("jobs").scrollIntoView({behavior:"smooth"});
  });
});

document.querySelectorAll(".category-card").forEach(card=>{
  card.addEventListener("click",()=>{
    jobSearch.value=card.dataset.category;
    searchJobs();
    document.getElementById("jobs").scrollIntoView({behavior:"smooth"});
  });
});

document.querySelectorAll(".bookmark").forEach(bookmark=>{
  bookmark.addEventListener("click",()=>{
    bookmark.classList.toggle("saved");
    bookmark.textContent=bookmark.classList.contains("saved")?"♥":"♡";
  });
});

const mobileMenu=document.getElementById("mobileMenu");
const navLinks=document.querySelector(".nav-links");
mobileMenu.addEventListener("click",()=>{
  if(navLinks.style.display==="flex"){navLinks.style.display="none"}
  else{
    navLinks.style.display="flex";
    navLinks.style.position="absolute";
    navLinks.style.top="68px";
    navLinks.style.left="0";
    navLinks.style.right="0";
    navLinks.style.background="white";
    navLinks.style.padding="20px";
    navLinks.style.flexDirection="column";
    navLinks.style.alignItems="flex-start";
    navLinks.style.borderBottom="1px solid #e8ebf0";
  }
});

document.querySelectorAll(".login-btn,.employer-btn,.profile-button,.outline-button,.dark-button,.employer-cta").forEach(button=>{
  button.addEventListener("click",()=>{
    alert("This feature will be connected in the next version of ProthomChakri.");
  });
});
