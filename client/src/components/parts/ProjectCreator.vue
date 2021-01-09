<template>
  <div id="main">
    <div id="inner">
      <div id="title">
        <input v-model="projectData.title" 
        placeholder="Project Title" />
      </div>
      
      <section>
        <div id="description">
          <textarea v-model="projectData.description" 
          placeholder="Describe your project in 200 characters" />
        </div>
        <div id="githubLink">
          <input v-model="projectData.githubLink" 
          placeholder="Github Repository">
          <img src="@/assets/github.svg" alt="CoderMeet Github">
        </div>

        <div id="tagsContainer">
          <!-- Tag Input -->
          <input id="tagAdder" v-model="tagForPush" placeholder="Add tag (enter)"
          @keyup.enter="addTag()" @keyup="suggestTags()">
          <!-- Tag List -->
          <ul id="tagList" v-if="projectData.tags.length > 0">
            <li v-for="(tag, i) in projectData.tags" :key="i">
              <img :src="getTagIcon(tag)" class="tagIcon">
              {{tag}}
              <button @click="removeTag(i)">
                <span>&#10005;</span>
              </button>
            </li>
          </ul>
          <!-- Tag suggestions -->
          <ul id="suggestions" v-if="tagForPush">
            <li v-for="(tag, s) in suggestions" :key="s"
            @click="addTagFromSuggestions(s)">
              <img :src="getTagIcon(tag)" class="tagIcon">
              <span class="tagTitle">{{ tag }}</span>
            </li>
          </ul>
        </div>

        <div id="errors" v-if="error">
          <span>{{ error }}</span>
        </div>

        <!-- <span>paid</span>
        <input type="checkbox"> -->
        <div id="postProject">
          <button @click="pushProject()" v-if="createOrEdit === 'create'">
            Post Project
          </button>
          <button class="yellow" @click="editProject()" v-else>
            Edit Project
          </button>
        </div>
      </section>
      <transition name="slide-fade">
        <div v-if="status.message" id="updateStatus">
          <span :class="{statusError: !status.success}">{{ status.message }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Axios from 'axios'
import config from '../../../../dev.env'
const log = console.log

import $data from '../../javascript/staticData'

export default {
  name: 'ProjectCreator',
  data() {
    return {
      createOrEdit: null,
      status: {
        message: null,
        success: null
      },
      projectData: {
        title: "",
        description: "",
        githubLink: "",
        tags: []
      },
      suggestions: [],
      tagForPush: "",
      error: null
    }
  },
  methods: {
    async editProject() {
      this.checkProjectData()
      
      log("bf update", this.projectData)

      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/edit-project',
        data: {
          projectData: {
            id: this.projectData._id,
            title: this.projectData.title,
            description: this.projectData.description,
            githubLink: this.projectData.githubLink,
            tags: this.projectData.tags
          }
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      log(response.status)

      if (response.status === 200) {
        this.setStatus('Project succesfuly edited!', true)
      } else {
        this.setStatus('A problem occured. Please try again later =[', true)
      }
    },
    suggestTags() {
      const search = this.tagForPush

      if (search) {
        const filtered = $data.tagIcons.filter(function(tag) {
          return tag.toLowerCase().indexOf(search.toLowerCase()) >= 0;
        })

        let capitalized = []
        filtered.forEach((result) => {
          let received = $data.capitalizeString(result)
          capitalized.push(received)
        })

        this.suggestions = capitalized

        log(this.suggestions)
      }
    },
    addTagFromSuggestions(index) {
      const tag = this.suggestions[index]
      this.projectData.tags.push(tag)

      this.suggestions = []
      this.tagForPush = ""   
      
      log("after added tag", this.projectData)
    },
    getTagIcon(tag) {
      return $data.returnTagIcon(tag)
    },
    addTag() {
      const tag = $data.capitalizeString(this.tagForPush)

      this.projectData.tags.push(tag)

      this.tagForPush = null

      log("after added tag", this.projectData.tags)
    },
    removeTag(i) {
      this.projectData.tags.splice(i, 1)
    },
    setStatus(msg, status) {
      this.status.message = msg
      this.status.success = status

      this.autoHideStatus()
    },
    autoHideStatus() {
      const v = this

      setTimeout(() => {
          v.setStatus(null, null)
      }, 2500)
    },
    checkProjectData() {
       if (this.projectData.title.length < 10) {
        this.setStatus('Title must be longer than 10 characters.', false)
        throw new Error()
      } else if (this.projectData.description.length < 50) {
        this.setStatus('Description must be at least 50 characters long.', false)
        throw new Error()
      } 
      // else if (this.projectData.tags.length = 0) {
      //   this.setStatus('You need to add at least 1 tag.', false)
      //   throw new Error()
      // } else if (this.projectData.tags.length > 5) {
      //   this.setStatus('You cannot have more than 5 tags.', false)
      //   throw new Error()
      // }
    },
    async pushProject() {
      this.checkProjectData()
      
      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/project',
        data: {
          ...this.projectData
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      if (response.status === 200) {
        this.projectData.title = ""
        this.projectData.description = ""
        this.projectData.githubLink = ""
        this.projectData.tags = []

        this.setStatus('Project has been posted!', true)
      } else {
        this.setStatus('Something unexpected occured =[', false)
      }

      log(response)
    }
  },
  mounted() {
    this.createOrEdit = this.$store.getters.createOrEditProject
    const projectForEditData = this.$store.getters.projectForEdit

    if (this.createOrEdit === 'edit') {
      this.projectData = {
        ...projectForEditData
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/centerX';
@import '@/scss/centerXY';
@import '@/scss/centerY';
@import '@/scss/animations/slideFade';
@import '@/scss/Tag';

.yellow {
  background: rgb(253, 237, 6) !important;
  background: linear-gradient(180deg, rgb(226, 230, 0) 0%,
   rgb(194, 158, 0) 100%)!important;
  &:hover {
    background: rgb(253, 237, 6) !important;
    background: linear-gradient(180deg, rgb(199, 202, 3) 0%,
    rgb(211, 148, 1) 100%)!important;
  }
}

#updateStatus {
  text-align: center;
  width: 80%;
  margin-top: 30px;
  margin-bottom: 20px;
  margin-left: 10%;
  margin-right: 10%;
  span {
    background-color: limegreen;
    color:rgba(0, 0, 0, 0.6);
    font-weight: bold;
    border-radius: 5px;
    padding: 4px 10px 4px 10px;
    font-size: 15px;
  }
}

.statusError {
  color: #fafaff !important;
  background-color: rgb(189, 42, 42) !important;
}

// .slide-fade-enter-active {
//   transition: all .3s ease;
// }
// .slide-fade-leave-active {
//   transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
// }
// .slide-fade-enter, .slide-fade-leave-to
// /* .slide-fade-leave-active below version 2.1.8 */ {
//   transform: translateX(10px);
//   opacity: 0;
// }

ul#suggestions {
  z-index: 1 !important;
  position: absolute;
  @include centerX;
  margin-top: -32px;
  background-color: rgba(82, 143, 192, 0.80);
  max-width: 400px;
  max-height: 100px;
  text-align: center;
  z-index: 5;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  border: 1px solid black;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-bottom-left-radius: 13px;
  border-bottom-right-radius: 13px;
  li {
    border: 1px solid black;
    padding: 3px 5px 3px 5px;
    font-weight: bold;
    display: inline-block;
    margin: 5px;
    background-color: white;
    border-radius: 3px;
    cursor: pointer;
    transition: .1s ease;
    &:hover {
      background-color: rgb(246, 212, 206);
    }
  }
}

#githubLink {
  position: relative;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 5px 10px 5px 10px;
  margin-top: 10px;
  input {
    float: left;
    background-color: transparent;
    color:rgb(67, 59, 173);
    padding: 5px 10px 5px 10px;
    border: none;
    outline: none;
  }
  img {
    margin-top: 1px;
    border-radius: 100%;
    float: right;
    height: 25px;
    width: 25px;
    box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.15);
  }
}

section {
  text-align: center;
  height: 100%;
  width: 100%;
  textarea {
    resize: none;
    margin-top: 20px;
    width: 80%;
    min-height: 120px;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.10);
    font-weight: bold;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    border-radius: 5px;
  }
}

#main {
  position: relative;
  height: 100%;
  width: 100%;
  #inner {
    @include centerX;
    display: inline-block;
    // background-color: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.15);
    width: 70%;
    margin-top: 50px;
    border-radius: 5px;
    // box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.15);
    div#title {
      margin-top: 20px;
      text-align: center;
      input {
        color: rgb(100, 184, 44);
        text-align: center;
        font-weight: bold;
        font-size: 17px;
        width: 60%;
        height: 30px;
        background-color: rgba(255, 255, 255, 0.10);
        border: 1px solid rgba(0, 0, 0, 0.15);
        padding: 5px 10px 5px 10px;
      }
    }
    #postProject {
      text-align: center;
      margin-bottom: 16px;
      button {
        padding: 8px 11px 8px 11px;
        border-radius: 3px;
        color: white;
        border: 1px solid rgba(0, 0, 0, 0.15);
        background: rgb(15,173,71);
        background: linear-gradient(180deg, rgba(15,173,71,1) 0%, rgba(1,199,0,1) 100%);
        font-weight: bold;
        cursor: pointer;
        &:hover {
          background: rgb(13,156,63);
          background: linear-gradient(180deg, rgba(13,156,63,1) 0%, rgba(5,175,4,1) 100%);
        }
      }
    }
  }
}

