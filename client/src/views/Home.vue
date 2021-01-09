<template>
  <div class="home">
    <Sidebar id="Sidebar" />
    <Dashboard id="Dashboard"/>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import Dashboard from '@/components/Dashboard.vue'

export default {
  name: 'home',
  components: {
    Sidebar,
    Dashboard
  }
}
</script>

<style lang="scss">
html {
  background-color: #1a1e30;
}

#Dashboard {
  float: right;
  height: 100vh;
  width: 80vw;
  background-color: rgb(225, 225, 228);
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
}

#Sidebar {
  float: left;
  height: 100vh;
  width: 12vw;
  min-width: 250px;
}

#Topper {
  float: left;
  top: 0;
  height: 45px;
  width: 100vw;
  background-color: #fafaff;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.6);
}

</style>