<template>
  <div class="wrapper">
    <div class="posts">
      <div class="post" v-for="post in posts" :key="post.id">
        <router-link :to="'/post/' + post.id">
        <div class="header">
          <div class="voting">
            <img id="upvote" src="../assets/up.svg" v-on:click="upvote(post)" v-bind:class="{ upvoted: post.upvoted }"/>
            <p>{{post.points}}</p>
            <img id="downvote" src="../assets/down.svg" v-on:click="downvote(post)" v-bind:class="{ downvoted: post.downvoted }"/>
          </div>
          <div class="info">
            <div class="details">
              <img :src="post.icon" />
              <h3>
                <a :href="'https://www.reddit.com/r/' + post.subreddit" class="link">r/{{ post.subreddit }}</a> · posted by {{post.user}} {{timeSince(post.date)}}
              </h3>
            </div>
            <h2>{{ capitalizeFirstLetter(post.title) }}</h2>
          </div>
        </div>
        <div class="content">
          <div v-if="post.image" class="image">
            <img :src="post.image" />
          </div>
          <div v-else class="textContent">
            <p>{{post.text}}</p>
          </div>
        </div>
        <div class="post-footer">
          <router-link :to="'/post/' + post.id" class="link">
            <h2>{{post.comments.length}} Comments</h2>
          </router-link>
        </div>
        </router-link>
      </div>
    </div>
    <h1 v-if="posts.length === 0">No posts here!</h1>
  </div>
</template>

<script>
export default {
  name: "PostList",
  props: {
    posts: Array
  },
  methods: {
    timeSince(date) {
      date = parseInt(date);
      let start = new Date(date);
      let end = Date.now();
      let secs = Math.floor((end - start) / 1000);
      if (secs < 60) {
        return `${secs} seconds ago`;
      } else if (secs < 3600) {
        return `${Math.floor(secs / 60)} minutes ago`;
      } else if (secs < 86400) {
        return `${Math.floor(secs / 3600)} hours ago`;
      } else if (secs < 31536000) {
        return `${Math.floor(secs / 86400)} days ago`;
      } else {
        return `${Math.floor(secs / 31536000)} years ago`;
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    upvote(post) {
      if (post.upvoted) { return; }
      post.points++;
      if (post.downvoted) { post.points++; }
      post.upvoted = true;
      post.downvoted = false;
    },
    downvote(post) {
      if (post.downvoted) { return; }
      post.points--;
      if (post.upvoted) { post.points--; }
      post.downvoted = true;
      post.upvoted = false;
    },
    hasVoted(post) {
      return post.upvoted || post.downvoted;
    }
  }
};
</script>

<style scoped> 
.post {
  width: 70%;
  margin: 0 auto;
  margin-bottom: 20px;
}

.header {
  display: flex;
  flex-direction: row;
  justify-self: center;
  align-content: center;
  text-align: center;
  margin: 0 auto;
  width: 100%;
  margin-bottom: 10px;
}

.voting img {
  height: 10px;
  filter: invert(100%) sepia(18%) saturate(2014%) hue-rotate(193deg) brightness(112%) contrast(80%);
}

.voting .upvoted {
  filter: invert(66%) sepia(79%) saturate(1099%) hue-rotate(318deg) brightness(101%) contrast(101%);
}

.voting .downvoted {
  filter: invert(72%) sepia(32%) saturate(6688%) hue-rotate(206deg) brightness(102%) contrast(102%);
}

#upvote:hover {
  filter: invert(66%) sepia(79%) saturate(1099%) hue-rotate(318deg) brightness(101%) contrast(101%);
}

#downvote:hover {
  filter: invert(72%) sepia(32%) saturate(6688%) hue-rotate(206deg) brightness(102%) contrast(102%);
}

.voting p {
    margin: 0;
    padding: 0;
}

.details {  
  margin-left: 20px;
  display: flex;
}

.details img {
  height: 25px;
  margin-right: 5px;
}

.details h3 {
   margin: 0;
   padding: 0;
}

.info h2 {
  margin: 0 25px;
  padding: 3px 0;
  text-align: left;
}

.content {
  width: 100%;
  margin: 0 10px;
}

.content img {
  width: 90%;
}

.post-footer h2 {
  margin: 0;
  padding: 0;
}

a {
  color: #e6e6e6;
  text-decoration: none;
}

.link {
  color: white;
}

.link:hover {
  color: lightblue;
}

.content .textContent {
  width: 90%;
  text-align: left;
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

@media only screen and (max-width: 600px) {
  .post {
    width: 100%;
  }

  body {
    margin: 10px 0;
  }
}
</style>