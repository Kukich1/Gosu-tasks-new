<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" width="1200"
                    @click:outside="closeDialog" no-transition>
                    <v-card>
                        <div class="max-h-[90vh] overflow-y-[100vh]">
                            <div class="d-flex flex-column">
                                <v-toolbar scroll-behavior="elevate" dark :color="getToolbarColor(taskData)">
                                    <v-btn icon white @click="closeDialog" class="font-weight-medium">
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <v-card-title class="text-truncate text-h5 font-weight-medium"
                                        style="color: black; font-family: 'Gilroy'; justify-content:center">{{
                                            taskData.task.name }}
                                    </v-card-title>
                                    <v-spacer></v-spacer>
                                    <div v-if="Role === 1" class="justify-end">
                                        <v-btn color="green-accent-3"
                                            @click="completeTask(taskData)"><v-icon>mdi-check</v-icon></v-btn>
                                    </div>
                                    <v-card-actions class="font-weight-medium">
                                        <div v-if="Role === 1">
                                            <TaskVerticalThreeDots :taskData="taskData" @editDialog="showDialog"
                                                @deleteTask="deleteTask(taskData)" />
                                        </div>
                                    </v-card-actions>

                                    <div v-if="Role === 0">
                                        <v-container>
                                            <v-btn ref="showIdButton" @click="ShowId(taskData)"
                                                variant="outlined">ID</v-btn>
                                        </v-container>
                                    </div>
                                </v-toolbar>
                                <div class="d-flex">
                                    <div class="d-flex flex-column" style="padding:26px; font-family: 'Montserrat';">
                                        <div class="section">
                                            <div class="section-header">
                                                <v-icon class="section-icon">mdi-calendar-clock</v-icon>
                                                <strong>Сроки</strong>
                                            </div>
                                            <div class="section-content w-50">
                                                <table>
                                                    <tr v-if="taskData.task.deadline">
                                                        <td><strong>Дедлайн:</strong></td>
                                                        <td>{{ formatTimestamp(taskData.task.deadline) }}</td>
                                                    </tr>
                                                    <tr v-if="taskData.task.created_at">
                                                        <td><strong>Создано:</strong></td>
                                                        <td>{{ formatTimestamp(taskData.task.created_at) }}</td>
                                                    </tr>
                                                    <tr v-if="taskData.task.time_completed">
                                                        <td><strong>Завершон:</strong></td>
                                                        <td>{{ formatTimestamp(taskData.task.time_completed) }}</td>
                                                    </tr>
                                                    <tr v-if="taskData.task.archive_deadline">
                                                        <td><strong>История дедлайна:</strong></td>
                                                        <td v-for="deadline in taskData.task.archive_deadline">{{
                                                            formatTimestamp(deadline) }}</td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>

                                        <div class="participants">
                                            <strong><v-icon color="black">mdi-account-multiple</v-icon>Задача
                                                для:</strong>
                                            <div class="d-flex flex-wrap">
                                                <v-chip v-for="(member, index) in taskData.task.members" :key="index"
                                                    color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                                    {{ member }}
                                                </v-chip>
                                            </div>
                                        </div>
                                    </div>

                                    <v-card-text class="flex-column w-50">
                                        <div class="pre-description">
                                            <strong><v-icon color="black">mdi-book</v-icon> Описание:</strong>
                                            <pre class="pre-description-text">{{ taskData.task.description }}</pre>
                                        </div>
                                    </v-card-text>

                                </div>

                                <div style="padding:26px; font-family: 'Montserrat';">
                                    <div>
                                        <strong><v-icon>mdi-comment</v-icon> Комментарии</strong>
                                        <div ref="commentContainer" class="comment-list">
                                            <div class="comment-colmn" ref="commentContainer">
                                                <transition-group name="comments">
                                                    <div v-for="(comment, index) in sortedComments" :key="index">
                                                        <div
                                                            :class="[isMyComment(comment) ? 'comment-right' : 'comment-left']">
                                                            <div class="message-card"
                                                                :class="[isMyComment(comment) ? 'my-comment-card' : 'other-comment-card']">
                                                                <pre
                                                                    class="message-text"><strong>{{ comment.comment }}</strong></pre>
                                                                <div class="message-info">
                                                                    <div class="message-user">{{ comment.username }}</div>
                                                                    <div class="message-separator">-</div>
                                                                    <div class="message-date">{{
                                                                        formatTimestamp(comment.date)
                                                                    }}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </transition-group>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="comment-input">
                                        <div class="textarea-container">
                                            <textarea v-model="newComment" @keydown.enter="handleEnterKey(taskData, $event)"
                                                placeholder="Добавить комментарий"></textarea>
                                            <button @click="addComment(taskData)" class="send-button">
                                                <i class="mdi mdi-send"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="isLoadingPost"
                                    style="display: flex; justify-content: center; align-items: center; padding:26px">
                                    <v-progress-circular indeterminate color="#65b2f0"></v-progress-circular>
                                </div>
                                <div
                                    v-if="!isLoadingPost && (this.$store.state.currentposts.length > 0 || this.$store.state.postsCompleted.length > 0)">
                                    <div class="d-flex" style="padding:26px; font-family:'Montserrat';">
                                        <div class="w-50">
                                            <div class="section">
                                                <div class="section-header">
                                                    <v-icon class="section-icon">mdi-check-circle</v-icon>
                                                    <strong>Завершенные подзадачи</strong>
                                                </div>
                                                <v-row class="row-width">
                                                    <transition-group name="post_completed">
                                                        <v-col v-for="postData in this.$store.state.postsCompleted"
                                                            :key="postData.id" cols="5">
                                                            <v-card @click="openDialogPost(postData)" class="pa-2"
                                                                :class="CardClass(postData)" block rounded-lg
                                                                style="min-height: 175px; border-radius: 20px;">
                                                                <v-card-title class="fs-14">{{ postData.name
                                                                }}</v-card-title>
                                                                <v-card-subtitle class="pb-2"> {{ postData.description
                                                                }}</v-card-subtitle>
                                                                <br />
                                                                <v-divider></v-divider>
                                                                <br />
                                                                <v-card-text>{{ formatTimestamp(postData.time_completed) }}
                                                                    <v-icon style="left: 10px;"
                                                                        color="green">mdi-check-circle</v-icon>
                                                                </v-card-text>
                                                            </v-card>
                                                            <SubTaskCompleted :postData="postData" :dialog="postData.dialog"
                                                                @update:dialog="postData.dialog = $event" :Role="Role">
                                                            </SubTaskCompleted>
                                                        </v-col>
                                                    </transition-group>
                                                </v-row>
                                            </div>
                                        </div>
                                        <div class="w-50">
                                            <div class="section">
                                                <div class="section-header">
                                                    <v-icon class="section-icon">mdi-format-list-checks</v-icon>
                                                    <strong>Список текущих подзадач</strong>
                                                </div>
                                                <v-row class="row-width">
                                                    <transition-group name="post_current">
                                                        <v-col v-for="postData in this.$store.state.currentposts"
                                                            :key="postData.post.id" cols="5">
                                                            <v-card @click="openDialogPost(postData)"
                                                                :class="CardClass(postData)" class="ma-2 pa-2" block
                                                                rounded-lg style="min-height: 175px; border-radius: 20px;">
                                                                <v-card-title class="fs-14">{{ postData.post.name
                                                                }}</v-card-title>
                                                                <v-card-subtitle class="pb-2">{{ postData.post.description
                                                                }}</v-card-subtitle>
                                                                <br />
                                                                <v-divider></v-divider>
                                                                <br />
                                                                <v-card-text>{{ formatTimestamp(postData.post.deadline) }}
                                                                    <v-icon style="left: 10px;" color="red"
                                                                        v-if="postData.timeUntilDeadline < 0">mdi-alert-circle</v-icon>
                                                                    <v-icon style="left: 10px;"
                                                                        v-else-if="postData.timeUntilDeadline > 0">mdi-clock-fast</v-icon>
                                                                </v-card-text>
                                                            </v-card>
                                                            <SubTaskCurrent :postData="postData" :dialog="postData.dialog"
                                                                @update:dialog="postData.dialog = $event" :Role="Role">
                                                            </SubTaskCurrent>
                                                        </v-col>
                                                    </transition-group>
                                                    <SubTaskEdit></SubTaskEdit>
                                                </v-row>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div v-if="!isLoadingPost"
                                        style="display: flex; justify-content: center; align-items: center; padding:26px">
                                        <strong class="text-h5">Задачи не назначены</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import TaskVerticalThreeDots from '@/components/UI/helps/TaskVerticalThreeDots.vue';
