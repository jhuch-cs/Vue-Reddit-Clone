<template>
  <div id="app">
    <div id="menu">
      <div id="brand">
        <router-link to="/">
          <img src="./assets/logo.png" />
        </router-link>
        <h1>Reddit Clone</h1>
      </div>
    </div>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e6e6e6;
}

* {
  box-sizing: border-box;
}

body {
  margin: 10px 0;
  background-color: #2c3e50;
}

#brand {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

#brand img {
  height: 100px;
}
</style>
