<template>
  <div id="main">
    <transition name="slide-fade">
      <span v-if="copied" id="Notification">Discord username copied.</span>
    </transition>
    <ul v-if="users" id="projectList">
      <li class="project" v-for="(user, i) in users" :key="i">
        <!-- <div class="buttons">
          <div class="sendMessage">
            <img src="@/assets/message.svg" alt="">
            <span>Send message</span>
          </div>
        </div> -->
        <div class="webLinks">
          <a :href="user.githubRepository" target="_blank">
            <img class="githubRepo" src="@/assets/github.svg" v-if="user.githubRepository">
          </a>
          <span class="discordProfile" v-if="showDiscordProfile">
            {{ user.discordProfileLink }}
          </span>
          <img class="discord" @mouseover="showDiscordProfile = true" 
          @mouseleave="showDiscordProfile = false" @click="doCopy(user.discordProfileLink)"
          src="@/assets/discord.svg" v-if="user.discordProfileLink">
          <a :href="user.stackOverflowLink" target="_blank">
            <img class="stackoverflow" src="@/assets/stackoverflow.svg" v-if="user.stackOverflowLink">
          </a>
        </div>
        <ul class="tags">
          <li v-for="(tag, t) in user.tags" :key="t">
            <img :src="getTagIcon(tag)" class="tagIcon">
            <span class="tagTitle">{{ tag }}</span>
          </li>
        </ul>
        <div class="container">
          <div>
            <!-- <div id="connectionStatus" :class="{ offline: !connected}"></div> -->
            <img src="@/assets/default_pic/user_purple.svg" alt="">
            <span class="accountType rainbow">New User</span>
          </div>
        </div>
        <div id="spans">
          <div>
            <span id="name">{{ user.displayName }}</span>
            <span id="description">
              {{ user.description? user.description : 'User has no description.' }}
            </span>
            <span id="location">{{ user.location }}</span>
          </div>
        </div>
      </li>
      <span v-if="!users.length">
        No users found! Please try using some different tags. 
      </span>
      <div id="loadMoreDiv">
        <div id="load-more" @click="loadMore()">
          <img src="@/assets/down-arrow.svg">
        </div>
     </div>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import Axios from 'axios'
import VueClipboard from 'vue-clipboard2'
import { mapState } from 'vuex'
import $data from '@/javascript/staticData.js'
import config from '../../../../dev.env'
const log = console.log
 
VueClipboard.config.autoSetContainer = true // add this line
Vue.use(VueClipboard)

