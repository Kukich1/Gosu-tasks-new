import { createStore } from 'vuex'

const store = createStore({
  state: {
    projects: [],
  },
  getters: {
  },
  mutations: {
    SET_PROJECTS(state, data) {
      state.projects = data;
    }
  },
  actions: {
    setProjects({ commit }, data) {
      commit("SET_PROJECTS", data);
    }
  },
  modules: {
  },
})

export default store;