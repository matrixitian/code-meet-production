<template>
  <div id="main">
    <!-- <button @click="sendMessage()">send msg</button>
    <input v-model="roomName"> -->
    <!-- <ul id="viewJoined" v-if="viewMembers">
      <li v-for="(member, i) in viewMembers" :key="i">
        <img src="@/assets/default_pic/user_green.svg">
        <span>{{ member.displayName }}</span>
        <ul id="memberTags">
          <li v-for="(tag, t) in member.tags" :key="t">
            <img :src="getTagIcon(tag)">
            <span>{{ tag }}</span>
          </li>
        </ul>
      </li>
    </ul> -->
    <ul v-if="projects" id="projectList">
      <li class="project" v-for="(project, i) in projects" :key="i"
      :class="chooseRandTheme()">
        <div class="webLinks">
          <a :href="project.githubLink" target="_blank">
            <img class="githubRepo" src="@/assets/github.svg" v-if="project.githubLink">
          </a>
        </div>
        <div id="postedAgo">
          <span>{{ postedAgo(project.createdAt) }}</span>
        </div>
        <ul class="tags">
          <li v-for="(tag, t) in project.tags" :key="t">
            <img :src="getTagIcon(tag)" class="tagIcon">
            <span class="tagTitle">{{ tag }}</span>
          </li>
        </ul>
        <div class="titleDiv">
          <span class="title">{{ project.title }}</span>
        </div>
        <div class="descriptionDiv">
           <textarea class="description" readonly :value="project.description"/>
        </div>
        <div class="postedBy" @click="searchUserById(project.createdBy)">
          <div class="postedByImgDiv">
            <img src="@/assets/default_pic/user_green.svg">
          </div>
          <div class="postedByTextDiv">
            <span>Posted by</span>
          </div>
          <div class="postedByDisplayNameDiv">
            <span v-if="getIsProjectOrMyProjects === 'projects'">
              {{ project.creatorDisplayName }}
            </span>
            <span v-else>
              Me
            </span>
          </div>
          <div class="memberCountDiv">
            <span>{{ `${project.members.length} joined` }}</span>
          </div>
        </div>
        <div class="joinOrLeave">
          <div v-if="getIsProjectOrMyProjects === 'projects'">
            <button @click="viewProject(i)" class="skyblue">
              View
            </button>
            <button @click="leaveProject(i)"
              v-if="projects[i].joined" class="joined">
              Leave
            </button>
            <button @click="joinProject(i)" v-else class="notJoined">
              Join
            </button>
          </div>
          <div v-else>
            <button @click="viewProject(i)" class="green">
              View
            </button>
            <button @click="editMyProject(i)"
              class="yellow">
              Edit
            </button>
            <button @click="deleteMyProject(i)"
              class="joined">
              Delete
            </button>
          </div>
        </div>
      </li>
      <span v-if="!projects.length">
        {{ getIsProjectOrMyProjects === 'projects'?
          'No projects found! Please try using some different tags.' :
          'You have no projects.'
        }}
         
      </span>
      <div id="loadMoreDiv">
        <div id="load-more" @click="loadMore()"
        v-if="getIsProjectOrMyProjects === 'projects'">
          <img src="@/assets/down-arrow.svg">
        </div>
     </div>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import Axios from 'axios'
import moment from 'moment'
import $data from '@/javascript/staticData.js'
import config from '../../../../dev.env'
const log = console.log

import { mapState } from 'vuex';

import io from 'socket.io-client';

