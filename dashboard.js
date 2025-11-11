import { demoUsers, schoolData } from "../data/users.js";

const ROLE_LABEL = {
  STUDENT: "Espace Élève",
  PARENT: "Espace Parent",
  TEACHER: "Espace Professeur",
  ADMIN: "Espace Administration",
};

const ROLE_NAVIGATION = {
  STUDENT: [
    { label: "Tableau de bord", anchor: "#dashboard" },
    { label: "Devoirs", anchor: "#assignments" },
    { label: "Notes", anchor: "#grades" },
    { label: "Vie scolaire", anchor: "#attendance" },
  ],
  PARENT: [
    { label: "Vue d'ensemble", anchor: "#dashboard" },
    { label: "Suivi des résultats", anchor: "#grades" },
    { label: "Vie scolaire", anchor: "#attendance" },
    { label: "Communications", anchor: "#communications" },
  ],
  TEACHER: [
    { label: "Cours du jour", anchor: "#schedule" },
    { label: "Travaux à corriger", anchor: "#assignments" },
    { label: "Classes", anchor: "#classes" },
    { label: "Messagerie", anchor: "#communications" },
  ],
  ADMIN: [
    { label: "Statistiques", anchor: "#stats" },
    { label: "Communications", anchor: "#communications" },
    { label: "Ressources", anchor: "#resources" },
    { label: "Vie scolaire", anchor: "#attendance" },
  ],
};

function requireSession(expectedRole) {
  const sessionRaw = sessionStorage.getItem("campusconnect:user");
  if (!sessionRaw) {
    redirectToLogin();
    return null;
  }

  try {
    const session = JSON.parse(sessionRaw);
    if (session.role !== expectedRole) {
      redirectToLogin();
      return null;
    }
    return session;
  } catch (error) {
    console.error("Session invalide", error);
    redirectToLogin();
    return null;
  }
}

function redirectToLogin() {
  window.location.replace("../index.html");
}

function findUserById(id) {
  return demoUsers.find((user) => user.id === id);
}

function getClassById(classId) {
  return schoolData.classes.find((classe) => classe.id === classId);
}

function getSubjectsByTeacher(teacherId) {
  return schoolData.subjects.filter((subject) => subject.teacherId === teacherId);
}

function getSubjectsByClass(classId) {
  return schoolData.subjects.filter((subject) => subject.classId === classId);
}

function getAssignmentsByClass(classId) {
  return schoolData.assignments.filter((assignment) => assignment.classId === classId);
}

function getGradesByStudent(studentId) {
  return schoolData.grades.filter((grade) => grade.studentId === studentId);
}

function getAttendanceByStudent(studentId) {
  return schoolData.attendance.filter((event) => event.studentId === studentId);
}

function getCommunicationsForAudience(role) {
  if (role === "ADMIN") {
    return schoolData.communications;
  }
  const map = {
    STUDENT: ["ALL", "ELEVES"],
    PARENT: ["ALL", "PARENTS"],
    TEACHER: ["ALL", "PERSONNEL", "PROFESSEURS"],
  };
  const audience = map[role] ?? ["ALL"];
  return schoolData.communications.filter((message) => audience.includes(message.audience) || message.audience === role);
}

function buildSidebar(session, expectedRole) {
  const sidebar = document.querySelector(".sidebar");
  const nav = sidebar?.querySelector("nav");
  const logoutBtn = sidebar?.querySelector("#logout-btn");

  if (!sidebar || !nav || !logoutBtn) return;

  sidebar.querySelector(".brand").innerHTML = `
    CampusConnect
    <span>${ROLE_LABEL[expectedRole]}</span>
  `;

  nav.innerHTML = ROLE_NAVIGATION[expectedRole]
    .map((item, index) => `<a href="${item.anchor}" class="${index === 0 ? "active" : ""}">${item.label}</a>`)
    .join("");

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("campusconnect:user");
    redirectToLogin();
  });
}

function fillTopbar(session, user) {
  const title = document.querySelector("#page-title");
  const userMeta = document.querySelector("#user-meta");

  if (title) {
    title.textContent = ROLE_LABEL[session.role];
  }

  if (userMeta) {
    userMeta.innerHTML = `
      <span>${user.firstName} ${user.lastName}</span>
      <span class="badge">${session.role}</span>
    `;
  }
}

