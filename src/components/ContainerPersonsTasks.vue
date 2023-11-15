<template>
    <div>
        <div class="user-list">
            <v-btn @click="OpenDate" style="margin-bottom:0.5rem" variant="outlined">
                <v-icon>mdi-file-export</v-icon>
                <b>Excel Все</b>
            </v-btn>
            <v-text-field v-model="SearchName" label="Имя"></v-text-field>
            <div style="height: 80vh;overflow-y: scroll;">
                <div class="padding">
                    <transition-group name="list">
                        <div v-for="(user, index) in this.$store.state.users_names" :key="'user_' + index"
                            @click="openModal(user)" :class="{ 'selected': user === selectedUser }">
                            <div class="hover">
                                <span class="username">{{ user }}</span>
                            </div>
                        </div>
                    </transition-group>
                </div>
            </div>
        </div>
        <ExportAllUserPosts :showDate="showDate" @update:showDate="CloseDate" :dateRange="dateRange"
            @update:dateRange="dateRange = $event"></ExportAllUserPosts>
        <ExportUserPosts :showUserDate="showUserDate" @update:showUserDate="CloseUserDate" :dateUserRange="dateUserRange"
            @update:dateUserRange="dateUserRange = $event"></ExportUserPosts>
        <UserTasks :isOpen="isOpen" @closeModal="closeModal" :selectedUser="selectedUser" @OpenDate="OpenUserDate"
            @setActiveTask="setActiveTask($event)">
        </UserTasks>
        <div class="container_tasks">
            <div>
                <v-btn class="drawerShow" @click="this.isOpen = true" v-show="!show" rounded="xl" size="x-large">
                    <v-icon left>mdi-eye</v-icon>
                </v-btn>
            </div>
            <div>
                <v-btn class="tasksArchive" @click="openArchive" variant="tonal"><v-icon>mdi-calendar-check</v-icon></v-btn>
                <UserTasksArchive :dataToModal="dataToModal" @update:dataToModal="dataToModal = $event"
                    ref="modalComponent" />
            </div>
            <div>
                <v-btn class="postsArchive" @click="openArchivePosts"
                    variant="tonal"><v-icon>mdi-calendar-check</v-icon></v-btn>
                <UserPostsArchive :dataToDialog="dataToDialog" @update:dataToDialog="dataToDialog = $event"
                    ref="dialogComponent">
                </UserPostsArchive>
            </div>
            <v-container>
                <div v-if="this.nameTask" style="max-width: 500px" class="d-flex">
                    <div>
                        <p class="text-h3" style="max-width: 400px">{{ this.nameTask }}</p>
                    </div>
                    <v-spacer></v-spacer>
                    <div>
                        <v-btn @click="openDialogTask(taskData)" variant="outlined"
                            size="large"><v-icon>mdi-book</v-icon></v-btn>
                    </div>
                </div>
                <TaskDialog :taskData="taskData" :dialog="taskData.dialog" @update:dialog="taskData.dialog = $event"
                    :Role="Role" :isLoadingPost="isLoadingPost">
                </TaskDialog>
            </v-container>
            <div class="container_posts">
                <v-container>
                    <v-row>
                        <v-col cols="4" class="column">
                            <h2>Todo</h2>
                            <transition-group name="task_to_do">
                                <div v-for="postData in this.$store.state.filterposts" :key="postData.post.id">
                                    <div v-if="postData.post.action === 'to do'">
                                        <v-card block rounded-lg @click="openDialogPost(postData)"
                                            :class="PostCardClass(postData)">
                                            <v-card-text class="text-h6">{{ postData.post.name
                                            }}</v-card-text>

                                            <v-divider></v-divider>

                                            <v-card-text>{{ formattedDate(postData.post.deadline) }}
                                                <v-icon style="left: 10px;" color="red"
                                                    v-if="postData.timeUntilDeadline < 0">mdi-alert-circle</v-icon>
                                                <v-icon style="left: 10px;"
                                                    v-else-if="postData.timeUntilDeadline > 0">mdi-clock-fast</v-icon>
                                            </v-card-text>
                                        </v-card>
                                        <SubTaskCurrent :postData="postData" :dialog="postData.dialog"
                                            @update:dialog="postData.dialog = $event" :Role="Role">
                                        </SubTaskCurrent>
                                    </div>
                                </div>
                            </transition-group>
                        </v-col>
                        <v-col cols="4" class="column">
                            <h2>Doing</h2>
                            <transition-group name="task_doing">
                                <div v-for="postData in this.$store.state.filterposts" :key="postData.post.id">
                                    <div v-if="postData.post.action === 'doing'">
                                        <v-card block rounded-lg @click="openDialogPost(postData)"
                                            :class="PostCardClass(postData)">
                                            <v-card-text class="text-h6">{{ postData.post.name
                                            }}</v-card-text>

                                            <v-divider></v-divider>

                                            <v-card-text>{{ formattedDate(postData.post.deadline) }}
                                                <v-icon style="left: 10px;" color="red"
                                                    v-if="postData.timeUntilDeadline < 0">mdi-alert-circle</v-icon>
                                                <v-icon style="left: 10px;"
                                                    v-else-if="postData.timeUntilDeadline > 0">mdi-clock-fast</v-icon>
                                            </v-card-text>
                                        </v-card>
                                        <SubTaskCurrent :postData="postData" :dialog="postData.dialog"
                                            @update:dialog="postData.dialog = $event" :Role="Role">
                                        </SubTaskCurrent>
                                    </div>
                                </div>
                            </transition-group>
                        </v-col>
                        <v-col cols="4" class="column">
                            <h2>Question</h2>
                            <transition-group name="task_question">
                                <div v-for="postData in this.$store.state.filterposts" :key="postData.post.id">
                                    <div v-if="postData.post.action === 'question'">
                                        <v-card block rounded-lg @click="openDialogPost(postData)"
                                            :class="PostCardClass(postData)">
                                            <v-card-text class="text-h6">{{ postData.post.name
                                            }}</v-card-text>

                                            <v-divider></v-divider>

                                            <v-card-text>{{ formattedDate(postData.post.deadline) }}
                                                <v-icon style="left: 10px;" color="red"
                                                    v-if="postData.timeUntilDeadline < 0">mdi-alert-circle</v-icon>
                                                <v-icon style="left: 10px;"
                                                    v-else-if="postData.timeUntilDeadline > 0">mdi-clock-fast</v-icon>
                                            </v-card-text>
                                        </v-card>
                                        <SubTaskCurrent :postData="postData" :dialog="postData.dialog"
                                            @update:dialog="postData.dialog = $event" :Role="Role">
                                        </SubTaskCurrent>
                                    </div>
                                </div>
                            </transition-group>
                        </v-col>
                    </v-row>
                    <TaskEdit></TaskEdit>
                </v-container>
            </div>
        </div>
    </div>
