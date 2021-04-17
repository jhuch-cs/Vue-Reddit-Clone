<template>
  <div class="wrapper" v-bind:class="{ border: this.comment.level === 0 }">
    <div class="header">
      <div class="voting">
        <img
          id="upvote"
          src="../assets/up.svg"
          v-on:click="upvote()"
          v-bind:class="{ upvoted: this.comment.upvoted }"
        />
        <p>{{ this.comment.points }}</p>
        <img
          id="downvote"
          src="../assets/down.svg"
          v-on:click="downvote()"
          v-bind:class="{ downvoted: this.comment.downvoted }"
        />
      </div>
      <div class="info">
        <div class="details">
          <div v-if="!this.comment.deleted">
            <h3>
              posted by u/{{ this.comment.user.username }}
              {{ timeSince(this.comment.date) }}
            </h3>
            <div class="content">
              <div class="textContent">
                <p>{{ this.comment.text }}</p>
              </div>
            </div>
          </div>
          <div v-else>
            <h3>Comment deleted by user.</h3>
          </div>
        </div>
        <div v-if="!this.comment.deleted && user" class="info">
          <button type="button" class="reply" v-on:click="startReply">
            Reply
          </button>
          <button type="button" class="edit" v-if="this.sameUser" v-on:click="startEdit">
            Edit
          </button>
          <button type="button" class="delete" v-if="this.sameUser" v-on:click="removeContents">
            Delete
          </button>
          <button type="button" class="delete" v-if="this.sameUser" v-on:click="deleteComment">
            Super Delete
          </button>
          <div
            class="new-comment"
            v-if="this.isWritingReply || this.isEditingComment"
          >
            <form class="pure-form" v-on:submit.prevent="newComment">
              <textarea
                name="paragraph_text"
                cols="50"
                rows="5"
                :placeholder="placeholderValue"
                v-model="replyText"
                id="replyBox"
              ></textarea>
              <br />
              <button type="submit">{{commentOrEdit}}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="this.comment.level < 9">
      <div
        class="replies"
        v-for="reply in this.comment.replies"
        :key="reply.date"
      >
        <Comment :comment="reply" />
      </div>
    </div>
    <div v-else>
      <p>Maximum comment recursion reached.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Comment",
  props: {
    comment: Object,
  },
  data() {
    return {
      replyText: "",
      isWritingReply: false,
      isEditingComment: false,
    };
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
      if (this.comment.deleted) {
        return;
      }
      if (this.comment.upvoted) {
        this.comment.points--;
        this.comment.upvoted = false;
        return;
      }
      this.comment.points++;
      if (this.comment.downvoted) {
        this.comment.points++;
      }
      this.comment.upvoted = true;
      this.comment.downvoted = false;
      axios.post(`/api/upvoteComment/${this.comment.id}`);
    },
    downvote() {
      if (this.comment.deleted) {
        return;
      }
      if (this.comment.downvoted) {
        this.comment.points++;
        this.comment.downvoted = false;
        return;
      }
      this.comment.points--;
      if (this.comment.upvoted) {
        this.comment.points--;
      }
      this.comment.downvoted = true;
      this.comment.upvoted = false;
      axios.post(`/api/downvoteComment/${this.comment.id}`);
    },
    startReply() {
      this.isWritingReply = true;
      this.isEditingComment = false;
    },
    startEdit() {
      this.isEditingComment = true;
      this.isWritingReply = false;
      this.replyText = this.comment.text;
    },
    async newComment() {
      let currentLevel = this.comment.level;
      if (this.isWritingReply) {
        let newComment = {
          points: 0,
          user: this.user,
          text: this.replyText,
          date: Date.now().toString(),
          replies: [],
          level: currentLevel + 1,
        };
        this.comment.replies.push(newComment);
        let response = await axios.post(`/api/replyToComment/${this.comment.id}`, newComment);
        newComment.id = response.data.id;
      } else {
        this.comment.text = this.replyText;
        await axios.put(`/api/editComment/${this.comment.id}`, {text: this.replyText});
      }
      this.replyText = "";
      this.isWritingReply = false;
      this.isEditingComment = false;
    },
    async removeContents() {
      this.comment.text = "[deleted]";
      await axios.put(`/api/editComment/${this.comment.id}`, {text: "[deleted]"});
    },
    async deleteComment() {
      this.comment.deleted = true;
      this.comment.text = "";
      this.comment.upvoted = false;
      this.comment.downvoted = false;
      await axios.delete(`/api/editComment/${this.comment.id}`);
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
    },
  },
  computed: {
    placeholderValue() {
      if (this.isEditingComment) {
        return this.comment.text;
      }
      return "What's on your mind?";
    },
    commentOrEdit() {
      if (this.isEditingComment) {
        return "Edit";
      } else {
        return "Comment";
      }
    }, 
    user() {
      return this.$root.$data.user;
    },
    sameUser() {
      return this.$root.$data.user.username === this.comment.user.username;
    }
  },
};
</script>

<style scoped>
.wrapper {
  padding: 25px 0px 0px 20px;
  background-color: rgb(44, 59, 73);
  margin: 0 0;
}

.border {
  border: 1px black solid;
  border-radius: 10px;
  margin: 10px 0;
  padding: 15px;
}

.header {
  display: flex;
  flex-direction: row;
  justify-self: center;
  align-content: center;
  text-align: center;
  margin: 0 auto;
  width: 100%;
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
  flex-direction: column;
}

.details h3 {
  margin: 0;
  padding: 0;
  font-weight: normal;
  font-size: 12px;
  text-align: left;
}

.info h2 {
  margin: 0 25px;
  padding: 3px 0;
  text-align: left;
}

.content {
  width: 100%;
  margin: 0 0px;
  margin-top: 5px;
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

.textContent p {
  margin: 0;
  padding: 0;
  margin-bottom: 10px;
}

.info {
  text-align: left;
}

.info > button {
  margin-top: 10px;
  margin-left: 3px;
  background-color: rgb(44, 59, 73);
  border: none;
  padding: 0;
  font-size: 12px;
  display: inline-block;
  padding: 4px;
  margin: -4px;
  margin-left: 25px;
}

.info button:hover {
  background-color: gray;
}

textarea {
  margin-top: 15px;
  resize: vertical;
  max-width: 100%;
  background-color: rgb(44, 59, 73);
  outline: none;
  box-shadow: none;
  width: 100%;
  -webkit-user-select: auto;
  user-select: auto;
}

form button {
  background-color: #2c3e50;
  border: 1px white solid;
  border-radius: 5px;
  margin-top: 5px;
}

.info {
  width: 100%;
}
</style>