<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" width="600"
                    @click:outside="closeDialog" no-transition>
                    <v-card>
                        <div class="max-h-[90vh] overflow-y-[100vh]">
                            <div class="d-flex flex-column">
                                <v-toolbar :color="getToolbarColor(postData)">
                                    <div v-if="Role == 0" class="justify-start">
                                        <v-btn color="green-accent-3"
                                            @click="completePost(postData)"><v-icon>mdi-check</v-icon></v-btn>
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-card-text class="text-truncate text-h6">{{ postData.post.name }}</v-card-text>
                                    <v-spacer></v-spacer>
                                    <v-card-actions class="font-weight-medium">
                                        <div v-if="Role == 0">
                                            <SubVerticalThreeDots :postData="postData" @editDialog="showDialog"
                                                @deleteTask="deletePost(postData)" />
                                        </div>
                                    </v-card-actions>
                                </v-toolbar>
                                <div class="d-flex" style="padding:26px; font-family: 'Montserrat';">
                                    <div class="d-flex flex-column">
                                        <div class="section">
                                            <div class="section-header">
                                                <v-icon class="section-icon">mdi-calendar-clock</v-icon>
                                                <strong>Сроки</strong>
                                            </div>
                                            <div class="section-content w-50">
                                                <table>
                                                    <tr v-if="postData.post.deadline">
                                                        <td><strong>Дедлайн:</strong></td>
                                                        <td>{{ formatTimestamp(postData.post.deadline) }}</td>
                                                    </tr>
                                                    <tr v-if="postData.post.created_at">
                                                        <td><strong>Создано:</strong></td>
                                                        <td>{{ formatTimestamp(postData.post.created_at) }}</td>
                                                    </tr>
                                                    <tr v-if="postData.post.time_completed">
                                                        <td><strong>Завершон:</strong></td>
                                                        <td>{{ formatTimestamp(postData.post.time_completed) }}</td>
                                                    </tr>
                                                    <tr v-if="postData.post.archive_deadline">
                                                        <td><strong>История дедлайна:</strong></td>
                                                        <td v-for="deadline in postData.post.archive_deadline">{{
                                                            formatTimestamp(deadline) }}</td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="participants">
                                            <strong><v-icon color="black">mdi-account-multiple</v-icon>Участник:</strong>
                                            <div class="d-flex flex-wrap">
                                                <v-chip color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                                    {{ postData.post.member }}
                                                </v-chip>
                                            </div>
                                        </div>
                                    </div>

                                    <v-card-text class="flex-column w-50">
                                        <div class="pre-description">
                                            <strong><v-icon color="black">mdi-book</v-icon> Описание:</strong>
                                            <pre class="pre-description-text">{{ postData.post.description }}</pre>
                                        </div>
                                    </v-card-text>

                                </div>
                                <v-container>
                                    <v-select v-if="Role === 0" v-model="action" :items="actions" label="Выберите действие"
                                        :single-item="true" browserAutocomplete="off"></v-select>
                                </v-container>
                            </div>
                        </div>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios';
import SubVerticalThreeDots from '@/components/UI/helps/SubVerticalThreeDots.vue';

