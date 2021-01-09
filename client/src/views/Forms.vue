<template>
<div id="main">
    <!-- Form -->
    <div class="Form">
      <span id="forgotPassword" v-if="section == 'signin'"
      @click="togglePasswordReset()">
        Forgot password?
      </span>

      <div id="Title">
        <img id="logo" src="@/assets/logo.svg">
        <span>
            {{ section == 'signin' ? 
            'Sign in to CoderMeet!' : 'Sign up for CoderMeet!' }}
        </span>
      </div>

      <div id="Positioner">  
        <!-- Username Input -->
        <label>Username</label>
        <input class="Field" v-model="username" @focus="resetError()">
        <!-- Password Input -->
        <div id="passwordField">
          <img :src="imgSrc" @click="togglePasswordView()">
          <!-- Input -->
          <label>Password</label>
          <input class="Field" type="password" ref="passwordField"
          v-model="password" @focus="resetError()">
        </div>
      </div>

      <!-- CHANGE FORM -->
      <div id="changeForm">
        <p> {{ section == 'signin' ? 'New to CoderMeet?' : 'Already have an account?' }}
          <span @click="switchForm()">
            {{ section == 'signin' ? 'Create an account.' : 'Sign in.' }}
          </span>
        </p>
      </div>

      <!-- ERROR DISPLAY -->
      <transition name="fade">
        <span v-if="loginError" id="loginError">
          {{ loginError }}
        </span>
      </transition>

      <!-- NEXT -->
      <button id="buttonNext" @click.prevent="sendRequest()">
        {{ section == 'signin' ? 'Sign in' : 'Create account' }}
      </button>
    </div>
</div>
</template>

<script>
import axios from 'axios'
import router from '../router'
import config from '../../../dev.env'
const log = console.log

export default {
  name: 'SignIn',
  data () {
    return {
      section: 'signin',
      username: null,
      password: null,
      passwordVisible: false,
      loginError: null
    }
  },
  mounted () {
    this.checkIfTokenExists()

    // Listens for Enter instead of having to click the SignUp/SignIn button!
    const v = this
    window.addEventListener('keyup', function(event) {
      if (event.keyCode === 13) { 
        v.sendRequest()
      }
    })
  },
  computed: {
    imgSrc() {
      const passwordVisible = require('@/assets/login_eye/shown.svg')
      const passwordInvisible = require('@/assets/login_eye/hidden.svg')

      return this.passwordVisible ? passwordVisible : passwordInvisible
    }
  },
  methods: {
    togglePasswordReset() {
      this.errorHandling('password-reset')
    },
    switchForm() {
      if (this.section === 'signin') {
        this.section = 'signup'

        this.passwordVisible = true
        this.$refs.passwordField.type = 'text'
      } else { 
        this.section = 'signin'

        this.passwordVisible = false
        this.$refs.passwordField.type = 'password'
      }
    },
    checkIfTokenExists() {
      const token = localStorage.getItem('authToken')

      if (token !== null) {
        log(`@Token found.`)
        router.push('/app')
      }
    },
    setError(message) {
      this.loginError = message
    },
    resetError() {
      this.loginError = null
    },
    errorHandling(type) {
      if (!navigator.onLine) {
        this.setError('Please check your internet connection.')
        throw new Error('No connection.')
      }

      if (type === 'login') {
        if (!this.username || !this.password) {
          this.setError('Fields cannot be empty.')
          throw new Error('Field empty.')
        }
      } else if (type === 'password-reset') {
          this.setError('Currently unavailable.')
          throw new Error('Currently unavailable.')
      }
    },
    togglePasswordView() {
      this.passwordVisible = !this.passwordVisible

      if (this.passwordVisible) this.$refs.passwordField.type = 'text'
      else this.$refs.passwordField.type = 'password'
    },
    async sendRequest() {
      this.errorHandling('login')

      try {
        
        let response = await axios.post(`${config.domain}/${this.section}`, {
          username: this.username.toLowerCase(),
          password: this.password
        })

        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        router.push('/app')
      } catch (err) {
        if (!err.response) {
          this.setError('Connection to server failed.')
        } else {
          if (this.section === 'signin') this.setError('Wrong username or password.')
          else this.setError('Username taken.')
        }
        log(err.status)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/animations/Fade.scss'; // for errors
@import '@/scss/centerX';
@import '@/scss/centerY';
@import '@/scss/centerXY';
@import '@/scss/Unselectable';

span, p {
  @include Unselectable;
}

#main {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgb(241, 237, 237) !important;
}

.Form {
  @include centerXY;
  background-color: white;
  width: 300px;
  height: 240px;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

div#Title {
  @include centerX;
  text-align: center;
  top: -130px;
  width: 300px;
  span {
    font-size: 22px;
    cursor: default;
  }
  img#logo {
    display: block;
    margin-left: auto;
    margin-right: auto;
    height: 70px;
    width: 70px;
    margin-bottom: 20px;
  }
}

#Positioner {
  @include centerX;
}

label {
  margin-bottom: 6px;
  display: block;
  font-weight: bold;
  font-size: 14px;
  &:nth-child(1) {
    margin-top: 25px;
  }
  &:nth-child(2) {
    margin-top: 5px;
  }
}

$inputPadding: 12px;
.Field {
  width: 250px;
  height: 35px;
  padding-left: $inputPadding;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  margin-bottom: 5px;
  -webkit-box-shadow:inset 0 0 10px rgba(0, 0, 0, 0.05);
  -moz-box-shadow:inset 0 0 10px rgba(0, 0, 0, 0.05);
  box-shadow:inset 0 0 10px rgba(0, 0, 0, 0.05);
  background: transparent;
  &:focus {
    outline: 1px solid greenyellow;
    box-shadow: 0 0 3px #ddd;
  } 
}

#passwordField {
  z-index: 5;
  position: relative;
  img {
    cursor: pointer;
    opacity: 0.7;
    position: absolute;
    height: 23px;
    right: 10px;
    top: 30px;
  }
}

span#forgotPassword {
  z-index: 10;
  position: absolute;
  top: 95px;
  right: 12px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  color: rgb(68, 112, 216);
}

#buttonNext {
  @include centerX;
  width: calc(250px + #{$inputPadding});
  height: 35px;
  background: rgb(34,195,90);
  background: linear-gradient(180deg, rgba(34,195,90,1) 0%, rgba(28,235,0,1) 100%);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  color: white;
  font-weight: bold;
  font-size: 15px;
  bottom: 20px;
  cursor: pointer;
  outline: none;
  &:hover {
    background: rgb(16,184,75);
    background: linear-gradient(180deg, rgba(16,184,75,1) 0%, rgba(3,212,2,1) 100%);
    border: 1px solid rgba(0, 0, 0, 0.55)
  }
}

#loginError {
  @include centerX;
  display: inline-block;
  font-size: 15px;
  border-radius: 4px;
  width: 250px;
  background-color: rgb(255, 103, 103);
  border: 1px solid  rgba(196, 59, 31, 0.7);
  padding: 3px;
  color: white;
  bottom: 57px;
  text-align: center;
}

div#changeForm {
  @include centerX;
  text-align: center;
  bottom: -40px;
  border: 1px solid black;
  width: 280px;
  padding: 10px;
  font-size: 15px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  p > span {
    cursor: pointer;
    color: rgb(68, 112, 216);
    transition: .15s ease;
    &:hover {
      color: rgb(58, 123, 230);
      text-decoration: underline;
    }
  }
}

</style>