$tagsInputWidth: 150px;

#tagAdder {
  border: 1px solid rgba(0, 0, 0, 0.15);
  outline: none;
  font-weight: bold;
  color: rgb(51, 51, 51);
  padding: 5px 10px 5px 10px;
  margin-top: 10px;
  background-color: transparent;
  margin-bottom: 30px;
  &::placeholder {
    color: #717a80;
  }
}

div#tagsContainer {
  position: relative;
  display: block;
  // border: 1px solid blue;
  height: 110px;
}

ul#tagList {
  @include centerX;
  padding: 5px;
  width: 65%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  margin-top: -20px;
  max-height: 40px;
  height: 40px;
  overflow-y: auto;
  li {
    position: relative;
    margin: 5px;
    font-weight: bold;
    font-size: 15px;
    margin-top: 4px;
    padding: 4px 9px 4px 32px;
    border-radius: 2px;
    display: inline-block;
    // margin-left: 10px;
    background-color: white;
    img {
      position: absolute;
      left: 7px;
      height: 20px;
      width: 20px;
    }
    button {
        cursor: pointer;
        top: 2px;
        position: relative;
        margin-left: 5px;
        border-radius: 100%;
        border: none;
        font-weight: bold;
        font-size: 10px;
        width: 15px;
        height: 15px;
        background-color: #f1a1a0;
        transition: .3s ease;
        &:hover {
          background-color: white;
        }
        span {
          margin-top: -1px;
          @include centerXY;
          color: white;
          transition: .3s ease;
          &:hover {
            color: #df190e;
          }
        }
      }
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