export default {
    components: {
        SubVerticalThreeDots,
    },
    props: {
        dialog: Boolean,
        postData: Object,
        Role: Boolean,
    },
    data() {
        return {
            action: this.postData.post.action,
            taskPosts: null,
            actions: ['to do', 'doing', 'question'],
        }
    },
    watch: {
        action: function (newValue) {
            const newAction = newValue;
            this.updatePost(newAction);
        }
    },
    methods: {
        showDialog() {
            this.closeDialog();
        },
        formatTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
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
        getToolbarColor(postData) {
            const toolbarColor = {};
            if (postData.urgency == 1) {
                toolbarColor['red-accent-1'] = true;
            } else if (postData.urgency == 2) {
                toolbarColor['orange-accent-1'] = true;
            } else if (postData.urgency == 3) {
                toolbarColor['yellow-accent-1'] = true;
            } else if (postData.urgency == 4) {
                toolbarColor['blue-grey-lighten-5'] = true;
            } else if (postData.urgency == undefined) {
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
        async completePost(postData) {
            let id = this.$store.state.currentTask;
            this.closeDialog();
            try {
                const response = await axios.patch(`https://gosu-tasks-api.vercel.app/user/complete_post/${postData.post.id}`, undefined, this.getToken());
                if (response.status == 200) {
                    this.$store.commit("SET_SHOW_ALERT_COMPLETED", true)
                }
                console.log('Проект успешно завершен', response.data);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token");
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));


                const response = await axios.patch(`https://gosu-tasks-api.vercel.app/user/complete_post/${postData.post.id}`, undefined, this.getToken());
                if (response.status == 200) {
                    this.$store.commit("SET_SHOW_ALERT_COMPLETED", true)
                }
                console.log('Проект успешно завершен', response.data);
                console.log(e);
            }finally{
                if (id != ''){
                    const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/task_posts/${id}`);
                    this.taskPosts = response.data;
                    const completedPosts = this.taskPosts.filter(item => item.status === 'completed');
                    const currentPosts = this.taskPosts.filter(item => item.status === 'current');
                    this.taskPosts = currentPosts;
                    this.$store.commit("SET_POSTS_CURRENT", this.postRemainingTime());
                    this.$store.commit("SET_POSTS_COMPLETED", completedPosts);
                }
    
                const response = await axios.get('https://gosu-tasks-api.vercel.app/user/get_tasks&posts/', this.getToken());
                const currentTasks = response.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_USER_CURRENT_TASKS", this.taskRemainingTime());
                const updateCurrentPosts = response.data.filter(item => item.type === 'post');
                this.taskPosts = updateCurrentPosts;
                this.$store.commit("SET_USER_CURRENT_POSTS", this.postRemainingTime());
                const taskId = this.$store.state.currentTaskId;
                const filteredSubtasks = this.$store.state.user_current_posts.filter(post => post.post.task === taskId);
                this.$store.commit("SET_FILTER_POSTS", filteredSubtasks);
            }
        },
        async deletePost(postData) {
            let id = this.$store.state.currentTask
            this.closeDialog();
            try {
                const response = await axios.delete(`https://gosu-tasks-api.vercel.app/userdelete_post/${postData.post.id}`, this.getToken());
                console.log('Подзадача успешна удалена:', response.data);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.delete(`https://gosu-tasks-api.vercel.app/userdelete_post/${postData.post.id}`, this.getToken());
                console.log('Подзадача успешна удалена:', response.data);
                console.log(e)
            } finally {
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/task_posts/${id}`);
                this.taskPosts = response.data;
                const completedPosts = this.taskPosts.filter(item => item.status === 'completed');
                const currentPosts = this.taskPosts.filter(item => item.status === 'current');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_POSTS_CURRENT", this.postRemainingTime());
                this.$store.commit("SET_POSTS_COMPLETED", completedPosts);
            }
        },
        async updatePost(newAction) {
            let id = this.$store.state.currentTask
            try {
                const response = await axios.patch(`https://gosu-tasks-api.vercel.app/user/action/${this.postData.post.id}`, { action: newAction }, this.getToken());
                console.log('updatePost')
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.patch(`https://gosu-tasks-api.vercel.app/user/action/${this.postData.post.id}`, { action: newAction }, this.getToken());
                console.log(e)
            } finally {
                const response = await axios.get('https://gosu-tasks-api.vercel.app/user/get_tasks&posts/', this.getToken());
                console.log(response.data);
                const currentTasks = response.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_USER_CURRENT_TASKS", this.taskRemainingTime());
                const currentPosts = response.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_USER_CURRENT_POSTS", this.postRemainingTime());
                const taskId = this.$store.state.currentTaskId;
                const filteredSubtasks = this.$store.state.user_current_posts.filter(post => post.post.task === taskId);
                this.$store.commit("SET_FILTER_POSTS", filteredSubtasks);
            }
        },
        closeDialog() {
            console.log('Close SubTaskCurrent')
            this.$emit('update:dialog', false);
        },
    },

}
</script>

<style lang="scss" scoped>
.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
}

.participants {
    margin-top: 20px;
    /* Отступ сверху для раздела "Участники" */
}

.pre-description {
    max-height: 500px;
    padding: 10px;
    font-family: 'Times New Roman', serif;
    /* Добавлен отступ сверху */
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
}

.light-green-accent-1 {
    color: light-green-accent-1;
}
</style>