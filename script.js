let currentPage = 1;

function getUserInfo() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter a username.');
        return;
    }

    fetch(`https://api.github.com/users/${username}`)
        .then(response => response.json())
        .then(user => displayUserInfo(user))
        .catch(error => {
            alert('Error fetching user information. Please try again.');
        });
}

function getRepositories() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter a username.');
        return;
    }

    showLoader();
    clearRepositories();

    const perPage = document.getElementById('perPage').value;

    fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`)
        .then(response => response.json())
        .then(repositories => {
            displayUserInfo(repositories[0].owner); // Display user info from the first repo
            displayRepositories(repositories);
        })
        .catch(error => {
            hideLoader();
            alert('Error fetching repositories. Please try again.');
        });
}

function displayUserInfo(user) {
    const userAvatar = document.getElementById('user-avatar');
    userAvatar.innerHTML = `<img src="${user.avatar_url}" alt="${user.login}" width="100">`;

    const userDetails = document.getElementById('user-details');
    userDetails.innerHTML = `<h2>${user.name || user.login}</h2>
                             <p>${user.bio || 'No bio available.'}</p>`;
}

async function fetchTopics(repoFullName) {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/topics`, {
        headers: {
            Accept: 'application/vnd.github.mercy-preview+json', // Enable topics API
        },
    });

    const data = await response.json();
    return data.names;
}

async function displayRepositories(repositories) {
    hideLoader();
    const repositoriesDiv = document.getElementById('repositories');

    for (const repo of repositories) {
        const repoDiv = document.createElement('div');
        repoDiv.classList.add('repo-item');
        repoDiv.innerHTML = `<h3>${repo.name}</h3>
                             <p>${repo.description || 'No description available.'}</p>
                             <div class="topics" id="topics-${repo.name}"></div>`;
        repositoriesDiv.appendChild(repoDiv);

        const topics = await fetchTopics(repo.full_name);
        displayTopics(topics, `topics-${repo.name}`);
    }
}

function displayTopics(topics, containerId) {
    const topicsContainer = document.getElementById(containerId);
    topics.forEach(topic => {
        const topicSpan = document.createElement('span');
        topicSpan.classList.add('topic');
        topicSpan.textContent = topic;
        topicsContainer.appendChild(topicSpan);
    });
}

function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
    document.getElementById('loader').classList.add('hidden');
}

function clearRepositories() {
    document.getElementById('repositories').innerHTML = '';
}

// Pagination handling
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('perPage').value = '10'; // Set default value
    getRepositories();
});

document.getElementById('perPage').addEventListener('change', function() {
    currentPage = 1;
    getRepositories();
});
