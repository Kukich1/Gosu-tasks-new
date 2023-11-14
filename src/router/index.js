import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/Login.vue'
import Main from '@/pages/Main.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/main',
    name: 'main',
    component: Main
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
	const token = localStorage.getItem('token');
	const refreshToken = localStorage.getItem('refresh_token')
	if (to.path !== "/" && !token && !refreshToken) {
		next("/");
	} else {
		next()
	}
})
export default router