export default {
  name: 'Users',
  data() {
    return {
      timesRequestedNewLoad: 0,
      users: [],
      tags: [],
      userTags: [],
      showDiscordProfile: false,
      copied: false,
      connected: true // temporary hotfix until user.onlineStatus
    }
  },
  computed: mapState(['status']),
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'addTagsForFiltering') {
        this.loadUsersByTag(state.tags)
        this.userTags = state.tags
        log("tagsss", state.tags)
        this.timesRequestedNewLoad = 0
      }
    })

    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setSearchFromNotification') {
        log("talk")
        if (state.searchFromNotification.emitType === 'user') {
          this.loadById(state.searchFromNotification.id)
        }
      }
    })
  },
  methods: {
     async loadById(id) {
      const response = await Axios({
        method: 'post',
        url: `http://localhost:3000/get-user-by-id`,
        data: {
          id
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      this.users = []
      this.users.push(response.data)
    },
    doCopy: function (discordProfileLink) {
       this.$copyText(discordProfileLink)
       this.copied = true

       setTimeout(() => { this.copied = false}, 2000)
    },
    getTagIcon(tag) {
      return $data.returnTagIcon(tag)
    },
    async loadUsersByTag(tags) {
      log("user tags received", tags)

      this.timesRequestedNewLoad = 0
      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/get-users-by-tag',
        data: {
          timesRequestedNewLoad: this.timesRequestedNewLoad,
          tags
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      log(response.data)

      this.users = []

      response.data.forEach((user) => {
        this.users.push(user)
      })
    },
    async loadMore() {
      if (this.userTags.length === 0) {
        log("runs")
        this.timesRequestedNewLoad++
        const response = await Axios({
          method: 'post',
          url: 'http://localhost:3000/users',
          data: {
            timesRequestedNewLoad: this.timesRequestedNewLoad
          },
          headers: {Authorization: localStorage.getItem('authToken')}
        })

        response.data.forEach(user => {
          this.users.push(user)
        })
      } else {
        console.log("other runs")
        this.timesRequestedNewLoad++
        const response = await Axios({
          method: 'post',
          url: 'http://localhost:3000/get-users-by-tag',
          data: {
            timesRequestedNewLoad: this.timesRequestedNewLoad,
            tags: this.userTags
          },
          headers: {Authorization: localStorage.getItem('authToken')}
        })

        response.data.forEach(user => {
          this.users.push(user)
        })

        this.timesRequestedNewLoad++
      }
      
    }
  },
  async mounted() {
    const response = await Axios({
      method: 'post',
      url: 'http://localhost:3000/users',
      data: {
        timesRequestedNewLoad: 0
      },
      headers: {Authorization: localStorage.getItem('authToken')}
    })

    this.user = JSON.parse(localStorage.getItem('user'))

    response.data.forEach(user => {
      this.users.push(user)
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/centerX';
@import '@/scss/centerXY';
@import '@/scss/centerY';
@import '@/scss/animations/slideFade';
@import '@/scss/Tag';
@import '@/scss/loadButton';

#Notification {
  font-weight: bold;
  color: rgba(0, 0, 0, 0.40);
  font-size: 13px;
  margin-left: 10px;
  background-color: rgb(26, 209, 65);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
}

.discordProfile {
  position: absolute;
  color: white;
  top: 40px;
  left: 30px;
  padding: 4px;
  background-color: black;
  z-index: 10;
}

.buttons {
  @include centerX;
  width: 100%;
  bottom: 0px;
  text-align: center;
  div {
    display: inline-block;
    width: 130px;
    border-radius: 4px;
    padding: 5px 3px 5px 3px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.35);
    cursor: pointer;
    span {
      color: rgba(255, 255, 255, 0.7);
      padding-right: 3px;
      margin-left: 10px;
      margin-top: 2px;
      font-size: 13px;
      font-weight: bold;
      float: left;
    }
    img {
      margin-left: 4px;
      float: left;
      height: 20px;
      width: 20px;
    }
    transition: .2s ease;
    &:hover {
      color: white;
      border: 1px solid rgba(0, 0, 0, 0.25);
      background-color: rgb(24, 194, 151);
    }
  }
}

.webLinks {
  position: absolute;
  top: 10px;
  cursor: pointer;
  img {
    display: block;
    padding: 3px;
    background-color: rgba(0, 0, 0, 0.30);
    border-radius: 4px;
    margin: 5px;
    width: 20px;
    height: 20px;
    transition: .1s ease;
    &:hover {
      background-color: white;
      padding: 4px;
    }
  }
}

$profileImgSize: 70px;
@keyframes blinker {
  50% {
    opacity: 0;
  }
}
 .container {
      // @include centerX;
      position: relative;
      // border: 1px solid blue;
      div {
        margin-top: 10px;
        @include centerX;
        padding: 3px;
        border-radius: 100%;
        border: 2px solid white;
        height: calc(#{$profileImgSize} + 10px);
        width: calc(#{$profileImgSize} + 10px);
        #connectionStatus {
          position: absolute;
          left: 100px;
          height: 2px;
          width: 2px;
          border: 1px solid rgba(0, 0, 0, 0.89);
          animation: blinker 1s linear infinite;
          background-color: limegreen;
        }
        img {
          border: 4px dashed rgba(255,255,255,0.15);
          height: $profileImgSize;
          border-radius: 100%;
          background-color: white;
          min-height: $profileImgSize;
          min-width: $profileImgSize;
        }
        span.accountType {
          border: 1px solid black;
          position: absolute;
          font-weight: bold;
          bottom: 0;
          right: -15px;
          color: rgba(0, 0, 0, 0.89);
          background-color: rgb(0, 255, 13);
          padding: 5px;
          border-radius: 3px;
          font-size: 12px;
          box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
        }
      }
    }
    #spans {
      @include centerX;
      top: calc(calc(#{$profileImgSize} + 40px));
      width: 100%;
      color: #fafaff;
      // border: 1px solid white;
      div {
        // border: 1px solid orange;
        display: block;
        $imgSize: 18px;
        $imgMarginLeft: 10px;
        span#name {
          // border: 1px solid orange;
          font-weight: bold;
          text-align: center;
          color: whitesmoke;
        }
        span#description {
          overflow-y: auto;
          border-radius: 5px;
          max-height: 50px;
          margin-left: 7px;
          // margin-right: 5%;
          display: block;
          margin-top: 3px;
          // border: 1px solid black;
          width: 90%;
          color: white;
          font-size: 12px;
          background-color: rgba(0, 0, 0, 0.15);
          padding: 5px;
        }
        span#location {
          margin-top: 7px;
          font-size: 13px;
          text-decoration: underline;
          // color:rgba(0, 0, 0, 0.75);
          // color: rgb(68, 192, 165);
          // font-weight: bold;
        }
        img {
          border-radius: 5px;
          margin-top: -5px;
          cursor: pointer;
          float: left;
          width: $imgSize; height: $imgSize;
          margin-left: $imgMarginLeft;
          padding: 5px;
          transition: .1s ease;
            &:hover {
              background-color: rgba(255,255,255,0.15);
            }
        }
      }
    }

    
.rainbow { 
  background: linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3);
  background-size: 1800% 1800%;

  -webkit-animation: rainbow 18s ease infinite;
  -z-animation: rainbow 18s ease infinite;
  -o-animation: rainbow 18s ease infinite;
    animation: rainbow 18s ease infinite;
}

@-webkit-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-moz-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-o-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@keyframes rainbow { 
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}

// #23af54#2c3e50
ul.tags {
  position: absolute;
  // border: 1px solid black;
  text-align: center;
  width: 100%;
  height: 80px;
  overflow-y: auto;
  bottom: 45px;
  max-height: 80px;
  li {
    border: 1px solid black;
    color: white;
    background-color: rgba(44, 62, 80, 0.75);
    font-weight: bold;
    font-size: 13px;
    padding: 4px;
    padding-right: 6px;
    border-radius: 3px;
    display: inline-block;
    margin: 3px;
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
  }
}

#main {
  z-index: 1;
  height: 100%;
}

ul#projectList {
  position: relative;
  text-align: center;
  overflow-y: auto;
  min-width: 450px;
  // border: 1px solid black;
  overflow-x: hidden;
  margin-top: 30px;
  // display: block;
  // min-height: 500px;
  // max-height: 500px;
  height: 75vh;
  width: 100%;
  // height: 90%;
  li.project {
    // background-image: url("../../assets/card_backgrounds/Polka-Dots.svg");
    // background-color: rgb(31, 61, 116);
    background: rgb(2,0,36);
background: linear-gradient(191deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%);
// background: rgb(155,34,195);
// background: linear-gradient(180deg, rgba(155,34,195,1) 0%, rgba(235,0,170,1) 100%);
// background: rgb(34,193,195);
// background: linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(2,74,50,1) 100%);
    // border: 1px solid black;
    box-shadow: 1px 1px 5px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    display: inline-block;
    border: 2px solid white;
    // background-color: white;
    margin: 10px;
    margin-bottom: 30px;
    width: 240px;
    height: 350px;
    border-radius: 10px;
    transition: .1s ease;
    cursor: default;
    &:hover {
      transform: scale(1.02);
    }
    span {
      display: inline-block;
    }
  }
}

#loadMoreDiv {
  width: 100%;
  // background-color: rgb(10, 133, 57);
  text-align: center;
  display: inline-block;
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