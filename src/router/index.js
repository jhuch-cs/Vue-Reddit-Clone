import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Comments from '../views/Comments.vue'
import CreatePost from '../views/CreatePost.vue'
import LoginPage from '../views/LoginPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/post/:id',
    name: 'post',
    component: Comments
  },
  {
    path: '/createPost',
    name: 'CreatePost',
    component: CreatePost
  },
  {
    path: '/loginPage',
    name: 'LoginPage',
    component: LoginPage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
