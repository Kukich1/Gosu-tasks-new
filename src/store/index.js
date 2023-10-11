import { createStore } from 'vuex'
const store = createStore({
  state: {
    projects: [],
    projectname: [],
    selectedPage: "loading",
    showEditProject: false,
    projectEdit: [],
    tasks: [],
    currentTasks: [],
    completedTasks: [],
    showEditTask: false,
    taskEdit: [],
  },
  getters: {
  },
  mutations: {
    SET_PROJECTS(state, data) {
      state.projects = data;
    },
    SET_SELECTED_PAGE(state, data) {
      state.selectedPage = data;
    },
    SET_PROJECT_EDIT(state, data) {
      state.projectEdit = data;
    },
    SET_PROJECT_EDIT_NAME(state, data) {
      state.projectEdit.project.name = data;
    },
    SET_PROJECT_EDIT_DESCRIPTION(state, data) {
      state.projectEdit.project.description = data;
    },
    SET_PROJECT_EDIT_DEADLINE(state, data) {
      state.projectEdit.project.deadline = data;
    },
    SET_PROJECT_EDIT_MEMBERS(state, data) {
      state.projectEdit.project.members = data
    },
    SET_SHOW_EDIT_PROJECT(state, data) {
      state.showEditProject = data;
    },
    SET_PROJECTNAME(state, data) {
      state.projectname = data;
    },
    SET_TASKS(state, data) {
      state.tasks = data
    },
    SET_SHOW_EDIT_TASK(state, data) {
      state.showEditTask = data
    },
    SET_TASK_EDIT(state, data) {
      state.taskEdit = data
    },
    SET_TASK_EDIT_NAME(state, data) {
      state.taskEdit.task.name = data
    },
    SET_TASK_EDIT_DESCRIPTION(state, data) {
      state.taskEdit.task.description = data
    },
    SET_TASK_EDIT_DEADLINE(state, data) {
      state.taskEdit.task.deadline = data
    },
    SET_TASK_EDIT_MEMBERS(state, data) {
      state.taskEdit.task.members = data
    },
    SET_TASK_EDIT_PROJECT(state, data) {
      state.taskEdit.task.project = data
    },
    SET_CURRENT_TASKS(state, data){
      state.currentTasks = data
    },
    SET_COMPLETED_TASKS(state, data){
      state.completedTasks = data
    },
  },
  actions: {
  },
  modules: {
  },
})

export default store;