export default {
  name: 'ProjectCreator',
  data() {
    return {
      viewMembers: [],
      timesRequestedNewLoad: 0,
      projects: [],
      notificationSearch: {
        userID: null,
        projectID: null
      },
      tags: [],
      projectTags: [],
      roomName: null,
      message: null,
      messages: [],
      socket : io('localhost:3000')
    }
  },
  computed: mapState(['status']),
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'addTagsForFiltering') {
        this.loadProjectsByTag(state.tags)
        this.projectTags = state.tags
        this.timesRequestedNewLoad = 0
      }

       if (mutation.type === 'setSearchFromNotification') {
        if (state.searchFromNotification.emitType === 'project') {
          this.loadById(state.searchFromNotification.id)
        }
      }

      if (mutation.type === 'setProjectOrMyProjects') {
        if (state.projectsOrMyProjects === 'myProjects') {
          this.loadMyProjects()
        } else if (state.projectsOrMyProjects === 'projects') {
          this.loadInitialProjects()
        }
      }
    })
  },
  computed: {
    getIsProjectOrMyProjects() {
      return this.$store.getters.projectsOrMyProjects
    }
  },
  methods: {
    chooseRandTheme() {
      const classes = ['zero', 'one', 'two', 'three', 'four', 'five', 'six']

      return classes[Math.floor(Math.random()*classes.length)];
    },
    postedAgo(time_ago) {
      return moment(time_ago).fromNow()
    },
    async viewProject(i) {
      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/view-members',
        data: {
          projectID: this.projects[i]._id
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      // log(response)
      this.viewMembers = []
      this.viewMembers.push(response.data[0])

      log(this.viewMembers)
    },
    editMyProject(i) {
      this.$store.commit('setProjectForEdit', this.projects[i])
      this.$store.commit('setCreateOrEditProject', 'edit')
      this.$store.commit('setLayout', 'project-creator')
    },
    async deleteMyProject(i) {
      log("Deleting a project...")

      const response = await Axios({
        method: 'delete',
        url: 'http://localhost:3000/my-project',
        data: {
          projectID: this.projects[i]._id
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      if (response.status === 200) {
        this.projects.splice(i, 1)
      }
    },
    async loadMyProjects() {
      this.projects = []

      log("Loading my projects...")

      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/my-projects',
        headers: {Authorization: localStorage.getItem('authToken')}
      })
    
      response.data.forEach(project => {
        project.tags =  $data.capitalizeTags(project.tags)

        this.projects.push(project)
      })

      log("my initial projects", response)
    },
    async loadInitialProjects() {
      this.projects = []

      log("Loading initial projects...")

      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/projects',
        data: {
          timesRequestedNewLoad: 0
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })
    
      response.data.forEach(project => {

        project.tags =  $data.capitalizeTags(project.tags)

        if (project.members.includes(this.user._id)) {
          Vue.set(project, 'joined', true)
        } else {
          Vue.set(project, 'joined', false)
        }

        this.projects.push(project)
      })

      log(response)
    },
    searchUserById(id) {
      const obj = {
        id,
        emitType: 'user'
      }
      
      this.$store.commit('setLayout', 'users')
      setTimeout(() => { // Hotfix for Mounting of Component
        this.$store.commit('setSearchFromNotification', obj)
      }, 1)
    },
    async loadById(id) {
      const response = await Axios({
        method: 'post',
        url: `http://localhost:3000/get-project-by-id`,
        data: {
          id
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      log(response.data)

      this.projects = []
      this.projects.push(response.data)
      // this.projects = response.data
    },
    sendMessage(e) {
        this.socket.emit('subscribe', this.roomName);
          this.socket.emit('send message', {
              room: this.roomName,
              message: "Some message"
          })
        },
    getTagIcon(tag) {
      return $data.returnTagIcon(tag)
    },
    async loadProjectsByTag(tags) {
      log("tags received", tags)

      this.timesRequestedNewLoad = 0
      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/get-projects-by-tag',
        data: {
          timesRequestedNewLoad: this.timesRequestedNewLoad,
          tags
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      log(response.data)

      this.projects = []
      // define & set joined
      response.data.forEach(project => {
        project.tags = $data.capitalizeTags(project.tags)

        if (project.members.includes(this.user._id)) {
          Vue.set(project, 'joined', true)
        } else {
          Vue.set(project, 'joined', false)
        }
        this.projects.push(project)
      })
    },
    createNotificationObject(i, joinedOrLeft) {
      const user = JSON.parse(localStorage.getItem('user'))

      const notificationObject = {
        room: this.projects[i].createdBy,
        userDisplayName: user.displayName,
        projectName: this.projects[i].title,
        projectID: this.projects[i]._id,
        dateTime: new Date(),
        read: false,
        joinedOrLeft
      }

      log(notificationObject)

      return notificationObject
    },
    async joinProject(i) {
      const notificationObject = this.createNotificationObject(i, 'joined')

      const response = await Axios({
        method: 'patch',
        url: 'http://localhost:3000/join',
        data: {
          projectID: this.projects[i]._id,
          notificationObject
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      if (response.status === 200) {
        this.projects[i].joined = true
        this.projects[i].members.push(this.user._id)

        this.emitNotification(notificationObject)
      }
    },
    emitNotification(notificationObject) {
      // room is the _id of who will receive notification
      log(notificationObject)

      this.socket.emit('subscribe', notificationObject.room);

      this.socket.emit('send notification', {
        ...notificationObject
      })
    },
    async leaveProject(i) {
      const notificationObject = this.createNotificationObject(i, 'left')
      
      const response = await Axios({
        method: 'patch',
        url: 'http://localhost:3000/leave',
        data: {
          projectID: this.projects[i]._id,
          notificationObject
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      if (response.status === 200) {
        this.projects[i].joined = false
        const index = this.projects[i].members.indexOf(this.user._id)
        if (index !== -1) this.projects[i].members.splice(index, 1)

        this.emitNotification(notificationObject)
      }
    },
    async loadMore() {
      if (this.projectTags.length === 0) {
        log("runs")
        this.timesRequestedNewLoad++
        const response = await Axios({
          method: 'post',
          url: 'http://localhost:3000/projects',
          data: {
            timesRequestedNewLoad: this.timesRequestedNewLoad
          },
          headers: {Authorization: localStorage.getItem('authToken')}
        })

        response.data.forEach(project => {
          project.tags = $data.capitalizeTags(project.tags)

          if (project.members.includes(this.user._id)) {
            Vue.set(project, 'joined', true)
          } else {
            Vue.set(project, 'joined', false)
          }
          this.projects.push(project)
        })
      } else {
        console.log("other runs")
        this.timesRequestedNewLoad++
        const response = await Axios({
          method: 'post',
          url: 'http://localhost:3000/get-projects-by-tag',
          data: {
            timesRequestedNewLoad: this.timesRequestedNewLoad,
            tags: this.projectTags
          },
          headers: {Authorization: localStorage.getItem('authToken')}
        })

        response.data.forEach(project => {
          project.tags = $data.capitalizeTags(project.tags)

          if (project.members.includes(this.user._id)) {
            Vue.set(project, 'joined', true)
          } else {
            Vue.set(project, 'joined', false)
          }
          this.projects.push(project)
        })

        this.timesRequestedNewLoad++
      }
      
    }
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem('user'))
    
    const projectsOrMyProjects = this.getIsProjectOrMyProjects

    if (this.user && projectsOrMyProjects === 'projects') {
      
      this.loadInitialProjects()

      //  this.socket.emit('subscribe', this.roomName);

      // this.socket.emit('subscribe', this.user._id);

      this.socket.on('conversation private post', function(data) {
          console.log(data.message)
      });

      // this.socket.on('receive notification', function(data) {
      //     console.log(data)
      // });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/centerX';
@import '@/scss/centerXY';
@import '@/scss/centerY';
@import '@/scss/Tag';
@import '@/scss/loadButton';

// Project Themes
.zero {
  background-image: url("../../assets/card_backgrounds/0.svg") !important;
}
.one {
  background-image: url("../../assets/card_backgrounds/1.svg") !important;
}
.two {
  background-image: url("../../assets/card_backgrounds/2.svg") !important;
}
.three {
  background-image: url("../../assets/card_backgrounds/3.svg") !important;
}
.four {
  background-image: url("../../assets/card_backgrounds/4.svg") !important;
}
.five {
  background-image: url("../../assets/card_backgrounds/5.svg") !important;
}
.six {
  background-image: url("../../assets/card_backgrounds/6.svg") !important;
}

.webLinks {
  position: absolute;
  bottom: 47px;
  cursor: pointer;
  img {
    display: block;
    padding: 3px;
    background-color: white;
    border-radius: 4px;
    margin: 5px;
    width: 20px;
    height: 20px;
    box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.15);
    transition: .1s ease;
    &:hover {
      background-color: white;
      padding: 4px;
    }
  }
}

ul#viewJoined {
  margin-left: auto;
  margin-right: auto;
  display: block;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  padding: 10px;
  width: 70%;
  border: 1px solid black;
  max-height: 200px;
  height: 200px;
  overflow-y: auto;
  li {
    position: relative;
    width: 90%;
    background-color: rgba(255,255,255, 0.5);
    padding: 8px;
    span {
      margin-left: 35px;
    }
    img {
      position: absolute;
      top: 4px;
      height: 25px;
      width: 25px;
      border-radius: 100%;
      background-color: white;
      border: 1px solid white;
    }
  }
}

ul#memberTags {
  height: 30px;
  width: 70%;
  float: right;
  background-color: red;
  overflow-x: auto;
  li {
    display: inline-block;
    background-color: white;
    border: 1px solid black;
    margin-left: 3px;
    padding: 2px;
    width: 100px;
    img {
      height: 20px;
      width: 20px;
      background-color: white;
      border: none;
    }
  }
}

div#postedAgo {
  @include centerX;
  bottom: -23px;
  border-radius: 4px;
  height: 20px;
  font-size: 15px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  width: 90%;
  
}

.skyblue {
  border-top-left-radius: 2px !important;
  border-bottom-left-radius: 2px !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  background-color: skyblue !important;
}

.green {
  background-color: limegreen !important;
  border-top-left-radius: 2px !important;
  border-bottom-left-radius: 2px !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.yellow {
  border-radius: 2px !important;
  background-color: yellow !important;
}

.githubLogo {
  position: absolute;
  bottom: -33px; left: 3px;
  height: 30px;
}
// #23af54#2c3e50
ul.tags {
  position: absolute;
  // border: 1px solid black;
  // text-align: center;
  width: 100%;
  height: 80px;
  overflow-y: auto;
  bottom: 85px;
  max-height: 80px;
  li {
    border: 1px solid black;
    display: inline-block;
    color: white;
    background-color: rgba(44, 62, 80, 0.75);
    font-weight: bold;
    font-size: 13px;
    margin-bottom: 3px;
    padding: 4px;
    padding-right: 6px;
    border-radius: 3px;
    display: inline-block;
    margin-left: 10px;
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
  }
}

div.joinOrLeave {
  text-align: center;
  margin-top: -80px;
  button {
    color: rgba(0, 0, 0, 0.6);
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
    padding: 6px 12px 6px 12px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 3px;
    border: none;
    outline: none;
    font-weight: bold;
    cursor: pointer;
    transition: 0.1s ease;
    &:hover {
      transform: scale(1.02)
    }
  }
}

.joined {
  background-color: rgb(195, 42, 42);
}

.notJoined {
  background-color: rgb(51, 185, 51);
}

.postedBy {
  // border: 1px solid black;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  position: relative;
  border-top: 2px solid gray;
  margin-top: 105px;
  height: 45px;
  background-color: rgb(202, 202, 202);
  cursor: pointer;
  .postedByImgDiv {
    margin-top: 5px;
    img {
      background-color: rgb(255, 255, 255);
      border: 2px solid rgb(255, 255, 255);
      margin-left: -170px;
      height: 30px;
      width: 30px;
      // background-color: purple;
      border-radius: 100%;
      box-shadow: 1px 1px 3px 2px rgba(0, 0, 0, 0.16);
    }
  }
  .postedByTextDiv {
    font-size: 13px;
    font-weight: bold;
    margin-left: 20px;
    position: absolute;
    top: 6px;
    left: 30px;
    // background-color: black;
  }
  .postedByDisplayNameDiv {
    position: absolute;
    left: 30px;
    top: 23px;
    margin-left: 20px;
    font-size: 14px;
    // background-color: yellowgreen;
  }
  .memberCountDiv {
    position: absolute;
    right: 6px;
    top: 3px;
    border: 1px solid rgba(0, 0, 0, 0.5);
    font-size: 13px;
    font-weight: bold;
    background-color: greenyellow;
    padding: 2px 4px 2px 4px;
    border-radius: 2px;
  }
}

#main {
  z-index: 1;
  height: 100%;
}

ul#projectList {
  text-align: center;
  overflow-y: auto;
  min-width: 450px;
  // border: 1px solid black;
  overflow-x: hidden;
  margin-top: 30px;
  // display: block;
  max-height: 800px;
  width: 100%;
  height: 90%;
  li.project {
    border: 1px solid black;
    box-shadow: 1px 1px 5px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    display: inline-block;
    background-color: white;
    margin: 10px;
    margin-bottom: 30px;
    width: 220px;
    height: 270px;
    border-radius: 10px;
    transition: .1s ease;
    cursor: default;
    &:hover {
      transform: scale(1.02);
    }
    span {
      display: inline-block;
    }
    div.titleDiv {
      background-color: rgba(0, 0, 0, 0.15);
      text-align: center;
      // background-color: yellow;
      width: 100%;
      max-height: 38px;
      overflow-y: auto;
      border-top-right-radius: 10px;
      border-top-left-radius: 10px;
      span.title {
        color: white;
        font-size: 15px;
        font-weight: bold;
        margin: 10px 0 10px 0;
        text-align: center;
      }
    }
    div.descriptionDiv {
      margin-top: -5px;
      width: 100%;
      height: 85px;
      font-size: 12px;
      // background-color: green;
      textarea.description {
        
        width: 200px;
        max-width: 200px;
        height: 55px;
        max-height: 55px;
        margin: 10px;
        font-weight: bold;
        background-color: transparent;
        outline: none; border: none;
        color: white;
        resize: none;
        cursor: default;
      }
    }
  }
}

#loadMoreDiv {
  width: 100%;
  text-align: center;
  display: inline-block;
  margin-top: 10px;
  div#load-more {
    @include loadButton;
  }
}

::-webkit-scrollbar {
    width: 0px;  /* Remove scrollbar space */
    background: transparent;  /* Optional: just make scrollbar invisible */
}
/* Optional: show position indicator in red */
::-webkit-scrollbar-thumb {
    background: #FF0000;
}

</style>