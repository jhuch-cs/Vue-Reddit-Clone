<template>
  <div class="post">
    <div class="post-content">
      <Post :post="post" />
      <div class="new-comment" v-if="user">
        <form class="pure-form" v-on:submit.prevent="newComment">
          <textarea
            name="paragraph_text"
            cols="50"
            rows="10"
            placeholder="What are your thoughts?"
            v-model="commentText"
          ></textarea>
          <br />
          <button type="submit">Comment</button>
        </form>
      </div>
      <p v-else>Please login to comment</p> <!-- Present login on click -->
    </div>
    <div class="sort">
      <button
        type="button"
        v-on:click="sortTop"
        v-bind:class="{ filled: this.sort == 'top' }"
      >
        Top
      </button>
      <button
        type="button"
        v-on:click="sortNew"
        v-bind:class="{ filled: this.sort == 'new' }"
      >
        New
      </button>
    </div>
    <div class="comments">
      <Comment
        v-for="comment in sortedComments"
        :key="comment.id"
        :comment="comment"
      />
      <p v-if="sortedComments.length == 0">No comments yet!</p>
    </div>
    <h2 class="footer">
      <a href="https://github.com/jhuch-cs/Vue-Reddit-Clone">Github</a>
      <p>Hours: 6</p>
    </h2>
  </div>
</template>

<script>
import axios from "axios";
import Post from "@/components/Post.vue";
import Comment from "@/components/Comment.vue";

export default {
  name: "Comments",
  components: {
    Post,
    Comment,
  },
  data() {
    return {
      post: {},
      commentText: "",
      sort: "",
    };
  },
  created: async function () {
    let response = await axios.get(`/api/post/${this.$route.params.id}`);
    this.post = response.data;
    try {
      let user_response = await axios.put('/api/users');
      this.$root.$data.user = user_response.data.user;
    } catch (error) {
      this.$root.$data.user = null;
    }
  },
  methods: {
    async newComment() {
      let newComment = {
        points: 0,
        user: this.user,
        text: this.commentText,
        date: Date.now().toString(),
        replies: [],
        level: 0,
      };
      this.post.comments.push(newComment);
      this.commentText = "";
      let response = await axios.post(
        `/api/replyToPost/${this.post.id}`,
        newComment
      );
      newComment.id = response.data.id;
    },
    sortTop() {
      this.sort = "top";
    },
    sortNew() {
      this.sort = "new";
    },
    deletedItem(id) {
      console.log(`Comment with id ${id} was deleted`);
    },
  },
  computed: {
    sortedComments() {
      if (this.sort === "top") {
        return this.post.comments.slice().sort((comment1, comment2) => {
          let a = comment1.points;
          let b = comment2.points;
          return b - a;
        });
      } else if (this.sort === "new") {
        return this.post.comments.slice().sort((comment1, comment2) => {
          let a = new Date(comment1);
          let b = new Date(comment2);
          return (b < a) - (b > a);
        });
      } else {
        if (this.post.comments === null || this.post.comments === undefined) {
          return [];
        }
        return this.post.comments;
      }
    },
    user() {
      return this.$root.$data.user;
    }
  },
};
</script>

<style scoped>
.post {
  width: 50%;
  margin: 0 auto;
  margin-bottom: 20px;
}

.post-content {
  border: 1px black solid;
  border-radius: 10px;
  padding: 5px;
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

.sort {
  display: flex;
  margin-top: 10px;
  border: 1px black solid;
  border-radius: 10px;
  height: 40px;
  padding: 5px;
  background-color: rgb(44, 59, 73);
}

button {
  background-color: #2c3e50;
  border: 1px white solid;
  border-radius: 15px;
  margin: 0 8px;
}

.filled {
  background-color: white;
  color: #2c3e50;
}

@media only screen and (max-width: 600px) {
  .post {
    width: 100%;
  }

  body {
    margin: 10px 0;
  }
}

@media only screen and (min-width: 600px) and (max-width: 800px) {
  .post {
    width: 90% !important;
  }

  body {
    margin: 10px 0;
  }
}

@media only screen and (min-width: 800px) and (max-width: 1400px) {
  .post {
    width: 80% !important;
  }

  body {
    margin: 10px 0;
  }
}

.footer a {
  text-decoration: none !important;
  color: white;
}

.footer a:hover {
  color: lightblue;
}
</style>