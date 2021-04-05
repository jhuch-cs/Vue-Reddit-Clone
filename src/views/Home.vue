<template>
  <div class="home">
    <div class="wrapper">
      <div class="search">
        <form class="pure-form">
          <i class="fas fa-search"></i><input v-model="searchText" />
        </form>
      </div>
    </div>
    <router-link to="/createPost">
      <button type="button">Create New Post</button>
    </router-link>
    <!-- link to /createPost here -->
    <PostList :posts="posts" />
    <h2 class="footer">
      <a href="https://github.com/jhuch-cs/Vue-Reddit-Clone">Github</a>
    </h2>
  </div>
</template>

<script>
import axios from "axios";
import PostList from "@/components/PostList.vue";

export default {
  name: "Home",
  components: {
    PostList,
  },
  data() {
    return {
      searchText: "",
      retrievedPosts: [],
    };
  },
  created: async function () {
    let response = await axios.get("/api/posts?top=1");
    this.retrievedPosts = response.data;
  },
  computed: {
    posts() {
      let text = this.searchText;
      return this.retrievedPosts.filter(
        (post) =>
          (!post.image &&
            post.text.toLowerCase().search(text.toLowerCase()) >= 0) ||
          post.subreddit.toLowerCase().search(text.toLowerCase()) >= 0 ||
          post.user.toLowerCase().search(text.toLowerCase()) >= 0 ||
          post.title.toLowerCase().search(text.toLowerCase()) >= 0
      );
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
}

.search {
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 50%;
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
  background-color: #2c3e50;
}

button {
  border-radius: 5px;
  border: 1px white solid;
  color: white;
  margin-bottom: 20px;
  padding: 5px;
  background-color: #2c3e50;
}

.footer a {
  text-decoration: none !important;
  color: white;
}

.footer a:hover {
  color: lightblue;
}

@media only screen and (max-width: 600px) {
  .search {
    width: 100%;
  }

  .pure-form input {
    margin-bottom: 0px !important;
    display: inline-block !important;
  }
}
</style>