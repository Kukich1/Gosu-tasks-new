<template>
    <v-navigation-drawer app v-model="show" class="drawer" width="300" permanent>
        <div class="d-flex">
            <div style="width:200px">
                <v-text-field v-model="SearchQuery" label="Название проекта"></v-text-field>
            </div>
            <div style="display: flex; flex-direction: column; padding-left:10px">
                <div style="padding:5px">
                    <v-btn @click="show = !show" size="x-small" variant="tonal">
                        <v-icon left>mdi-eye-off</v-icon>
                    </v-btn>
                </div>
                <div style="padding-left:5px">
                    <v-btn @click="toggleSort" size="x-small" variant="tonal">
                        <v-icon left>{{ sortAscending ? 'mdi-sort-ascending' : 'mdi-sort-descending' }}</v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
        <div>
            <p>Все задачи - {{ this.TasksLength }}</p>
        </div>
        <div class="tasks-table" v-if="this.$store.state.user_current_tasks.length > 0">
            <div class="table-row header">
                <div class="cell task-project-header">
                    <div class="task">
                        <v-container>
                            <p>Задача</p>
                        </v-container>
                    </div>
                    <div class="project">
                        <p>Проект</p>
                    </div>
                </div>
                <div class="cell deadline-header">
                    <p style="display:flex; justify-content:center; align-items:center">Дедлайн</p>
                </div>
            </div>
            <transition-group name="task_current">
                <div class="table-row" v-for="task in this.$store.state.user_current_tasks" :key="task.id"
                    @click="setActiveTask(task)">
                    <div class="cell task-project hover-effect">
                        <div class="task">
                            <v-container>
                                <p>{{ task.task.name }}</p>
                            </v-container>
                        </div>
                        <div class="project">
                            <p>{{ task.task.project_name }}</p>
                        </div>
                    </div>
                    <div class="cell deadline">
                        {{ formattedDate(task.task.deadline) }}
                    </div>
                </div>
            </transition-group>
        </div>
        <div v-else>
            <v-col cols="12" class="text-h3 center">
                <div>
                    Пусто
                </div>
            </v-col>
        </div>
    </v-navigation-drawer>


    <div class="container_tasks">
        <div>
            <v-btn class="drawerShow" @click="show = !show" v-show="!show" rounded="xl" size="x-large">
                <v-icon left>mdi-eye</v-icon>
            </v-btn>
        </div>
        <div>
            <v-btn class="tasksArchive" @click="openModal" variant="tonal"><v-icon>mdi-calendar-check</v-icon></v-btn>
            <UserTasksArchive :dataToModal="dataToModal" @update:dataToModal="this.$emit('update:dataToModal', $event)"
                ref="modalComponent" />
        </div>
        <div>
            <v-btn class="postsArchive" @click="openModalPosts" variant="tonal"><v-icon>mdi-calendar-check</v-icon></v-btn>
            <UserPostsArchive :dataToDialog="dataToDialog" @update:dataToDialog="this.$emit('update:dataToDialog', $event)"
                ref="dialogComponent"></UserPostsArchive>
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
                    <v-col cols="3" class="column">
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
                    <v-spacer></v-spacer>
                    <v-col cols="3" class="column">
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
                    <v-spacer></v-spacer>
                    <v-col cols="3" class="column">
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
            </v-container>
        </div>
        <SubTaskEdit></SubTaskEdit>
    </div>
</template>
    