</template>
  
<script>
import UserTasks from '@/components/UI/UserTasks.vue';
import ExportAllUserPosts from '@/components/UI/helps/ExportAllUserPosts.vue';
import ExportUserPosts from '@/components/UI/helps/ExportUserPosts.vue';
import UserTasksArchive from '@/components/UI/UserTasksArchive.vue';
import UserPostsArchive from '@/components/UI/UserPostsArchive.vue';
import TaskDialog from '@/components/UI/helps/TaskDialog.vue';
import TaskEdit from '@/components/UI/helps/TaskEdit.vue';
import SubTaskCurrent from './UI/helps/SubTaskCurrent.vue';
import axios from 'axios';
import timestamp from '@/utils/dates';
import { getTimestampEnd, getTimestampStart } from "@/utils/dates";

export default {
    components: {
        ExportAllUserPosts,
        ExportUserPosts,
        UserTasks,
        UserTasksArchive,
        UserPostsArchive,
        TaskDialog,
        TaskEdit,
        SubTaskCurrent,
    },
    props: {
        Role: Boolean,
    },
    data() {
        return {
            isOpen: false,
            isLoadingPost: false,
            selectedUser: null,
            SearchName: '',
            originalData: [],
            projectTasks: null,
            taskPosts: null,
            fav: true,
            menu: false,
            message: false,
            hints: true,
            dateRange: this.calculateDateRange(),
            dateUserRange: this.calculateDateRange(),
            dataToModal: this.calculateDateRange(),
            dataToDialog: this.calculateDateRange(),
            showDate: false,
            showUserDate: false,
            nameTask: '',
            taskData: {
                dialog: false,
                task: {
                    comments: []
                }
            },
        };
    },
    created() {
        this.originalData = this.$store.state.users_names
    },
    watch: {
        SearchName(val) {
            const search = val.toLowerCase();
            if (search === '') {
                this.$store.commit("SET_USERS_NAMES", this.originalData)
            } else {
                this.$store.commit("SET_USERS_NAMES", this.originalData.filter(user => user.toLowerCase().includes(search)))
            }
        },
        async dateRange(vals) {
            this.exportToExcelUsers(timestamp(vals[0]), timestamp(vals[1])); // [0, 20000], timestamp types
        },
        async dateUserRange(vals) {
            this.exportToExcelUser(timestamp(vals[0]), timestamp(vals[1]), this.selectedUser);
        },
        async dataToModal(val) {
            this.getUserArchive(timestamp(val[0]), timestamp(val[1]), this.selectedUser)
        },
        async dataToDialog(value) {
            this.getUserArchive(timestamp(value[0]), timestamp(value[1]), this.selectedUser)
        }
    },
    methods: {
        OpenDate() {
            this.showDate = true;
        },
        CloseDate() {
            this.showDate = false;
        },
        OpenUserDate() {
            this.showUserDate = true;
        },
        CloseUserDate() {
            this.showUserDate = false;
        },
        closeModal() {
            this.isOpen = false;
        },
        openArchive() {
            this.$refs.modalComponent.openModal();
        },
        openArchivePosts() {
            this.$refs.dialogComponent.openModal();
        },
        openDialogPost(postData) {
            postData.dialog = true;
            this.selectedProjectData = postData;
        },
        formattedDate(time_completed) {
            if (time_completed) {
                const timestampInMilliseconds = time_completed * 1000;
                const date = new Date(timestampInMilliseconds);
                return date.toLocaleString();
            }
            return '';
        },
        setActiveTask(task) {
            this.nameTask = task.task.name;
            this.taskData = task;
            const taskId = task.task.id;
            this.$store.commit("SET_CURRENT_ID_TASK", taskId);
            const filteredSubtasks = this.$store.state.chose_user_current_posts.filter(post => post.post.task === taskId);
            this.$store.commit("SET_FILTER_POSTS", filteredSubtasks);
        },
        calculateDateRange() {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            // Начальная дата - 1-е число текущего месяца
            const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);

            // Конечная дата - текущее число текущего месяца
            const endOfMonth = new Date(currentYear, currentMonth, today.getDate(), 23, 59, 59, 999);

            return [startOfMonth, endOfMonth];
        },
        PostCardClass(postData) {
            console.log('Called CardClass with:', postData);
            const cardClass = {
                'ma-2': true,
                'mt-3': true,
            };
            if (postData.urgency === 1) {
                cardClass['red-card'] = true;
            } else if (postData.urgency === 2) {
                cardClass['orange-card'] = true;
            } else if (postData.urgency === 3) {
                cardClass['yellow-card'] = true;
            } else if (postData.urgency === 4) {
                cardClass['white-card'] = true;
            } else if (postData.urgency == undefined) {
                cardClass['green-card'] = true;
            }
            return cardClass;
        },
        taskRemainingTime() {
            if (!this.projectTasks || this.projectTasks.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.projectTasks.map(task => {
                const timeUntilDeadline = task.deadline - currentTime;
                const totalTime = task.deadline - task.created_at;
                const timeRemainingPercentage = (timeUntilDeadline / totalTime) * 100;
                const days = Math.floor(timeUntilDeadline / 86400);
                const hours = Math.floor((timeUntilDeadline % 86400) / 3600);
                const minutes = Math.floor(((timeUntilDeadline % 86400) % 3600) / 60);

                let urgency = 4; // По умолчанию 4 для всех остальных проектов

                if (timeUntilDeadline < 0) {
                    urgency = 1; // Если дедлайн просрочен
                } else if (timeRemainingPercentage <= 25) {
                    urgency = 2; // Если осталось менее 25% времени
                } else if (timeRemainingPercentage <= 50) {
                    urgency = 3; // Если осталось менее 50% времени
                }

                return {
                    task,
                    timeUntilDeadline,
                    timeRemainingPercentage,
                    remainingDays: Math.abs(days),
                    remainingHours: Math.abs(hours),
                    remainingMinutes: Math.abs(minutes),
                    urgency,
                }
            }).sort((a, b) => {
                // Сортировка по уровню срочности и времени до дедлайна
                if (a.urgency !== b.urgency) {
                    return a.urgency - b.urgency;
                }
                if (a.urgency === 1) {
                    return -1;
                } else if (b.urgency === 1) {
                    return 1;
                }
                return a.timeUntilDeadline - b.timeUntilDeadline;
            });
        },
        postRemainingTime() {
            if (!this.taskPosts || this.taskPosts.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.taskPosts.map(post => {
                const timeUntilDeadline = post.deadline - currentTime;
                const days = Math.floor(timeUntilDeadline / 86400);
                const hours = Math.floor((timeUntilDeadline % 86400) / 3600);
                const minutes = Math.floor(((timeUntilDeadline % 86400) % 3600) / 60);

                let urgency = 4; // По умолчанию 4 для всех остальных проектов

                if (timeUntilDeadline < 604800 && timeUntilDeadline > 0 && days > 3) {
                    // Если осталось менее недели
                    urgency = 3;
                } else if (days < 3 && timeUntilDeadline > 0) {
                    // Если осталось менее 3 дней
                    urgency = 2;
                } else if (timeUntilDeadline < 0) {
                    // Если дедлайн просрочен
                    urgency = 1;
                }

                return {
                    post,
                    timeUntilDeadline,
                    remainingDays: Math.abs(days),
                    remainingHours: Math.abs(hours),
                    remainingMinutes: Math.abs(minutes),
                    urgency,
                }
            }).sort((a, b) => {
                // Сортировка по уровню срочности и времени до дедлайна
                if (a.urgency !== b.urgency) {
                    return a.urgency - b.urgency;
                }
                if (a.urgency === 1) {
                    return -1;
                } else if (b.urgency === 1) {
                    return 1;
                }
                return a.timeUntilDeadline - b.timeUntilDeadline;
            });
        },
        getToken() {
            const token = localStorage.getItem("token");
            const cleanToken = token.replaceAll("\"", "");
            return {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
            };
        },
        getRefreshToken() {
            const refresh_token = localStorage.getItem("refresh_token");
            const clearRef = refresh_token.replaceAll("\"", "");
            return {
                headers: {
                    'Authorization': `Bearer ${clearRef}`
                },
            };
        },
        getTokenForExcel() {
            const token = localStorage.getItem("token");
            const cleanToken = token.replaceAll("\"", "");
            return {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
                responseType: 'blob',
            };
        },
        async exportToExcelUsers(start, end) {
            try {
                const response = await axios.post(`https://gosu-tasks-api.vercel.app/admin/exportexcel/all_posts?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, undefined, this.getTokenForExcel());
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'All_User_Posts.xlsx');
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
            }
            catch (error) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.post(`https://gosu-tasks-api.vercel.app/admin/exportexcel/all_posts?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, undefined, this.getTokenForExcel());
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'All_User_Posts.xlsx');
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                console.error('Ошибка при получении задач:', error);
            }
        },
        async exportToExcelUser(start, end, selectedUser) {
            try {
                const response = await axios.post(`https://gosu-tasks-api.vercel.app/admin/exportexcel/${selectedUser}?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, undefined, this.getTokenForExcel());
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${selectedUser}.xlsx`);
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
            }
            catch (error) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.post(`https://gosu-tasks-api.vercel.app/admin/exportexcel/${selectedUser}?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, undefined, this.getTokenForExcel());
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${selectedUser}.xlsx`);
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                console.error('Ошибка при получении задач:', error);
            }
        },
        async openModal(user) {
            this.selectedUser = user;
            this.$store.commit("SET_SELECTED_USER", user);
            this.isOpen = true;
            this.$store.commit("SET_LODING", true);
            try {
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_user_tasks&posts/${user}`, this.getToken());
                const currentTasks = response.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_TASKS_LENGTH", this.taskRemainingTime());
                const currentPosts = response.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_CHOSE_USER_CURRENT_POSTS", this.postRemainingTime());

                const response1 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${user}`, this.getToken());
                const completedTask = response1.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response1.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);

                console.log(this.$store.state.user_current_tasks)
                console.log(this.$store.state.user_current_posts)
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_users_tasks&posts/${user}`, this.getToken());
                const currentTasks = response.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.taskRemainingTime());
                const currentPosts = response.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_CHOSE_USER_CURRENT_POSTS", this.postRemainingTime());

                const response2 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${user}`, this.getToken());
                const completedTask = response2.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response2.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);

                console.log(e)
            } finally {
                this.$store.commit("SET_LODING", false);
            }

        },
        async getUserArchive(start, end) {
            this.$store.commit("SET_LODING_ARCHIVE", true);
            try {
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${this.selectedUser}?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, this.getToken());
                const completedTask = response.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${this.selectedUser}?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, this.getToken());
                const completedTask = response.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
                console.log(e)
            } finally {
                this.$store.commit("SET_LODING_ARCHIVE", false);
            }
        },
        async openDialogTask(taskData) {
            taskData.dialog = true;
            this.$store.commit("SET_CURRENT_TASK", taskData.task.id)
            this.isLoadingPost = true;
            let id = taskData.task.id
            try {
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/task_posts/${id}`);
                this.taskPosts = response.data;
                const completedPosts = this.taskPosts.filter(item => item.status === 'completed');
                const currentPosts = this.taskPosts.filter(item => item.status === 'current');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_POSTS_CURRENT", this.postRemainingTime());
                this.$store.commit("SET_POSTS_COMPLETED", completedPosts);
            } catch (error) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/task_posts/${id}`);
                this.taskPosts = response.data;
                const completedPosts = this.taskPosts.filter(item => item.status === 'completed');
                const currentPosts = this.taskPosts.filter(item => item.status === 'current');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_POSTS_CURRENT", this.postRemainingTime());
                this.$store.commit("SET_POSTS_COMPLETED", completedPosts);
                console.error(error);
            } finally {
                this.isLoadingPost = false;
            }
        },
    },
}

