import { GitHubUserFetch } from "./GitHubData.js";

// Managing Data
export class GitFavData {
  constructor(root) {
    this.root = document.querySelector(root);
    this.loadFromLocalStorage();
  };

  async userSearch(username) {
    try {
      const userExists = this.entries.find(entry => entry.login.toLowerCase() == username.toLowerCase());
      if(userExists) {
        throw new Error('User is already added.')
      };

      const user = await GitHubUserFetch.GitHubDataSearch(username);

      if(user.login == undefined) {
        throw new Error('Invalid username!');
      };
      if(userExists) {
        throw new Error('User is already added.')
      };

      this.entries = [user, ...this.entries];
      this.updateTable();
      this.saveInLocalStorage();

    } catch(error) {
      alert(error.message);
    };
  };

  deleteRow(user) {
    this.entries = this.entries.filter(entry => entry.login !== user.login);

    this.updateTable();
    this.saveInLocalStorage();
  };

  loadFromLocalStorage() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) ?? [];
  };
  saveInLocalStorage() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  };

};

// Managing Elements
export class GitFavView extends GitFavData {
  constructor(containerElement) {
    super(containerElement);

    this.tbody = this.root.querySelector("tbody");

    this.updateTable();
    this.userAdd();
  };

  userAdd() {
    this.root.querySelector("#input-wrapper, button").addEventListener("click", () => {
      const {value} = this.root.querySelector("#input-wrapper, input");
      
      this.userSearch(value);
    });
  };

  updateTable() {
    this.cleanTable();
    
    this.entries.forEach(user => {

      const row = this.createRow();
    
      row.querySelector("a").href = `https://github.com/${user.login}`; 
      row.querySelector(".user-wrap img").src = `https://github.com/${user.login}.png`; 
      row.querySelector(".user-wrap img").alt = `Image of ${user.login}`; 
      row.querySelector(".user strong").innerText = user.name;
      row.querySelector(".user span").textContent = user.login; 
      row.querySelector(".repositories").textContent = user.public_repos; 
      row.querySelector(".followers").textContent = user.followers;
      
      this.tbody.append(row);

      this.userDeleteInstance(row, user);
    });

    this.noFavoritesValidation();
  };

  cleanTable() {
    this.tbody.querySelectorAll("tr")
    .forEach(element => element.remove());
  };

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <tr>
      <td>
        <a target="_blank" href="#">
          <div class="user-wrap">
            <img src="./assets/img/image.svg" alt="Image of user">
           <div class="user">
              <strong>UserName</strong>
              <span>UserLogin</span>
            </div>
          </div>
        </a>
      </td>
      <td class="repositories">123</td>
      <td class="followers">1234</td>
      <td>
        <button class="remove-button">Remove</button>
      </td>
      </tr>
      `;

      return tr;
  };

  userDeleteInstance(row, user) {
    row.querySelector("td .remove-button").onclick = () => {
      const confirmation = confirm("Are you sure to delete this user from your favorites?");
      if(confirmation){
        this.deleteRow(user);
      };
    };
  };

  noFavoritesValidation() {
    const htmlDocument = document.documentElement;
    if (this.entries[0] == undefined) {
      htmlDocument.classList.add("no-favorite-profile");
    } else {
      htmlDocument.classList.remove("no-favorite-profile");
    };

  };

};

// Pendence -> Bug fix
// Not allow same user be added several times on a short time window.
// Why when it happens only the last "Remove" button works?