import SubTaskCompleted from '@/components/UI/helps/SubTaskCompleted.vue';
import SubTaskCurrent from '@/components/UI/helps/SubTaskCurrent.vue';
import SubTaskEdit from './SubTaskEdit.vue';
import axios from 'axios';
export default {
    components: {
        TaskVerticalThreeDots,
        SubTaskCompleted,
        SubTaskCurrent,
        SubTaskEdit,
    },
    props: {
        Role: Number,
        dialog: Boolean,
        taskData: Object,
        isLoadingPost: Boolean,
    },
    data() {
        return {
            newComment: "",
            current_user: null,
            projectTasks: [],
            taskPosts: [],
            show: true,
            commentsTask: this.taskData.task.comments,
            dataFromServer: [],
        }
    },
    watch: {
        dialog(newVal) {
            if (newVal === true) {
                this.$nextTick(() => {
                    const commentContainer = this.$refs.commentContainer;
                    if (commentContainer) {
                        commentContainer.scrollTop = commentContainer.scrollHeight;
                    }
                });
            }
        }
    },
    computed: {
        sortedComments() {
            const allComments = this.commentsTask;
            return allComments.sort((a, b) => a.date - b.date);
        },
    },
    methods: {
        showDialog() {
            this.closeDialog();
        },
        closeDialog() {
            console.log("close post");
            this.$emit('update:dialog', false);
        },
        formatTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
        },
        openDialogPost(postData) {
            postData.dialog = true;
            this.selectedProjectData = postData;
        },
        handleEnterKey(taskData, event) {
            if (!event.shiftKey) {
                event.preventDefault();
                this.addComment(taskData);
            }
        },
        isMyComment(comment) {
            this.current_user = localStorage.getItem("username");
            const cleanCurrentUser = this.current_user.replaceAll("\"", "");
            return comment.username == cleanCurrentUser;
        },
        insertTab(event) {
            if (event.keyCode === 9) {
                event.preventDefault();
                const textarea = event.target;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                // Вставляем символ табуляции в текущую позицию
                this.project.description = this.project.description.substring(0, start) + "\t" + this.project.description.substring(end);

                // Перемещаем курсор после вставленного табуляции
                textarea.selectionStart = textarea.selectionEnd = start + 1;
            }
        },
        ShowId(taskData) {
            const taskId = taskData.task.id;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(taskId)
                    .then(() => {
                        console.log('ID скопирован в буфер обмена: ' + taskId);
                    })
                    .catch(err => {
                        console.error('Не удалось скопировать ID: ' + err);
                    });
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = taskId;

                document.body.appendChild(textArea);

                textArea.select();

                try {
                    document.execCommand("copy");
                    console.log('ID скопирован в буфер обмена: ' + taskId);
                } catch (err) {
                    console.error("Не удалось скопировать текст: ", err);
                }

                document.body.removeChild(textArea);
            }
        },
        projectRemainingTime() {
            if (!this.dataFromServer || this.dataFromServer.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.dataFromServer.map(project => {
                const timeUntilDeadline = project.deadline - currentTime;
                const totalTime = project.deadline - project.created_at;
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
                    project,
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
        CardClass(taskData) {
            const cardClass = {
                'ma-2': true,
                'mt-5': true,
            };
            if (taskData.urgency == 1) {
                cardClass['red-card'] = true;
            } else if (taskData.urgency == 2) {
                cardClass['orange-card'] = true;
            } else if (taskData.urgency == 3) {
                cardClass['yellow-card'] = true;
            } else if (taskData.urgency == undefined) {
                cardClass['green-card'] = true;
            }
            return Object.keys(cardClass).join(" ");
        },
        getToolbarColor(taskData) {
            const toolbarColor = {};
            if (taskData.urgency == 1) {
                toolbarColor['red-accent-1'] = true;
            } else if (taskData.urgency == 2) {
                toolbarColor['orange-accent-1'] = true;
            } else if (taskData.urgency == 3) {
                toolbarColor['yellow-accent-1'] = true;
            } else if (taskData.urgency == 4) {
                toolbarColor['blue-grey-lighten-5'] = true;
            } else if (taskData.urgency == undefined) {
                toolbarColor['light-green-accent-1'] = true;
            }
            return Object.keys(toolbarColor).join(" ");
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
        async deleteTask(taskData) {
            let id = this.$store.state.project_current_id
            this.closeDialog();
            try {
                const response = await axios.delete(`https://gosu-tasks-api.vercel.app/admin/delete_task/${taskData.task.id}`, this.getToken());
                console.log('Задача успешна удалена:', response.data);

                const response2 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const currentTasks = response2.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_TASKS_LENGTH", this.taskRemainingTime());
                const currentPosts = response2.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_CHOSE_USER_CURRENT_POSTS", this.postRemainingTime());

                const response1 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const completedTask = response1.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response1.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.delete(`https://gosu-tasks-api.vercel.app/admin/delete_task/${taskData.task.id}`, this.getToken());
                console.log('Задача успешна удалена:', response.data);

                const response2 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const currentTasks = response2.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_TASKS_LENGTH", this.taskRemainingTime());
                const currentPosts = response2.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_CHOSE_USER_CURRENT_POSTS", this.postRemainingTime());

                const response3 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const completedTask = response3.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response3.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
                console.log(e)
            } finally {
                if (id != undefined) {
                    const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${id}`);
                    this.projectTasks = response.data;
                    const completedTasks = this.projectTasks.filter(item => item.status === 'completed');
                    const currentTasks = this.projectTasks.filter(item => item.status === 'current');
                    this.projectTasks = currentTasks;
                    this.$store.commit("SET_CURRENT_TASKS", this.taskRemainingTime());
                    this.$store.commit("SET_COMPLETED_TASKS", completedTasks);
                }
            }
        },
        async addComment(taskData) {
            if (this.newComment.trim() !== "") {
                const newComment = {
                    date: Math.floor(Date.now() / 1000),
                    username: "Ваш пользователь",
                    comment: this.newComment,
                };
                try {
                    const response = await axios.patch(`https://gosu-tasks-api.vercel.app/company/add_comment_totask/${taskData.task.id}`, newComment, this.getToken());
                    this.commentsTask = response.data.comments;
                    console.log('Comment был добавлен')
                } catch (e) {
                    const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                    localStorage.removeItem("token")
                    localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                    const response = await axios.patch(`https://gosu-tasks-api.vercel.app/company/add_comment_totask/${taskData.task.id}`, this.comments, this.getToken());
                    this.commentsTask = response.data.comments;
                    console.log('Comment был добавлен')
                    console.log(e)
                }
                this.$nextTick(() => {
                    const commentContainer = this.$refs.commentContainer;
                    if (commentContainer) {
                        commentContainer.scrollTop = commentContainer.scrollHeight;
                    }
                });
                this.newComment = "";
            }

        },
        async completeTask(taskData) {
            let id = this.$store.state.project_current_id
            this.closeDialog();
            try {
                const response = await axios.patch(`https://gosu-tasks-api.vercel.app/admin/complete_task/${taskData.task.id}`, undefined, this.getToken());
                if (response.status == 200) {
                    this.$store.commit("SET_SHOW_ALERT_TASK_COMPLETED", true)
                }
                const response2 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const currentTasks = response2.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_TASKS_LENGTH", this.taskRemainingTime());
                const currentPosts = response2.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_CHOSE_USER_CURRENT_POSTS", this.postRemainingTime());

                const response1 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const completedTask = response1.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response1.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
                console.log('Проект успешно завершен', response.data);
            } catch (e) {
                if (e.response && e.response.status === 404) {
                    this.$store.commit('SET_SHOW_ALERT_TASK_WORM', true);
                } else if (e.response && e.response.status === 403) {
                    const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                    localStorage.removeItem("token");
                    localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                    try {
                        const response = await axios.patch(`https://gosu-tasks-api.vercel.app/admin/complete_task/${taskData.task.id}`, undefined, this.getToken());
                        if (response.status == 200) {
                            this.$store.commit("SET_SHOW_ALERT_TASK_COMPLETED", true)
                        }
                        const response2 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                        const currentTasks = response2.data.filter(item => item.type === 'task');
                        this.projectTasks = currentTasks;
                        this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.taskRemainingTime());
                        this.$store.commit("SET_TASKS_LENGTH", this.taskRemainingTime());
                        const currentPosts = response2.data.filter(item => item.type === 'post');
                        this.taskPosts = currentPosts;
                        this.$store.commit("SET_CHOSE_USER_CURRENT_POSTS", this.postRemainingTime());

                        const response3 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                        const completedTask = response3.data.filter(item => item.type === 'task');
                        this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                        const completedPost = response3.data.filter(item => item.type === 'post');
                        this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
                        console.log('Проект успешно завершен', response.data);
                    } catch (e) {
                        if (e.response && e.response.status === 404) {
                            this.$store.commit('SET_SHOW_ALERT_WORM', true);
                        }
                    }
                } else {
                    console.log(e);
                }
            } finally {
                if (id != undefined) {
                    const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${id}`);
                    this.projectTasks = response.data;
                    const completedTasks = this.projectTasks.filter(item => item.status === 'completed');
                    const currentTasks = this.projectTasks.filter(item => item.status === 'current');
                    this.projectTasks = currentTasks;
                    this.$store.commit("SET_CURRENT_TASKS", this.taskRemainingTime());
                    this.$store.commit("SET_COMPLETED_TASKS", completedTasks);
                }
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            const commentContainer = this.$refs.commentContainer;
            if (commentContainer) {
                commentContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        });
    }
}
</script>

<style lang="scss" scoped>
.post_completed-item {
    display: inline-block;
    margin-right: 10px;
}

.post_completed-enter-active,
.post_completed-leave-active {
    transition: all 1s ease;
}

.post_completed-enter-from,
.post_completed-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.post_completed-list-move {
    transition: transform 0.8s ease;
}

.post_current-item {
    display: inline-block;
    margin-right: 10px;
}

.post_current-enter-active,
.post_current-leave-active {
    transition: all 1s ease;
}

.post_current-enter-from,
.post_current-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.post_current-list-move {
    transition: transform 0.8s ease;
}

.comments-item {
    display: inline-block;
    margin-right: 10px;
}

.comments-enter-active,
.comments-leave-active {
    transition: all 1s ease;
}

.comments-enter-from,
.comments-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.comments-list-move {
    transition: transform 0.8s ease;
}

.message-separator {
    margin: 0 10px;
    color: #000;
}

.message-card {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 5px;
    border-radius: 5px;
    max-width: 80%;
    word-wrap: break-word;
}

.message-text {
    white-space: pre-wrap;
    overflow-x: auto;
    max-width: 100%;
    padding: 10px;
    font-family: 'Gilroy';
}

.message-card.other-comment-card .message-text {
    font-weight: 600;
}

.message-info {
    padding: 10px;
    display: flex;
    color: #79787D;
    font-size: 13px;
}

.message-content {
    display: flex;
    flex-direction: column;
}

.comment-list {
    display: flex;
    flex-direction: column;
    max-height: 650px;
    width: 90%;
    border: solid 1px black;
    overflow-y: auto;
    margin-top: 2rem;
    scrollbar-width: thin;
    scrollbar-color: #888 #f5f5f5;
}

.comment-colmn {
    flex: 1;
}

.comment-right {
    display: flex;
    justify-content: flex-end;
}

.comment-left {
    display: flex;
    justify-content: flex-start;
}

.message-user {
    font-weight: bold;
}

.my-comment-card {
    justify-content: right;
    background-color: #e6ffe6;
    border-radius: 10px;
}

.other-comment-card {
    justify-content: left;
    background-color: #ECEFF1;
    border-radius: 10px;
}


.comment-list::-webkit-scrollbar {
    width: 10px;
}

.comment-list::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
}

.comment-list::-webkit-scrollbar-track {
    background-color: #f5f5f5;
}

.comment-input {
    width: 90%;
    margin-top: 10px;
}

.textarea-container {
    position: relative;
}

.send-button {
    position: absolute;
    right: 10px;
    bottom: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    padding: 5px;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.send-button:hover {
    background-color: #0056b3;
}

textarea {
    width: 100%;
    margin-top: 10px;
    padding: 5px;
}

.mr-2 {
    margin-right: 2rem;
}

.mt-2 {
    margin-top: 2rem;
}

.pre-description {
    max-height: 500px;
    padding: 10px;
    font-family: 'Times New Roman', serif;
}

.pre-description-text {
    white-space: pre-wrap;
    overflow-x: auto;
    max-width: 100%;
    max-height: 500px;
    border: 1px solid white;
    padding: 10px;
    font-family: 'Times New Roman', serif;
}

.participants {
    margin-top: 20px;
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
    font-family: 'Times New Roman', serif;
}

.red-card {
    border: 2px solid red;
}

.orange-card {
    border: 2px solid orange;
}

.yellow-card {
    border: 2px solid yellow;
}

.green-card {
    border: 2px solid limegreen;
}

.red-accent-1 {
    color: red-accent-1;
}

.orange-accent-1 {
    color: orange-accent-1;
}

.yellow-accent-1 {
    color: yellow-accent-1;
}

.blue-grey-lighten-5 {
    color: blue-grey-lighten-5;
}</style>