import { createStore } from 'vuex'
const store = createStore({
  state: {
    projects: [],
    project_current_name: [],
    project_current_id: [],
    projectNameLst: [],
    usersname:[],
    username_lst: [],
    users_names: [],
    selectedPage: "loading",
    showEditProject: false,
    showEditTask: false,
    showEditPosts: false,
    projectEdit: [],
    taskEdit: [],
    postEdit: [],
    currentTasks: [],
    completedTasks: [],
    showAlert: false,
    showAlertSuccess: false,
    showAlertWorm: false,
    showAlertCompleted: false,
    showAlertTaskWorm: false,
    showAlertTaskCompleted: false,
    currentposts:[],
    postsCompleted: [],
    dates: [],
    current_user: [],
    user_current_tasks: [],
    user_current_posts: [],
    user_completed_tasks: [],
    user_completed_posts: [],
    user_task_current_posts: [],
    chose_user_current_tasks: [],
    chose_user_current_posts: [],
    tasks_length: [],
    lodingArchive: false,
    currentTask: '',
    filterposts: [],
    currentTaskId: '',
    loding: false,
    selectedUser: '',
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
    SET_CURRENT_TASKS(state, data) {
      state.currentTasks = data
    },
    SET_COMPLETED_TASKS(state, data) {
      state.completedTasks = data
    },
    SET_SHOW_ALERT(state, data) {
      state.showAlert = data;
      setTimeout(() => {
        state.showAlert = false;
      }, 3000);
    },
    SET_SHOW_ALERT_SUCCESS(state,data) {
      state.showAlertSuccess = data;
      setTimeout(() => {
        state.showAlertSuccess = false;
      }, 3000);
    },
    SET_SHOW_ALERT_WORM(state, data){
      state.showAlertWorm = data;
      setTimeout(() => {
        state.showAlertWorm = false;
      }, 3000);
    },
    SET_SHOW_ALERT_COMPLETED(state,data) {
      state.showAlertCompleted = data
      setTimeout(() => {
        state.showAlertCompleted = false;
      }, 3000);
    },
    SET_SHOW_ALERT_TASK_WORM(state,data) {
      state.showAlertTaskWorm = data
      setTimeout(() => {
        state.showAlertTaskWorm = false;
      }, 3000);
    },
    SET_SHOW_ALERT_TASK_COMPLETED(state,data) {
      state.showAlertTaskCompleted = data
      setTimeout(() => {
        state.showAlertTaskCompleted = false;
      }, 3000);
    },
    SET_POSTS_COMPLETED(state, data) {
      state.postsCompleted = data
    },
    SET_POSTS_CURRENT(state,data){
      state.currentposts = data
    },
    SET_DATES(state, data) {
      state.dates = data;
    },
    SET_USERS_NAME(state,data) {
      state.usersname = data
    },
    SET_USER_NAME_LST(state, data){
      state.username_lst = data
    },
    SET_USERS_NAMES(state,data) {
      state.users_names = data
    },
    SET_PROJECT_NAME_CURRENT(state,data){
      state.project_current_name = data
    },
    SET_PROJECT_NAME_LIST(state, data){
      state.projectNameLst = data
    },
    SET_PROJECT_ID_CURRENR(state, data){
      state.project_current_id = data
    },
    SET_CURRENT_USER(state,data) {
      state.current_user = data
    },
    SET_USER_CURRENT_TASKS(state,data) {
      state.user_current_tasks = data
    },
    SET_USER_CURRENT_POSTS(state,data) {
      state.user_current_posts = data
    },
    SET_USER_COMLETED_TASKS(state,data) {
      state.user_completed_tasks = data
    },
    SET_USER_COMLETED_POSTS(state,data) {
      state.user_completed_posts = data
    },
    SET_LODING_ARCHIVE(state,data) {
      state.lodingArchive = data
    },
    SET_LODING(state,data){
      state.loding = data
    },
    SET_SHOW_EDIT_POST(state,data) {
      state.showEditPosts = data
    },
    SET_EDIT_POST(state,data) {
      state.postEdit = data
    },
    SET_POST_EDIT_NAME(state,data) {
      state.postEdit.post.name = data
    },
    SET_POST_EDIT_DESCRIPTION(state,data) {
      state.postEdit.post.description = data
    },
    SET_POST_EDIT_DEADLINE(state,data) {
      state.postEdit.post.deadline = data
    },
    SET_POST_EDIT_TASK(state,data) {
      state.postEdit.post.task = data
    },
    SET_CURRENT_TASK(state,data) {
      state.currentTask = data
    },
    SET_FILTER_POSTS(state,data) {
      state.filterposts = data
    },
    SET_CURRENT_ID_TASK(state,data) {
      state.currentTaskId = data
    },
    SET_USER_TASK_CURRUNT_POSTS(state,data) {
      state.user_task_current_posts = data
    },
    SET_CHOSE_USER_CURRENT_TASKS(state,data) {
      state.chose_user_current_tasks = data
    },
    SET_CHOSE_USER_CURRENT_POSTS(state,data) {
      state.chose_user_current_posts = data
    },
    SET_TASKS_LENGTH(state,data) {
      state.tasks_length = data
    },
    SET_SELECTED_USER(state,data) {
      state.selectedUser = data
    },
  },
  actions: {
  },
  modules: {
  },
})

export default store;