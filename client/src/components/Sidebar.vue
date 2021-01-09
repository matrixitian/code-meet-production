<template>
  <div id="main">
    <div id="accountData" v-if="user">
      <!-- Connection Status -->
      <div class="container">
        <div>
          <div id="connectionStatus" :class="{ offline: !connected}"></div>
          <img src="@/assets/default_pic/user_purple.svg" alt="">
          <span class="accountType rainbow">New User</span>
        </div>
      </div>
      <!-- Display Name -->
      <div id="spans">
        <div>
          <input id="name" v-model="user.displayName" 
          @blur="updateUserData('displayName')" maxlength="18">
        </div>
      </div>
    </div>
    <!-- Notifications Icon -->
    <Notifications />
    <!-- User Tags -->
    <ul id="userTagList" v-if="user">
      <li v-for="(tag, i) in user.tags" :key="i">
        <img :src="getTagIcon(tag)" class="tagIcon">
        <span class="tagTitle">{{tag}}</span>
        <button @click="removeTag(tag, i)">
          <span>&#10005;</span>
        </button>
      </li>
    </ul>
    <!-- Tag Input -->
    <div id="tagAdder">
      <input v-model="tagForPush" @keyup.enter="addTag()"
      @keyup="suggestTags()" 
      placeholder="Add tag (enter)">
    </div>
    <!-- Suggestions List -->
    <div id="suggestionsPositioner">
      <ul v-if="true" id="suggestions">
        <li v-for="(tag, s) in suggestions" :key="s"
        @click="addTagFromSuggestions(s)">
          <img :src="getTagIcon(tag)" class="tagIcon">
          <span class="tagTitle">{{ tag }}</span>
        </li>
      </ul>
    </div>
    <div id="otherUserData" v-if="user">
      <!-- Description -->
      <div class="dataInput description">
        <img src="@/assets/description.svg" alt="github-icon">
        <textarea v-model="user.description" maxlength="200"
         @blur="updateUserData('description')"
        placeholder="Write something about yourself" />
      </div>
      <!-- Github Repository Link -->
      <div class="dataInput">
        <img src="@/assets/github.svg" alt="github-icon">
        <input v-model="user.githubRepository" placeholder="Github Repository"
        @blur="updateUserData('githubRepository')">
      </div>
      <!-- Discord Profile Link -->
      <div class="dataInput">
        <img src="@/assets/discord.svg" alt="discord-icon">
        <input v-model="user.discordProfileLink" placeholder="Discord Username#ID"
        @blur="updateUserData('discordProfileLink')">
      </div>
      <!-- StackOverflow Profile Link -->
      <div class="dataInput">
        <img src="@/assets/stackoverflow.svg" alt="discord-icon">
        <input v-model="user.stackOverflowLink" placeholder="StackOverflow profile link"
        @blur="updateUserData('stackOverflowLink')">
      </div>
      <!-- User Location -->
      <div class="dataInput">
        <img src="@/assets/location.svg" alt="discord-icon">
        <input v-model="user.location" placeholder="City, Country"
        @blur="updateUserData('location')">
      </div>
    </div>
    <!-- UPDATE STATUS -->
    <transition name="slide-fade">
      <div v-if="updateStatus" id="updateStatus">
        <span>{{ updateStatus }}</span>
      </div>
    </transition>
    <!-- LOGOUT -->
    <div id="Logout" @click="logout()">
      <img src="@/assets/logout.svg" alt="codermeet logout">
    </div>
  </div>
</template>

<script>
import Axios from 'axios'
import router from '../router'
import Notifications from './parts/Notifications'

import config from '../../../dev.env'
import $data from '../javascript/staticData'
const log = console.log

