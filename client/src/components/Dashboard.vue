<template>
  <div id="main">
    <div id="db-first">
      <button @click="toggleCreator()">Create Project</button>
      <Search id="Search" />
    </div>
    <div id="db-second">
      <button id="Users" @click="setLayout('users')">Users</button>
      <button @click="setLayout('projects')">Projects</button>
      <button @click="setLayout('myProjects')">My projects</button>
    </div>
    <div id="Layouts">
      <div id="projects">
        <!-- Project Creation -->
        <ProjectCreator v-if="layout == 'project-creator'"/>
        <!-- Users -->
        <keep-alive>
          <Users v-if="layout == 'users'" id="Users"/>
        </keep-alive>
        <!-- Projects -->
        <keep-alive>
          <Projects v-if="layout == 'projects' || layout == 'myProjects'" id="Projects"/>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import Axios from 'axios'
import config from '../../../dev.env'
import ProjectCreator from './parts/ProjectCreator'
import Projects from './parts/Projects'
import Search from './parts/Search'
import Users from './parts/Users'
const log = console.log

export default {
  name: 'Dashboard',
  components: {ProjectCreator, Projects, Search, Users},
  data() {
    return {
      layout: "projects",
      projects: null
    }
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setLayout') {
        this.setLayout(state.currentLayout)
      }
    })
  },
  methods: {
    setLayout(layout) {
      this.$store.commit('setProjectOrMyProjects', layout)

      this.layout = layout
    },
    toggleCreator() {
      if (this.layout != 'project-creator') {
        this.layout = 'project-creator'
        this.$store.commit('setCreateOrEditProject', 'create')
      }
      else {
        this.$store.commit('setProjectOrMyProjects', 'projects')
        this.layout = 'projects'
      } 
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem('user'))

    if (user) {
      const dbProjects = await Axios({
        method: 'post',
        url: 'http://localhost:3000/projects',
        data: {
          timesRequestedNewLoad: 0
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      this.projects = dbProjects.data

      log(this.projects)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/centerX';

#Search {
  z-index: 2;
  @include centerX;
  top: 22px;
}

#Projects {
  z-index: 1;
  width: 100%;
  // height: 60%;
}

  div {
    width: 100%;
    #db-first {
      // background-color: rgb(116, 107, 107);
      // border: 1px solid black;
      position: relative;
      button {
        margin: 20px;
        padding: 10px 15px 10px 15px;
        border-radius: 4px;
        border: none;
        outline: none;
        background-color: rgb(136, 23, 165);
        font-weight: bold;
        color: white;
        box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: 0.25s ease;
        &:hover {
          background-color: rgb(152, 33, 182);
          box-shadow: 1px 1px 10px 1px rgba(0, 0, 0, 0.2);
        }
      }
    }
    #db-second {
      // background-color: rgb(113, 184, 101);
      text-align: center;
      button {
        // margin: 20px;
        padding: 10px 15px 10px 15px;
        border: none;
        outline: none;
      }
      button:first-child {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
      button:nth-child(3) {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }
    }
    #Layouts {
      // background-color: rgb(41, 116, 27);
      height: 100vh;
      div#projects {
        display: inline-block;
        // margin-top: 10px;
        // margin-bottom: 10%;
        // margin-left: 10%;
        // background-color: rgb(25, 184, 91);
        width: 100%;
        // height: 80%;
        ul {
          // border: 1px solid black;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
</style>