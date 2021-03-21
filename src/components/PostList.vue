<template>
  <div class="wrapper">
    <div class="posts">
      <div class="post" v-for="post in posts" :key="post.id">
        <Post :post="post" />
        <div class="post-footer">
          <router-link :to="'/post/' + post.id" class="link">
            <h2>{{ post.comments.length }} Comments</h2>
          </router-link>
        </div>
      </div>
    </div>
    <h1 v-if="posts.length === 0">No posts here!</h1>
  </div>
</template>

<script>
import Post from "@/components/Post.vue";

export default {
  name: "PostList",
  components: {
    Post,
  },
  props: {
    posts: Array,
  },
};
</script>

<style scoped>
.post {
  width: 70%;
  margin: 0 auto;
  margin-bottom: 20px;
}

.post {
  border: 1px black solid;
  border-radius: 10px;
  padding: 5px;
  background-color: rgb(44, 59, 73);
}

.post:hover {
  border: 1px white solid;
}

.post-footer a {
  text-decoration: none;
  color: white;
}

.post-footer a:hover {
  color: lightblue;
}

@media only screen and (max-width: 600px) {
  .post {
    width: 100%;
  }

  body {
    margin: 10px 0;
  }
}
</style>