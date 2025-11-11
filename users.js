export const demoUsers = [
  {
    id: "student-1",
    role: "STUDENT",
    email: "emma.dupont@ecole.fr",
    password: "eleve123",
    firstName: "Emma",
    lastName: "Dupont",
    classId: "6A",
  },
  {
    id: "parent-1",
    role: "PARENT",
    email: "parent.dupont@ecole.fr",
    password: "parent123",
    firstName: "Sophie",
    lastName: "Dupont",
    children: ["student-1"],
  },
  {
    id: "teacher-1",
    role: "TEACHER",
    email: "nicolas.bernard@ecole.fr",
    password: "prof123",
    firstName: "Nicolas",
    lastName: "Bernard",
    subjects: ["maths-6A", "maths-6B"],
  },
  {
    id: "admin-1",
    role: "ADMIN",
    email: "secretariat@ecole.fr",
    password: "admin123",
    firstName: "Camille",
    lastName: "Martin",
  },
];

export const schoolData = {
  classes: [
    {
      id: "6A",
      name: "6ème A",
      headTeacher: "teacher-1",
      students: ["student-1"],
    },
    {
      id: "6B",
      name: "6ème B",
      headTeacher: "teacher-1",
      students: [],
    },
  ],
  subjects: [
    {
      id: "maths-6A",
      name: "Mathématiques",
      classId: "6A",
      teacherId: "teacher-1",
      schedule: [
        { day: "Lundi", start: "09:00", end: "10:00", room: "Salle 204" },
        { day: "Jeudi", start: "11:00", end: "12:00", room: "Salle 204" },
      ],
    },
    {
      id: "maths-6B",
      name: "Mathématiques",
      classId: "6B",
      teacherId: "teacher-1",
      schedule: [
        { day: "Mardi", start: "10:00", end: "11:00", room: "Salle 205" },
        { day: "Vendredi", start: "08:00", end: "09:00", room: "Salle 205" },
      ],
    },
  ],
  assignments: [
    {
      id: "assignment-1",
      title: "Résolution d'équations",
      subjectId: "maths-6A",
      dueDate: "2025-11-15",
      description: "Résoudre les exercices 3 à 8 page 42.",
      classId: "6A",
    },
  ],
  grades: [
    {
      id: "grade-1",
      studentId: "student-1",
      subjectId: "maths-6A",
      teacherId: "teacher-1",
      value: 15.5,
      outOf: 20,
      weight: 1,
      description: "Contrôle chapitre 2",
      date: "2025-10-30",
    },
  ],
  attendance: [
    {
      id: "abs-1",
      studentId: "student-1",
      type: "ABSENCE",
      status: "JUSTIFIEE",
      date: "2025-10-12",
      lesson: "maths-6A",
      comments: "Consultation médicale",
    },
    {
      id: "late-1",
      studentId: "student-1",
      type: "RETARD",
      status: "NON_JUSTIFIE",
      date: "2025-10-20",
      lesson: "maths-6A",
      comments: "Arrivée à 09h05",
    },
  ],
  communications: [
    {
      id: "msg-1",
      audience: "PARENTS",
      title: "Réunion parents-professeurs",
      content: "Réunion le 24 novembre à 18h00 en salle polyvalente.",
      authorId: "admin-1",
      date: "2025-11-05",
    },
  ],
};

