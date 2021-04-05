<template>
  <div class="wrapper">
    <div class="header">
      <div class="voting">
        <img
          id="upvote"
          src="../assets/up.svg"
          v-on:click="upvote()"
          v-bind:class="{ upvoted: this.post.upvoted }"
        />
        <p>{{ this.post.points }}</p>
        <img
          id="downvote"
          src="../assets/down.svg"
          v-on:click="downvote()"
          v-bind:class="{ downvoted: this.post.downvoted }"
        />
      </div>
      <div class="info">
        <div class="details">
          <img :src="'https://robohash.org/' + this.post.subreddit + '.png'" /> <!-- If we add functionality to create subreddits, fixme -->
          <h3>
            <a
              :href="'https://www.reddit.com/r/' + this.post.subreddit"
              class="link"
              >r/{{ this.post.subreddit }}</a
            >
            · posted by u/{{ this.post.user }} {{ timeSince(this.post.date) }}
          </h3>
        </div>
        <h2>{{ capitalizeFirstLetter(this.post.title) }}</h2>
      </div>
    </div>
    <router-link :to="'/post/' + this.post.id">
      <div class="content">
        <div v-if="post.image" class="image">
          <img :src="'..' + this.post.image" />
        </div>
        <div v-else class="textContent">
          <p>{{ this.post.text }}</p>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Post",
  props: {
    post: Object,
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
    upvote() {
      if (this.post.upvoted) {
        this.post.points--;
        this.post.upvoted = false;
        return;
      }
      this.post.points++;
      if (this.post.downvoted) {
        this.post.points++;
      }
      this.post.upvoted = true;
      this.post.downvoted = false;
      axios.post(`/api/upvotePost/${this.post.id}`); // TODO: Change this logic once we implement users and sessions
    },
    downvote() {
      if (this.post.downvoted) {
        this.post.points++;
        this.post.downvoted = false;
        return;
      }
      this.post.points--;
      if (this.post.upvoted) {
        this.post.points--;
      }
      this.post.downvoted = true;
      this.post.upvoted = false;
      axios.post(`/api/downvotePost/${this.post.id}`);
    },
  },
};
</script>

<style scoped>
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
  height: 15px;
  filter: invert(100%) sepia(18%) saturate(2014%) hue-rotate(193deg)
    brightness(112%) contrast(80%);
}

.voting .upvoted {
  filter: invert(66%) sepia(79%) saturate(1099%) hue-rotate(318deg)
    brightness(101%) contrast(101%);
}

.voting .downvoted {
  filter: invert(72%) sepia(32%) saturate(6688%) hue-rotate(206deg)
    brightness(102%) contrast(102%);
}

#upvote:hover {
  filter: invert(66%) sepia(79%) saturate(1099%) hue-rotate(318deg)
    brightness(101%) contrast(101%);
}

#downvote:hover {
  filter: invert(72%) sepia(32%) saturate(6688%) hue-rotate(206deg)
    brightness(102%) contrast(102%);
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
  height: 20px;
  margin-right: 5px;
}

.details h3 {
  margin: 0;
  padding: 0;
  font-weight: normal;
  text-align: left;
}

.info h2 {
  margin: 0 25px;
  padding: 3px 0;
  text-align: left;
}

.content {
  width: 95%;
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
</style>