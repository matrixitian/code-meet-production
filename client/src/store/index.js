import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    projectForEdit: {},
    createOrEditProject: 'create',
    projectsOrMyProjects: 'projects',
    idForSearch: null,
    currentLayout: null,
    searchFromNotification: {
      id: null,
      emitType: null
    },
    tags: [],
    timesRequestedNewLoad: 0
  },
  mutations: {
    setProjectForEdit(state, val) {
      state.projectForEdit = val
    },
    setCreateOrEditProject(state, val) {
      state.createOrEditProject = val
    },
    setProjectOrMyProjects(state, val) {
      state.projectsOrMyProjects = val
    },
    setSearchFromNotification(state, data) {
      state.searchFromNotification.id = data.id
      state.searchFromNotification.emitType = data.emitType
    },
    addTagsForFiltering(state, tags) {
      state.tags = tags
    },
    timesRequestedNewLoad(state, received) {
      state.timesRequestedNewLoad = received
    },
    setLayout(state, layout) {
      state.currentLayout = layout
    }
  },
  actions: {
  },
  getters: {
    getTagsForFiltering(state) {
      return state.tags
    },
    timesRequestedNewLoad(state) {
      return state.timesRequestedNewLoad
    },
    projectsOrMyProjects(state) {
      return state.projectsOrMyProjects
    },
    createOrEditProject(state) {
      return state.createOrEditProject
    },
    projectForEdit(state) {
      return state.projectForEdit
    }
  }
})
