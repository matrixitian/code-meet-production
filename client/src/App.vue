<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">

html, body {
  overflow: hidden;
}

input, button, textarea {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
}

#app {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

* {
  margin: 0;
  padding: 0;
}

ul {
  list-style: none;
}

</style>