</script>
  
<style scoped>
.white-card {
    border: solid 2px #757575;
}

.red-card {
    border: solid 2px red;
}

.orange-card {
    border: solid 2px orange;
}

.yellow-card {
    border: solid 2px yellow;
}

.green-card {
    border: solid 2px green;
}

.list-item {
    display: inline-block;
    margin-right: 10px;
}

.list-enter-active,
.list-leave-active {
    transition: all 1s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.list-list-move {
    transition: transform 0.8s ease;
}

.user-list {
    position: fixed;
    top: 64px;
    left: 0;
    height: calc(100vh - 50px);
    width: 180px;
    background-color: #f0f0f0;
    padding: 0.5rem;
    z-index: 1002;
}

.padding div {
    border-radius: 10px;
    cursor: pointer;
    padding: 0.125rem;
    transition: background-color 0.3s ease;
}

.hover:hover {
    background-color: #E3F2FD;
}

.selected {
    background-color: #65b2f0;
}

.username {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.container_tasks {
    margin-left: 180px;
    margin-top: 64px;
    display: flex;
    flex-direction: column;
}

.tasksArchive {
    position: absolute;
    right: 0;
    width: 40px;
    height: 300px;
    top: 180px;
}

.postsArchive {
    position: absolute;
    right: 0;
    width: 40px;
    height: 300px;
    top: 520px;
}

.drawerShow {
    position: fixed;
    left: 155px;
    top: 90vh;
}
</style>