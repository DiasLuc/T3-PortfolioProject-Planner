const seededUsers = [
  { id: "user-001", username: "alice", password: "planner123" },
  { id: "user-002", username: "bruno", password: "planner123" },
  { id: "user-003", username: "carla", password: "planner123" }
];

const seededTasks = [
  { id: "task-0001", userId: "user-001", date: "2026-05-01", startTime: "07:00", endTime: "07:45", title: "Stretching", notes: "Living room routine" },
  { id: "task-0002", userId: "user-001", date: "2026-05-01", startTime: "09:00", endTime: "11:00", title: "API design", notes: "Draft routes and controllers" },
  { id: "task-0003", userId: "user-001", date: "2026-05-01", startTime: "14:00", endTime: "15:00", title: "Grocery pickup", notes: "Buy fruit and bread" },
  { id: "task-0004", userId: "user-001", date: "2026-05-02", startTime: "08:00", endTime: "09:00", title: "Morning run", notes: "Park loop" },
  { id: "task-0005", userId: "user-001", date: "2026-05-02", startTime: "10:00", endTime: "12:00", title: "Read planner requirements", notes: "Review Jira scope" },
  { id: "task-0006", userId: "user-001", date: "2026-05-03", startTime: "13:00", endTime: "14:00", title: "Lunch with Ana", notes: "Cafe downtown" },
  { id: "task-0007", userId: "user-001", date: "2026-05-04", startTime: "09:30", endTime: "10:15", title: "Call bank", notes: "Resolve card limit" },
  { id: "task-0008", userId: "user-001", date: "2026-05-05", startTime: "15:00", endTime: "16:30", title: "Study JWT", notes: "Middleware examples" },
  { id: "task-0009", userId: "user-001", date: "2026-05-06", startTime: "18:00", endTime: "19:00", title: "Cook dinner", notes: "Pasta and salad" },
  { id: "task-0010", userId: "user-001", date: "2026-05-07", startTime: "11:00", endTime: "12:00", title: "Portfolio notes", notes: "Write implementation summary" },

  { id: "task-0011", userId: "user-002", date: "2026-05-01", startTime: "06:30", endTime: "07:00", title: "Meditation", notes: "Breathing practice" },
  { id: "task-0012", userId: "user-002", date: "2026-05-01", startTime: "08:00", endTime: "09:30", title: "Team sync", notes: "Weekly alignment" },
  { id: "task-0013", userId: "user-002", date: "2026-05-02", startTime: "10:00", endTime: "11:00", title: "Bug triage", notes: "Review open issues" },
  { id: "task-0014", userId: "user-002", date: "2026-05-03", startTime: "12:30", endTime: "13:00", title: "Lunch break", notes: "Quick meal" },
  { id: "task-0015", userId: "user-002", date: "2026-05-04", startTime: "14:00", endTime: "15:30", title: "Implement auth", notes: "JWT middleware" },
  { id: "task-0016", userId: "user-002", date: "2026-05-05", startTime: "16:00", endTime: "17:00", title: "Gym", notes: "Leg day" },
  { id: "task-0017", userId: "user-002", date: "2026-05-06", startTime: "09:00", endTime: "10:00", title: "Doctor appointment", notes: "Annual checkup" },
  { id: "task-0018", userId: "user-002", date: "2026-05-07", startTime: "19:00", endTime: "20:00", title: "Dinner with family", notes: "Parents house" },

  { id: "task-0019", userId: "user-003", date: "2026-05-01", startTime: "07:30", endTime: "08:15", title: "Yoga", notes: "Video session" },
  { id: "task-0020", userId: "user-003", date: "2026-05-01", startTime: "10:00", endTime: "11:00", title: "Write README draft", notes: "Project setup section" },
  { id: "task-0021", userId: "user-003", date: "2026-05-02", startTime: "13:00", endTime: "14:00", title: "Market", notes: "Weekly groceries" },
  { id: "task-0022", userId: "user-003", date: "2026-05-03", startTime: "09:00", endTime: "10:30", title: "Watch Express tutorial", notes: "Routing module" },
  { id: "task-0023", userId: "user-003", date: "2026-05-04", startTime: "11:00", endTime: "12:00", title: "Laundry", notes: "Bedsheets too" },
  { id: "task-0024", userId: "user-003", date: "2026-05-05", startTime: "14:00", endTime: "15:00", title: "Mock API calls", notes: "Postman collection" },
  { id: "task-0025", userId: "user-003", date: "2026-05-06", startTime: "17:30", endTime: "18:30", title: "Walk dog", notes: "Riverside path" },
  { id: "task-0026", userId: "user-003", date: "2026-05-07", startTime: "20:00", endTime: "21:00", title: "Read", notes: "Finish current chapter" }
];

module.exports = {
  seededUsers,
  seededTasks
};
