import { createStore } from 'vuex'
const store = createStore({
  state: {
    projects: [],
    selectedPage: "loading",
    selectedTab: ""
  },
  getters: {
  },
  mutations: {
    SET_PROJECTS(state, data) {
      state.projects = data;
    },
    SET_SELECTED_PAGE(state, data) {
      state.selectedPage = data;
    }
  },
  actions: {
    setProjects({ commit }, data) {
      commit("SET_PROJECTS", data);
    },
    setSelectedPage({ commit }, data) {
      commit("SET_SELECTED_PAGE", data)
    }
  },
  modules: {
  },
})

export default store;