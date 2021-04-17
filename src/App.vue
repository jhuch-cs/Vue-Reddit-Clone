<template>
  <div id="app">
    <div id="menu">
      <button type="button" class="logout" @click="logout" :disabled='!this.user'>Logout</button>
      <button type="button" class="login" :disabled='this.user'>
        <router-link to="/loginPage"> {{this.loginText}} </router-link>
      </button>
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

<script>
import axios from "axios";
export default {
  name: "app",
  methods: {
    async logout() {
      try {
        await axios.delete("/api/users");
        this.$root.$data.user = null;
      } catch (error) {
        this.$root.$data.user = null;
      }
      this.$router.push({path: '/'});
    },
  },
  computed: {
    loginText() {
      if (this.user) {
        return `Logged In as ${this.user.username}`;
      }
      return "Login";
    },
    user() {
      return this.$root.$data.user;
    }
  }
};
</script>

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

.login {
  position: absolute;
  right: 20px;
  top: 10px;
  padding: 5px;
  border-radius: 5px;
  float: right;
  text-align: center;
  border: 1px white solid;
  background-color: rgb(44, 59, 73);
}

.login > a {
  color: white;
  text-decoration: none;
}

.logout {
  position: absolute;
  left: 20px;
  top: 10px;
  padding: 5px;
  border-radius: 5px;
  float: right;
  text-align: center;
  border: 1px white solid;
  background-color: rgb(44, 59, 73);
  color: white;
}
</style>
