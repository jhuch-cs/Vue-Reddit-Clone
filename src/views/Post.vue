<template>
  <div class="post">
    <h1>This is a post page for...</h1>
    <p>{{post}}</p>
  </div>
</template>

<script>
export default {
  name: 'Post',
  data() {
    return {
      post: {},
    }
  },
  created() {
    this.post = this.$root.$data.posts.find(post => post.id === parseInt(this.$route.params.id));
  },
}
</script>