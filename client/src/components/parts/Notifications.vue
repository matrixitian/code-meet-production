<template>
  <div id="main">
    <div>
      <img id="notificationIcon" src="@/assets/notifications.svg"  @click="toggleNotificationList()"
      v-on-clickaway="away">
      <span id="notificationCount" :class="{newNotifications: notificationCount}">
        {{ notificationCount }}
      </span>
    </div>
    <ul id="notifications" v-if="notificationsVisible">
      <li class="noNotifications" v-if="!notifications.length">
        You have no notifications.
      </li>
      <li v-for="(notification, i) in notifications" :key="i" 
      :class="{notRead: !notification.read}">
        <p>User 
          <!-- Notification.room is basically the user id, no need to add another obj.property -->
          <span class="clickableField" @click="goToUser(notification.room)">
            {{ notification.userDisplayName }}
          </span> 
        has <span>{{ ` ${notification.joinedOrLeft}` }}</span> your project 
        <span class="clickableField" @click="goToProject(notification.projectID)">
          {{ notification.projectName }}
        </span>.</p>
        <span id="datetime" :class="{datetimeSeen: notification.read}">{{ timeAgo(notification.dateTime) }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import io from 'socket.io-client'
import moment from 'moment'
import { mixin as clickaway } from 'vue-clickaway'
import Axios from 'axios'
import config from '../../../../dev.env'
const log = console.log

export default {
  name: 'Notifications',
  mixins: [ clickaway ],
  data() {
    return {
      notifications: [],
      timeRequested: 0,
      notificationCount: 0,
      notificationsVisible: false,
      socket : io('localhost:3000')
    }
  },
  methods: {
    setNotificationsAsReadLocally() {
      this.notifications.forEach((notification) => {
        if (!notification.read) notification.read = true
      })
    },
    async setNotificationsAsRead() {
      // Only set notifications as read upon closing
      if (!this.notificationsVisible) {
        this.setNotificationsAsReadLocally()
      }

      // Only send to dB upon opening
      if (this.notificationsVisible) {
        await Axios({
          method: 'post',
          url: 'http://localhost:3000/set-notifications-as-seen',
          headers: {Authorization: localStorage.getItem('authToken')}
        })
      }

      this.notificationCount = 0
    },
    away: function() {
      // If Notification List is visible and you click away, it sets all notifications as read
       if (this.notificationsVisible) {
        this.setNotificationsAsReadLocally()

        this.notificationCount = 0
      }

      this.notificationsVisible = false
    },
    timeAgo(dateTime) {
      return moment(dateTime).fromNow()
    },
    toggleNotificationList() {

      this.notificationsVisible = !this.notificationsVisible

      log(this.notificationsVisible)

      this.setNotificationsAsRead()
    },
    goToUser(userID) {
      const obj = {
        id: userID,
        emitType: 'user'
      }
      // log("obj", obj)
      
      this.$store.commit('setLayout', 'users')
      setTimeout(() => { // Hotfix for Mounting of Component
        this.$store.commit('setSearchFromNotification', obj)
      }, 1)
    },
    goToProject(projectID) {
      const obj = {
        id: projectID,
        emitType: 'project'
      }
      // log("obj", obj)
      
      this.$store.commit('setLayout', 'projects')
      setTimeout(() => { // Hotfix for Mounting of Component
        this.$store.commit('setSearchFromNotification', obj)
      }, 1)
      
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem('user'))

    if (user) {
      const userID = user._id

      const response = await Axios({
        method: 'post',
        url: 'http://localhost:3000/notifications',
        data: {
          timeRequested: this.timeRequested
        },
        headers: {Authorization: localStorage.getItem('authToken')}
      })

      this.notifications = response.data

      let unreadNotificationsCount = 0
      this.notifications.forEach((notification) => {
        if (!notification.read) unreadNotificationsCount++
      })

      if (unreadNotificationsCount > 0) {
        this.notificationCount = unreadNotificationsCount
      }

      log("Notifications", this.notifications)

      this.socket.emit('subscribe', userID)

      const v = this // scope hotfix for this.notifications

      this.socket.on('receive notification', function(data) {
          // console.log(data)
          let notificationObject = {
            ...data.body,
            read: false
          }
          console.log(notificationObject)
          v.notifications.unshift(notificationObject)

          let countNotRead = 0
          v.notifications.forEach((notification) => {
              if (!notification.read) {
                countNotRead++
              }
          })

          v.notificationCount = countNotRead
      })

    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/centerX';

.noNotifications {
  color: white;
  background-color: rgb(41, 143, 190) !important;
}

.newNotifications {
  background-color: rgb(197, 10, 10) !important;
  border: 1px solid rgb(146, 10, 10) !important;
}

.notRead {
  background-color: rgb(41, 219, 160) !important;
}

$smallestLatop: 768px + 80px;
@media only screen and (max-height: $smallestLatop) {
  #main {
    top: 170px !important;
  }
}

#main {
  z-index: 10;
  width: 90%;
  @include centerX;
  top: 210px;
  img#notificationIcon {
    height: 30px;
    width: 30px;
    cursor: pointer;
    transition: .1s ease;
    &:hover {
      height: 31px;
      width: 31px;
    }
  }
  span#notificationCount {
    position: absolute;
    color: white;
    border-radius: 100%;
    padding: 2px 6px 2px 6px;
    font-size: 13px;
    // background-color: rgb(57, 147, 199);
    background-color: grey;
    cursor: default;
  }
  ul#notifications {
    border-radius: 4px;
    background-color: rgb(179, 178, 178);
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
    li {
      background-color: rgb(86, 108, 128);
      padding: 5px;
      margin: 5px;
      border-radius: 5px;
      box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
      span.clickableField {
        background-color: rgb(78, 162, 177);
        padding: 2px;
        border-radius: 2px;
        font-size: 13px;
        font-weight: bold;
        margin-right: 2px;
      }
      span#datetime {
        display: block;
        margin-top: 5px !important;
        font-size: 14px;
        border-radius: 4px;
        padding: 1px 5px 1px 5px;
        background-color: white;
      }
    }
  }
}

.datetimeSeen {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

</style>