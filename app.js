import { demoUsers } from "../data/users.js";

const loginForm = document.querySelector("#login-form");
const feedback = document.querySelector("#login-feedback");
const credentialsModal = document.querySelector("#credentials-modal");
const credentialsTable = document.querySelector("#credentials-table");
const showDemoButton = document.querySelector("#show-demo-credentials");
const closeModalButton = document.querySelector("#close-modal");

const roleToPage = {
  STUDENT: "pages/student.html",
  PARENT: "pages/parent.html",
  TEACHER: "pages/teacher.html",
  ADMIN: "pages/admin.html",
};

function populateCredentialsTable() {
  credentialsTable.innerHTML = demoUsers
    .map(
      (user) => `
      <tr>
        <td>${formatRole(user.role)}</td>
        <td>${user.email}</td>
        <td>${user.password}</td>
      </tr>
    `
    )
    .join("");
}

function formatRole(role) {
  const labels = {
    STUDENT: "Élève",
    PARENT: "Parent",
    TEACHER: "Professeur",
    ADMIN: "Administration",
  };
  return labels[role] ?? role;
}

function openModal() {
  if (!credentialsModal.open) {
    credentialsModal.showModal();
  }
}

function closeModal() {
  if (credentialsModal.open) {
    credentialsModal.close();
  }
}

function findUserByCredentials(email, password) {
  return demoUsers.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    feedback.textContent = "Veuillez renseigner vos identifiants.";
    return;
  }

  const matchedUser = findUserByCredentials(email, password);

  if (!matchedUser) {
    feedback.textContent = "Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.";
    loginForm.reset();
    return;
  }

  feedback.textContent = "";
  const sessionPayload = {
    id: matchedUser.id,
    role: matchedUser.role,
    email: matchedUser.email,
    firstName: matchedUser.firstName,
    lastName: matchedUser.lastName,
  };

  sessionStorage.setItem("campusconnect:user", JSON.stringify(sessionPayload));

  const destination = roleToPage[matchedUser.role];
  if (!destination) {
    feedback.textContent = "Aucune page associée à ce rôle.";
    return;
  }

  window.location.href = destination;
}

function init() {
  populateCredentialsTable();
  loginForm.addEventListener("submit", handleLogin);
  showDemoButton.addEventListener("click", openModal);
  closeModalButton.addEventListener("click", closeModal);
  credentialsModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
  });
}

init();