function renderStudentDashboard(user, session) {
  const classData = getClassById(user.classId);
  const subjects = getSubjectsByClass(user.classId);
  const assignments = getAssignmentsByClass(user.classId);
  const grades = getGradesByStudent(user.id);
  const attendance = getAttendanceByStudent(user.id);

  const dashboard = document.querySelector("#dashboard-content");
  if (!dashboard) return;

  const timetableRows = subjects
    .flatMap((subject) =>
      subject.schedule.map(
        (slot) => `
        <tr>
          <td>${slot.day}</td>
          <td>${subject.name}</td>
          <td>${slot.start} - ${slot.end}</td>
          <td>${slot.room}</td>
        </tr>
      `
      )
    )
    .join("");

  const gradesRows = grades
    .map((grade) => {
      const subject = schoolData.subjects.find((subjectItem) => subjectItem.id === grade.subjectId);
      return `
        <tr>
          <td>${subject?.name ?? "Matière"}</td>
          <td>${grade.value}/${grade.outOf}</td>
          <td>${grade.description ?? ""}</td>
          <td>${new Date(grade.date).toLocaleDateString("fr-FR")}</td>
        </tr>
      `;
    })
    .join("");

  const attendanceItems = attendance
    .map(
      (event) => `
      <div class="list-item">
        <div>
          <strong>${formatAttendanceType(event.type)}</strong>
          <div class="muted">${new Date(event.date).toLocaleDateString("fr-FR")} · ${event.lesson}</div>
        </div>
        <span class="badge ${event.status === "JUSTIFIEE" ? "success" : "warning"}">${formatAttendanceStatus(event.status)}</span>
      </div>
    `
    )
    .join("");

  dashboard.innerHTML = `
    <section class="grid two" id="dashboard">
      <article class="card">
        <header>
          <h2>Cours de la semaine</h2>
          <span class="muted">${classData?.name ?? "Classe"}</span>
        </header>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Matière</th>
              <th>Horaires</th>
              <th>Salle</th>
            </tr>
          </thead>
          <tbody>
            ${timetableRows || `<tr><td colspan="4">Aucun cours trouvé.</td></tr>`}
          </tbody>
        </table>
      </article>
      <article class="card" id="assignments">
        <header>
          <h2>Devoirs à venir</h2>
          <span class="badge">${assignments.length} devoir(s)</span>
        </header>
        <div class="list">
          ${
            assignments.length
              ? assignments
                  .map(
                    (assignment) => `
                  <div class="list-item">
                    <div>
                      <strong>${assignment.title}</strong>
                      <div class="muted">
                        À rendre le ${new Date(assignment.dueDate).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <span class="badge">${getSubjectName(assignment.subjectId)}</span>
                  </div>
                `
                  )
                  .join("")
              : `<p class="muted">Aucun devoir à venir.</p>`
          }
        </div>
      </article>
    </section>
    <section class="card" id="grades">
      <header>
        <h2>Mes notes</h2>
      </header>
      <table>
        <thead>
          <tr>
            <th>Matière</th>
            <th>Résultat</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${gradesRows || `<tr><td colspan="4">Aucune note enregistrée.</td></tr>`}
        </tbody>
      </table>
    </section>
    <section class="card" id="attendance">
      <header>
        <h2>Vie scolaire</h2>
      </header>
      <div class="list">
        ${
          attendanceItems ||
          `<p class="muted">Aucun événement de vie scolaire enregistré.</p>`
        }
      </div>
    </section>
  `;
}

function getSubjectName(subjectId) {
  return schoolData.subjects.find((subject) => subject.id === subjectId)?.name ?? "Matière";
}

function formatAttendanceType(type) {
  const mapping = {
    ABSENCE: "Absence",
    RETARD: "Retard",
    SANCTION: "Sanction",
  };
  return mapping[type] ?? type;
}

function formatAttendanceStatus(status) {
  const mapping = {
    JUSTIFIEE: "Justifiée",
    NON_JUSTIFIE: "À justifier",
    EN_ATTENTE: "En attente",
  };
  return mapping[status] ?? status;
}

function renderParentDashboard(user, session) {
  const dashboard = document.querySelector("#dashboard-content");
  if (!dashboard) return;

  const studentCards = (user.children ?? [])
    .map((studentId) => {
      const student = findUserById(studentId);
      if (!student) return "";
      const classData = getClassById(student.classId);
      const grades = getGradesByStudent(student.id);
      const attendance = getAttendanceByStudent(student.id);
      const assignments = getAssignmentsByClass(student.classId);

      const average =
        grades.length > 0
          ? (grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length).toFixed(1)
          : "—";

      return `
        <article class="card">
          <header>
            <h2>${student.firstName} ${student.lastName}</h2>
            <span class="badge">${classData?.name ?? "Classe"}</span>
          </header>
          <div class="grid two">
            <div>
              <p class="muted">Moyenne générale</p>
              <p class="highlight">${average}</p>
            </div>
            <div>
              <p class="muted">Devoirs à rendre</p>
              <p class="highlight">${assignments.length}</p>
            </div>
          </div>
          <div class="list" id="grades">
            ${grades
              .map(
                (grade) => `
              <div class="list-item">
                <div>
                  <strong>${getSubjectName(grade.subjectId)}</strong>
                  <div class="muted">${grade.description ?? ""}</div>
                </div>
                <span class="badge">${grade.value}/${grade.outOf}</span>
              </div>
            `
              )
              .join("") || `<p class="muted">Aucune note pour le moment.</p>`}
          </div>
          <hr />
          <div class="list" id="attendance">
            ${attendance
              .map(
                (event) => `
                <div class="list-item">
                  <div>
                    <strong>${formatAttendanceType(event.type)}</strong>
                    <div class="muted">${new Date(event.date).toLocaleDateString("fr-FR")} · ${event.lesson}</div>
                  </div>
                  <span class="badge ${event.status === "JUSTIFIEE" ? "success" : "warning"}">
                    ${formatAttendanceStatus(event.status)}
                  </span>
                </div>
              `
              )
              .join("") || `<p class="muted">Aucun événement de vie scolaire.</p>`}
          </div>
        </article>
      `;
    })
    .join("");

  const communications = getCommunicationsForAudience(session.role);

  dashboard.innerHTML = `
    <section class="grid two" id="dashboard">
      ${studentCards || `<p class="muted">Aucun enfant rattaché pour l'instant.</p>`}
    </section>
    <section class="card" id="communications">
      <header>
        <h2>Communications de l'établissement</h2>
      </header>
      <div class="list">
        ${
          communications.length
            ? communications
                .map(
                  (message) => `
                <div class="list-item">
                  <div>
                    <strong>${message.title}</strong>
                    <div class="muted">${new Date(message.date).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <span>${message.content}</span>
                </div>
              `
                )
                .join("")
            : `<p class="muted">Aucun message pour le moment.</p>`
        }
      </div>
    </section>
  `;
}

function renderTeacherDashboard(user, session) {
  const dashboard = document.querySelector("#dashboard-content");
  if (!dashboard) return;

  const subjects = getSubjectsByTeacher(user.id);
  const classes = schoolData.classes.filter((classe) => classe.headTeacher === user.id);

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(new Date());
  const todaysCourses = subjects
    .flatMap((subject) =>
      subject.schedule
        .filter((slot) => slot.day.toLowerCase() === capitalize(today).toLowerCase())
        .map((slot) => ({ ...slot, subject }))
    )
    .sort((a, b) => a.start.localeCompare(b.start));

  const assignmentsToReview = schoolData.assignments.filter((assignment) => assignment.teacherId === user.id);

  const communications = getCommunicationsForAudience(session.role);

  dashboard.innerHTML = `
    <section class="grid two" id="schedule">
      <article class="card">
        <header>
          <h2>Cours du jour</h2>
          <span class="muted">${capitalize(today)}</span>
        </header>
        <div class="list">
          ${
            todaysCourses.length
              ? todaysCourses
                  .map(
                    (course) => `
                  <div class="list-item">
                    <div>
                      <strong>${course.subject.name}</strong>
                      <div class="muted">${course.subject.classId} · ${course.room}</div>
                    </div>
                    <span class="badge">${course.start} - ${course.end}</span>
                  </div>
                `
                  )
                  .join("")
              : `<p class="muted">Aucun cours planifié aujourd'hui.</p>`
          }
        </div>
      </article>
      <article class="card" id="assignments">
        <header>
          <h2>Travaux à corriger</h2>
          <span class="badge">${assignmentsToReview.length}</span>
        </header>
        <div class="list">
          ${
            assignmentsToReview.length
              ? assignmentsToReview
                  .map(
                    (assignment) => `
                  <div class="list-item">
                    <div>
                      <strong>${assignment.title}</strong>
                      <div class="muted">${getClassById(assignment.classId)?.name ?? assignment.classId}</div>
                    </div>
                    <span class="badge">${new Date(assignment.dueDate).toLocaleDateString("fr-FR")}</span>
                  </div>
                `
                  )
                  .join("")
              : `<p class="muted">Pas de corrections en attente.</p>`
          }
        </div>
      </article>
    </section>
    <section class="card" id="classes">
      <header>
        <h2>Classes suivies</h2>
      </header>
      <div class="list">
        ${
          classes.length
            ? classes
                .map(
                  (classe) => `
                  <div class="list-item">
                    <div>
                      <strong>${classe.name}</strong>
                      <div class="muted">${classe.students.length} élève(s)</div>
                    </div>
                    <span class="badge">${classe.id}</span>
                  </div>
                `
                )
                .join("")
            : `<p class="muted">Vous n'êtes pas professeur principal.</p>`
        }
      </div>
    </section>
    <section class="card" id="communications">
      <header>
        <h2>Derniers messages</h2>
      </header>
      <div class="list">
        ${
          communications.length
            ? communications
                .map(
                  (message) => `
                  <div class="list-item">
                    <div>
                      <strong>${message.title}</strong>
                      <div class="muted">${new Date(message.date).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <span>${message.content}</span>
                  </div>
                `
                )
                .join("")
            : `<p class="muted">Aucun message pour l'instant.</p>`
        }
      </div>
    </section>
  `;
}

function renderAdminDashboard() {
  const dashboard = document.querySelector("#dashboard-content");
  if (!dashboard) return;

  const totalStudents = schoolData.classes.reduce((sum, classe) => sum + classe.students.length, 0);
  const totalTeachers = demoUsers.filter((user) => user.role === "TEACHER").length;
  const totalClasses = schoolData.classes.length;
  const totalAssignments = schoolData.assignments.length;
  const attendanceEvents = schoolData.attendance.length;
  const communications = getCommunicationsForAudience("ADMIN");

  dashboard.innerHTML = `
    <section class="grid three" id="stats">
      <article class="card">
        <header><h2>Élèves</h2></header>
        <p class="highlight">${totalStudents}</p>
        <p class="muted">Répartis sur ${totalClasses} classes</p>
      </article>
      <article class="card">
        <header><h2>Professeurs</h2></header>
        <p class="highlight">${totalTeachers}</p>
        <p class="muted">Enseignants actifs</p>
      </article>
      <article class="card">
        <header><h2>Devoirs publiés</h2></header>
        <p class="highlight">${totalAssignments}</p>
        <p class="muted">Sur la période en cours</p>
      </article>
    </section>
    <section class="grid two">
      <article class="card" id="attendance">
        <header>
          <h2>Vie scolaire</h2>
          <span class="badge">${attendanceEvents} événement(s)</span>
        </header>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Élève</th>
              <th>Type</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${
              schoolData.attendance
                .map((event) => {
                  const student = findUserById(event.studentId);
                  return `
                  <tr>
                    <td>${new Date(event.date).toLocaleDateString("fr-FR")}</td>
                    <td>${student?.firstName ?? ""} ${student?.lastName ?? ""}</td>
                    <td>${formatAttendanceType(event.type)}</td>
                    <td>${formatAttendanceStatus(event.status)}</td>
                  </tr>
                `;
                })
                .join("") || `<tr><td colspan="4">Aucun événement enregistré.</td></tr>`
            }
          </tbody>
        </table>
      </article>
      <article class="card" id="resources">
        <header>
          <h2>Tâches administratives</h2>
        </header>
        <div class="list">
          <div class="list-item">
            <div>
              <strong>Importer les nouveaux élèves</strong>
              <div class="muted">Fichier CSV attendu du rectorat</div>
            </div>
            <span class="badge warning">À faire</span>
          </div>
          <div class="list-item">
            <div>
              <strong>Mettre à jour l'annuaire</strong>
              <div class="muted">Professeurs contractuels</div>
            </div>
            <span class="badge success">En cours</span>
          </div>
        </div>
      </article>
    </section>
    <section class="card" id="communications">
      <header>
        <h2>Communications envoyées</h2>
      </header>
      <div class="list">
        ${
          communications.length
            ? communications
                .map(
                  (message) => `
                <div class="list-item">
                  <div>
                    <strong>${message.title}</strong>
                    <div class="muted">
                      ${new Date(message.date).toLocaleDateString("fr-FR")} · Audience : ${message.audience}
                    </div>
                  </div>
                  <span>${message.content}</span>
                </div>
              `
                )
                .join("")
            : `<p class="muted">Aucune communication récente.</p>`
        }
      </div>
    </section>
  `;
}

function capitalize(string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function initDashboard(expectedRole) {
  const session = requireSession(expectedRole);
  if (!session) return;

  const fullUser = findUserById(session.id);
  if (!fullUser) {
    redirectToLogin();
    return;
  }

  buildSidebar(session, expectedRole);
  fillTopbar(session, fullUser);

  switch (expectedRole) {
    case "STUDENT":
      return renderStudentDashboard(fullUser, session);
    case "PARENT":
      return renderParentDashboard(fullUser, session);
    case "TEACHER":
      return renderTeacherDashboard(fullUser, session);
    case "ADMIN":
      return renderAdminDashboard(fullUser, session);
    default:
      console.warn("Rôle non géré", expectedRole);
      redirectToLogin();
  }
}