<script>
import UserTasksArchive from '@/components/UI/UserTasksArchive.vue';
import UserPostsArchive from '@/components/UI/UserPostsArchive.vue';
import TaskDialog from '@/components/UI/helps/TaskDialog.vue';
import SubTaskCurrent from '@/components/UI/helps/SubTaskCurrent.vue';
import SubTaskEdit from '@/components/UI/helps/SubTaskEdit.vue';
import axios from 'axios'
export default {
    components: {
        UserTasksArchive,
        UserPostsArchive,
        TaskDialog,
        SubTaskCurrent,
        SubTaskEdit,
    },
    props: {
        dataToModal: Boolean,
        dataToDialog: Boolean,
        Role: Boolean,
    },
    data: () => ({
        isLoadingPost: false,
        dialog: false,
        show: true,
        originalData: [],
        nameTask: '',
        SearchQuery: '',
        sortAscending: true,
        taskPosts: null,
        taskData: {
            dialog: false,
            task: {
                comments: []
            }
        },
        TasksLength: 0,
    }),
    created() {
        this.originalData = this.$store.state.user_current_tasks;
        this.TasksLength = this.originalData.length;
    },
    watch: {
        SearchQuery(newVal) {
            const search = newVal.toLowerCase();
            if (search === "") {
                this.$store.commit("SET_USER_CURRENT_TASKS", this.originalData)
            } else {
                this.$store.commit("SET_USER_CURRENT_TASKS", this.$store.state.user_current_tasks.filter(task => task.task.project_name.toLowerCase().includes(search)));
            }
        },
        watch: {
            $bus: {
                handler: 'handleNewSubtask',
                deep: true
            }
        },
    },
    methods: {
        handleNewSubtask(newSubtaskData) {
            console.log("🚀 ~ file: ContainerTasks.vue:189 ~ handleNewSubtask ~ newSubtaskData:", newSubtaskData)
        },
        openDialogPost(postData) {
            postData.dialog = true;
            this.selectedProjectData = postData;
        },
        openModal() {
            this.$refs.modalComponent.openModal();
        },
        openModalPosts() {
            this.$refs.dialogComponent.openModal();
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
            const filteredSubtasks = this.$store.state.user_current_posts.filter(post => post.post.task === taskId);
            this.$store.commit("SET_FILTER_POSTS", filteredSubtasks);
        },
        sortTasks() {
            this.$store.state.user_current_tasks.sort((a, b) => {
                const dateA = a.task.deadline;
                const dateB = b.task.deadline;
                return this.sortAscending ? dateA - dateB : dateB - dateA;
            });
        },
        toggleSort() {
            this.sortAscending = !this.sortAscending;
            this.sortTasks();
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
        async openDialogArchive(taskData) {
            taskData.dialog = true;
            this.isLoadingPost = true;
            let id = taskData.id
            try {
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/task_posts/${id}`);
                this.taskPosts = response.data;
                const completedPosts = this.taskPosts.filter(item => item.status === 'completed');
                const currentPosts = this.taskPosts.filter(item => item.status === 'current');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_POSTS_CURRENT", this.postRemainingTime());
                this.$store.commit("SET_POSTS_COMPLETED", completedPosts);
                this.isLoadingPost = false;
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
                this.isLoadingPost = false;
                console.error(error);
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

<style lang="scss" scoped>
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

.hover-effect:hover {
    color: #65b2f0;
}

.drawer {
    padding: 0.5rem;
}

.v-card {
    background-color: #fff;
    margin-top: 20px;
    padding: 16px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.v-card-title {
    word-wrap: break-word;
}

.task_current-item {
    display: inline-block;
    margin-right: 10px;
}

.task_current-enter-active,
.task_current-leave-active {
    transition: all 1s ease;
}

.task_current-enter-from,
.task_current-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.task_current-list-move {
    transition: transform 0.8s ease;
}

.task {
    border-bottom: solid 1px #ccc;
}

.project {
    padding-left: 15px;
}

.tasks-table {
    display: table;
    width: 100%;
    border-collapse: collapse;
}

.table-row {
    display: table-row;
    border-bottom: 1px solid #ccc;
}

.header {
    font-weight: bold;
}

.cell {
    display: table-cell;
    border: 1px solid #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 40px;
    /* Установите максимальную ширину ячейки по вашему усмотрению */
}

.cell.task-project-header {
    display: table-cell;
    border: 1px solid #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 40px;
    background-color: #e0e0e0;
}

.cell.deadline-header {
    display: table-cell;
    border: 1px solid #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 40px;
    background-color: #e0e0e0;
}

.cell.task-project {
    display: table-cell;
    border: 1px solid #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 65px;
    border-right: 1px solid #ccc;
    /* Добавляем вертикальную линию */
}

.cell.task-project:last-child {
    border-right: none;
    /* Убираем вертикальную линию для последней ячейки */
}

.cell.deadline {
    display: table-cell;
    border: 1px solid #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: #e0e0e0;
}

.center {
    position: absolute;
    left: 20%;
    top: 50%;
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
    left: -3vh;
    top: 90vh;
}
</style>