export default {
  name: 'Sidebar',
  components: { Notifications },
  data() {
    return {
      user: null,
      connected: true,
      updateStatus: null,
      suggestions: [],
      tagForPush: "",
      tagsForSuggestion: []
    }
  },
  methods: {
    async updateUserData(type) {
      let updateObject = {
        displayName: null,
        githubRepository: null,
        discordProfileLink: null,
        stackOverflowLink: null,
        location: null
      }

      switch(type) {
        case 'displayName':
          updateObject.displayName = this.user.displayName
          break
        case 'description':
          updateObject.description = this.user.description
          break
        case 'githubRepository':
          updateObject.githubRepository = this.user.githubRepository
          break
        case 'discordProfileLink':
          updateObject.discordProfileLink = this.user.discordProfileLink
          break
        case 'stackOverflowLink':
          updateObject.stackOverflowLink = this.user.stackOverflowLink
          break
        case 'location':
          updateObject.location = this.user.location
          break
      }

      const response = await Axios({
        method: 'patch',
        url: 'http://localhost:3000/user-data',
        data: {
          ...updateObject
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      if (response.status === 200) this.updateStatus = 'Update succesful!'
      else this.updateStatus = 'Update failed. Please try again later.'

      setTimeout(() => {
        this.updateStatus = null
      }, 2500)
    },
    async addTagFromSuggestions(index) {
      const tag = $data.capitalizeString(this.suggestions[index])

      this.suggestions = []
      this.tagForPush = ""

      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/tag',
        data: {
          tag
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      if (response.status === 200) this.user.tags.push(tag)
    },
    async suggestTags() {
      const search = this.tagForPush

      const filtered = this.tagsForSuggestion.filter(function(tag) {
        return tag.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      })

      let capitalized = []
      filtered.forEach((result) => {
        let received = $data.capitalizeString(result)
        capitalized.push(received)
      })

      this.suggestions = capitalized
    },
    async addTag() {
      this.tagForPush = $data.capitalizeString(this.tagForPush)
      
      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/tag',
        data: {
          tag: this.tagForPush
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })
      
      if (response.status === 200) {
        this.user.tags.push(this.tagForPush)
        this.tagForPush = ""
        this.suggestions = [] //hotfix
      }
    },
    async removeTag(tag, i) {
      const response = await Axios({
        method: 'delete',
        url: 'http://localhost:3000/tag',
        data: {
          tag
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      if (response.status === 200) this.user.tags.splice(i, 1)
    },
    checkIfTokenExists() {
      const token = localStorage.getItem('authToken')

      if (token === null) {
        log(`@Token not found.`)
        router.push('/')
      }
    },
    getTagIcon(tag) {
      return $data.returnTagIcon(tag)
    },
    async logout() {
      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/logout',
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      localStorage.removeItem('authToken')
      localStorage.removeItem('user')

      router.push('/')
    }
  },
  async mounted() {
    this.checkIfTokenExists()

    const user = JSON.parse(localStorage.getItem('user'))

    if (user) {
      setInterval(() => {
        this.connected = navigator.onLine
      }, 1000)

      const response = await Axios({
        method: 'get',
        url: 'http://localhost:3000/user',
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      this.tagsForSuggestion = $data.tagIcons
      $data.tagIcons = $data.backupTagIcons

      response.data.tags.forEach((tag) => {
        // Remove Tag from Array
        let index = this.tagsForSuggestion.indexOf(tag);
        if (index !== -1) this.tagsForSuggestion.splice(index, 1);
      })

      response.data.tags = $data.capitalizeTags(response.data.tags)

      this.user = response.data
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/Tag';
@import '@/scss/centerX';
@import '@/scss/centerXY';
@import '@/scss/centerY';
@import '@/scss/animations/slideFade';

$profileImgSize: 70px;
@keyframes blinker {
  50% {
    opacity: 0;
  }
}

#accountData {
  margin-top: 20%;
  position: relative;
  width: 100%;
  height: 20%;
  .container {
    display: flex;
    justify-content: center;
    div {
      position: relative;
      padding: 5px;
      border-radius: 100%;
      border: 2px solid hotpink;
      height: calc(#{$profileImgSize} + 10px);
      width: calc(#{$profileImgSize} + 10px);
      #connectionStatus {
        position: absolute;
        right: -15px;
        height: 2px;
        width: 2px;
        border: 1px solid rgba(0, 0, 0, 0.15);
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
    text-align: center;
    @include centerX;
    top: calc(calc(#{$profileImgSize} + 50px));
    width: 100%;
    color: #fafaff;
    div {
      display: inline-block;
      $imgSize: 18px;
      $imgMarginLeft: 10px;
      input#name {
        float: left;
        border: 1px solid rgba(255,255,255,0.15);
        padding: 5px;
        white-space: nowrap;
        font-weight: bold;
        width: 125px;
        text-align: center;
        background-color: transparent;
        color: #fafaff;
        margin-top: -5px;
      }
    }
  }
}

// userTagList
div {
  position: relative;
  div {
    text-align: center;
    ul#userTagList {
      text-align: center;
      max-height: 200px; //enable later, disabled for testing
      // height: 200px;
      display: inline-block;
      overflow-y: auto;
      margin-top: 20px;
      li {
        margin: 5px;
        font-weight: bold;
        font-size: 15px;
        margin-top: 4px;
        padding: 4px;
        border-radius: 2px;
        display: inline-block;
        background-color: white;
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
            margin-left: 0px;
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
  }
}

#updateStatus {
  text-align: center;
  width: 80%;
  margin-top: 20px;
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

#otherUserData {
  margin-top: 25px;
  position: relative;
  text-align: center;
  .dataInput {
    display: inline-block;
    margin-bottom: 8px;
    $imgMargin: 10px;
    $imgSize: 25px;
    img {
      float: left;
      width: $imgSize;
      height: $imgSize;
      margin: 0 $imgMargin 0 $imgMargin;
    }
    $inputFromRight: 50px;
    input, textarea {
      float: left;
      height: 25px;
      width: calc(100% - $inputFromRight - $imgMargin * 2 - $imgSize);
      background-color: rgba(255,255,255,0.15);
      border: none;
      outline: none;
      color: #fafaff;
      padding: 0 10px 0 10px;
      border-radius: 4px;
      &::placeholder {
        color: #717a80;
      }
    }
  }
}

.description > textarea {
  padding-top: 5px !important;
  height: 80px !important;
  resize: vertical;
}

#suggestionsPositioner {
  position: relative;
}

ul#suggestions {
  position: relative;
  margin: 40px 5% 0 5%;
  top: 0;
  background-color: rgba(255,255,255,0.20);
  width: 90%;
  max-height: 150px;
  text-align: center;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
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
      background-color: #81ec99;
    }
  }
}

#tagAdder {
  z-index: 4 !important;
  border-radius: 4px;
  @include centerX;
  height: 36px;
  margin-top: 5px;
  background-color: rgba(255,255,255,0.15);
  width: 90%;
  box-shadow: 1px 1px 7px 1px rgba(0, 0, 0, 0.1);
  text-align: left;
  input {
    outline: none;
    font-weight: bold;
    color: white;
    padding: 0 10px 0 10px;
    border: none;
    position: absolute;
    height: 100%;
    width: 100%;
    display: inline-block;
    margin-right: 100px;
    background-color: transparent;
    &::placeholder {
      color: #717a80;
    }
  }
}

#Logout {
  bottom: 10px;
  left: 15px;
  position: absolute;
  cursor: pointer;
  img {
    padding: 5px;
    height: 20px;
    width: 20px;
    transform: scaleX(-1);
    transition: .1s ease;
    &:hover {
      background-color: rgba(255,255,255,0.15);
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

$smallestLatop: 768px + 80px;
$desktop: 950px;
@media only screen and (max-height: $smallestLatop) {
  ul#userTagList {
    margin-top: 70px !important;
    max-height: 100px !important;
  }
  #accountData {
    margin-top: 10px !important;
  }
}

</style>