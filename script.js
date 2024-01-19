const url = "https://api.github.com/users/";
const main = document.querySelector("#main");
const searchBox = document.querySelector("#search");
const userCard = document.querySelector("#user-card");
const reposContainer = document.querySelector("#repos");
const paginationContainer = document.querySelector("#pagination");

let currentUser = "";
let reposPerPage = 10;
let currentPage = 1;
let totalPages = 1;

const loader = document.getElementById("loader");

const showLoader = () => {
  loader.style.display = "block";
};

const hideLoader = () => {
  loader.style.display = "none";
};

const getUser = async (username, page = 1) => {
  try {
    showLoader();
    const userResponse = await fetch(`${url}${username}`);
    const userData = await userResponse.json();

    currentUser = username;

    renderUserCard(userData);
    getRepos(username, page);
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    hideLoader();
  }
  renderPagination(currentUser, totalRepos);
};

const getRepos = async (username, page) => {
  try {
    const response = await fetch(`${url}${username}/repos`);
    const data = await response.json();

    const startIndex = (page - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const slicedRepos = data.slice(startIndex, endIndex);

    renderRepos(slicedRepos);

    const totalRepos = data.length;
    totalPages = Math.ceil(totalRepos / reposPerPage);

    renderPagination(username, totalRepos);
  } catch (error) {
    console.error("Error fetching repos:", error);
  }
};

const renderUserCard = (data) => {
  userCard.innerHTML = `
        <div>
            <img class="avatar" src="${data.avatar_url}" alt="${
    data.name || "User"
  }">
        </div>
        <div class="user-info">
            <h2>${data.name}</h2>
            <p>${data.bio || "No bio available"}</p>

            <ul class="info">
                <li>${data.followers}<strong>Followers</strong></li>
                <li>${data.following}<strong>Following</strong></li>
                <li>${data.public_repos}<strong>Repos</strong></li>
            </ul>

            ${
              data.location
                ? `
                <p>

                    ${data.location}
                </p>
            `
                : ""
            }

            ${
              data.blog
                ? `
                <p>
                
                    <a href="${data.blog}" target="_blank" style="color: white; text-decoration: none;">${data.blog}</a>
                </p>
            `
                : ""
            }

            <!-- Add social links here -->
            ${
              data.twitter
                ? `<a href="https://twitter.com/${data.twitter}" target="_blank" style="color: white; text-decoration: none;"><img class="social-icon" src="twitter-icon.svg" alt="Twitter" style="fill: white;"></a>`
                : ""
            }
            ${
              data.facebook
                ? `<a href="https://facebook.com/${data.facebook}" target="_blank" style="color: white; text-decoration: none;"><img class="social-icon" src="facebook-icon.svg" alt="Facebook" style="fill: white;"></a>`
                : ""
            }
            ${
              data.instagram
                ? `<a href="https://instagram.com/${data.instagram}" target="_blank" style="color: white; text-decoration: none;"><img class="social-icon" src="instagram-icon.svg" alt="Instagram" style="fill: white;"></a>`
                : ""
            }

            <!-- Add GitHub homepage link -->
            <p>
               
                <a href="${
                  data.html_url
                }" target="_blank" style="color: white; text-decoration: none;">GitHub</a>
            </p>
        </div>
    `;
};

const renderRepos = async (repos) => {
  reposContainer.innerHTML = "";

  for (const item of repos) {
    const repoCard = document.createElement("div");
    repoCard.classList.add("repo-card");

    const repoName = document.createElement("h3");
    repoName.innerText = item.name;

    const repoDescription = document.createElement("p");
    repoDescription.innerText = item.description || "No description available";

    const repoSkills = document.createElement("div");
    repoSkills.classList.add("repo-skills");

    const languagesUrl = `https://api.github.com/repos/${item.owner.login}/${item.name}/languages`;
    const languagesResponse = await fetch(languagesUrl);

    if (languagesResponse.ok) {
      const languagesData = await languagesResponse.json();
      const repoLanguages = Object.keys(languagesData);

      repoLanguages.forEach((language) => {
        const skillButton = document.createElement("button");
        skillButton.classList.add("skill-button");
        skillButton.innerText = language;

        repoSkills.appendChild(skillButton);
      });
    } else {
      repoSkills.innerText = "Unable to fetch languages";
    }

    const repoLink = document.createElement("a");
    repoLink.classList.add("repo-link", "view-repo");
    repoLink.href = item.html_url;
    repoLink.innerText = "View Repo";
    repoLink.target = "_blank";

    repoCard.appendChild(repoName);
    repoCard.appendChild(repoDescription);
    repoCard.appendChild(repoSkills);
    repoCard.appendChild(repoLink);

    reposContainer.appendChild(repoCard);
  }
};

let reposPerPageSelect = document.querySelector("#reposPerPage");

const changeReposPerPage = () => {
  reposPerPage = parseInt(reposPerPageSelect.value);
  currentPage = 1;
  getUser(currentUser, currentPage);
};

const renderPagination = (username, totalRepos) => {
  paginationContainer.innerHTML = "";

  const maxDisplayedPages = 7;
  const totalPages = Math.ceil(totalRepos / reposPerPage);

  let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
  let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);

  if (totalPages <= maxDisplayedPages) {
    endPage = totalPages;
  } else if (currentPage <= Math.floor(maxDisplayedPages / 2)) {
    endPage = maxDisplayedPages;
  } else if (currentPage + Math.floor(maxDisplayedPages / 2) >= totalPages) {
    startPage = totalPages - maxDisplayedPages + 1;
  }

  const prevButton = document.createElement("button");
  prevButton.innerHTML = "&#8249;";
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      getRepos(username, currentPage);
    }
  });
  paginationContainer.appendChild(prevButton);

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");
    button.innerText = i;
    button.addEventListener("click", () => {
      currentPage = i;
      getRepos(username, currentPage);
    });

    if (i === currentPage) {
      button.classList.add("active");
    }

    paginationContainer.appendChild(button);
  }

  const nextButton = document.createElement("button");
  nextButton.innerHTML = "&#8250;";
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      getRepos(username, currentPage);
    }
  });
  paginationContainer.appendChild(nextButton);
};

const formSubmit = () => {
  const username = searchBox.value.trim();

  const defaultUsername = "abdulhameedSk";
  const finalUsername = username || defaultUsername;

  getUser(finalUsername, currentPage);
  searchBox.value = "";
  return false;
};

getUser("abdulhameedSk", currentPage);
