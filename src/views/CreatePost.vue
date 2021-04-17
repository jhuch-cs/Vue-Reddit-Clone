<template>
  <div class="home">
    <div class="wrapper" v-if="user">
      <div class="postInfo">
        <div class="field subreddit">
          <form class="pure-form">
            <input v-model="subreddit" placeholder="Subreddit" />
          </form>
        </div>
        <div class="field">
          <form class="pure-form">
            <input v-model="title" placeholder="Title" />
          </form>
        </div>
        <input type="file" name="photo" @change="fileChanged" />
        <div class="post-body">
          <form class="pure-form">
            <textarea
              name="paragraph_text"
              cols="50"
              rows="10"
              placeholder="Post Body (Optional)"
              v-model="postBody"
              v-if="!this.file"
            ></textarea>
            <br />
            <button type="submit" v-on:click.prevent="uploadPost()">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
    <h2 class="footer">
      <a href="https://github.com/jhuch-cs/Vue-Reddit-Clone">Github</a>
      <p>Hours: 6</p>
    </h2>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CreatePost",
  data() {
    return {
      file: null,
      title: "",
      subreddit: "",
      postBody: "",
    };
  },
  async created() {
    try {
      let response = await axios.put("/api/users");
      this.$root.$data.user = response.data.user;
    } catch (error) {
      this.$root.$data.user = null;
    }
    if (this.user === null || this.user === undefined) {
      this.$router.push('LoginPage');
    }
  },
  computed: {
    user() {
      return this.$root.$data.user;
    },
  },
  methods: {
    fileChanged(event) {
      this.file = event.target.files[0];
    },
    async uploadPost() {
      try {
        let r1;
        if (this.file) {
          const formData = new FormData();
          formData.append("file", this.file, this.file.name);
          r1 = await axios.post("/api/photos", formData);
        }
        await axios.post(`/api/${this.subreddit}/post`, {
          title: this.title,
          subreddit: this.subreddit,
          text: this.postBody,
          image: this.file ? r1.data.path : null,
        });
        this.title = "";
        this.subreddit = "";
        this.postBody = "";
        this.$router.push({ name: "Home" });
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  flex-direction: column;
  width: 70%;
  margin: 0 auto;
  margin-top: 20px;
}

.field {
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 5px;
}

.subreddit {
  margin-bottom: 15px !important;
  width: 50% !important;
}

form {
  display: table;
  width: 100%;
}

i {
  display: table-cell;
  padding-left: 10px;
  width: 1px;
}

input {
  display: table-cell;
  font-size: 20px;
  border: none !important;
  box-shadow: none !important;
  width: 100%;
  height: 40px;
  background-color: rgb(44, 59, 73);
}

textarea {
  margin-top: 15px;
  resize: vertical;
  max-width: 100%;
  background-color: rgb(44, 59, 73);
  outline: none;
  box-shadow: none;
  -webkit-user-select: auto;
  user-select: auto;
}

form > button {
  background-color: #2c3e50;
  border: 1px white solid;
  border-radius: 5px;
  margin-top: 5px;
}

button {
  background-color: #2c3e50;
  border: 1px white solid;
  border-radius: 15px;
  margin: 0 8px;
}

.footer a {
  text-decoration: none !important;
  color: white;
}

.footer a:hover {
  color: lightblue;
}

@media only screen and (max-width: 600px) {
  .field {
    width: 100%;
  }

  .pure-form input {
    margin-bottom: 0px !important;
    display: inline-block !important;
  }

  .wrapper {
    width: 100%;
  }

  .postInfo {
    width: 100%;
  }
}
</style>