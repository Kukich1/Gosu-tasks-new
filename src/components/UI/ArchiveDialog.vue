<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" fullscreen
                    :scrim="false" transition="dialog-bottom-transition" @click:outside="closeModal" no-transition>
                    <v-card>
                        <div class="max-h-[90vh] overflow-y-[100vh]">
                            <div class="d-flex flex-column">
                                <v-toolbar dark :color="getToolbarColor(item)">
                                    <v-btn icon white @click="closeModal" class="font-weight-medium">
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <v-card-title class="text-truncate text-h4 font-weight-medium"
                                        style="color: black; font-family: 'Gilroy';">{{ item.name }}</v-card-title>
                                    <v-spacer></v-spacer>
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
                                                    <tr v-if="item.deadline">
                                                        <td><strong>Дедлайн:</strong></td>
                                                        <td>{{ formatTimestamp(item.deadline) }}</td>
                                                    </tr>
                                                    <tr v-if="item.created_at">
                                                        <td><strong>Создано:</strong></td>
                                                        <td>{{ formatTimestamp(item.created_at) }}</td>
                                                    </tr>
                                                    <tr v-if="item.time_completed">
                                                        <td><strong>Завершон:</strong></td>
                                                        <td>{{ formatTimestamp(item.time_completed) }}</td>
                                                    </tr>
                                                    <tr v-if="item.archive_deadline">
                                                        <td><strong>История дедлайна:</strong></td>
                                                        <td v-for="deadline in item.archive_deadline">
                                                            {{ formatTimestamp(deadline) }}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>

                                        <div class="participants">
                                            <strong><v-icon color="black">mdi-account-multiple</v-icon>Участники:</strong>
                                            <div class="d-flex flex-wrap">
                                                <v-chip v-for="(member, index) in item.members" :key="index"
                                                    color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                                    {{ member }}
                                                </v-chip>
                                            </div>
                                        </div>
                                    </div>

                                    <v-card-text class="flex-column w-50">
                                        <div class="pre-description">
                                            <strong><v-icon color="black">mdi-book</v-icon> Описание:</strong>
                                            <pre class="pre-description-text">{{ item.description }}</pre>
                                        </div>
                                    </v-card-text>
                                </div>

                                <div v-if="!isLoading && this.$store.state.completedTasks.length > 0">
                                    <div class="d-flex" style="padding:26px; font-family:'Montserrat';">
                                        <v-row class="row-width">
                                            <v-col v-for="taskData in this.$store.state.completedTasks" :key="taskData.id"
                                                cols="3">
                                                <v-card @click="openDialogTask(taskData)" :class="CardClass(taskData)"
                                                    class="ma-2 pa-2" block rounded-lg
                                                    style="min-height: 175px; border-radius: 20px;">
                                                    <v-card-title class="fs-14">{{ taskData.name
                                                    }}</v-card-title>
                                                    <v-card-subtitle class="pb-2">{{ taskData.description
                                                    }}</v-card-subtitle>
                                                    <br />
                                                    <v-divider></v-divider>
                                                    <br />
                                                    <v-progress-linear model-value="100" color="light-blue" height="10"
                                                        striped style="border-radius: 20px;"></v-progress-linear>
                                                    <br />
                                                    <v-card-text>{{ formatTimestamp(taskData.time_completed) }}
                                                        <v-icon style="left: 10px;" color="green">mdi-check-circle</v-icon>
                                                    </v-card-text>
                                                </v-card>
                                                <TaskDialogCompleted :taskData="taskData" :isLoadingPost="isLoadingPost"
                                                    :dialog="taskData.dialog" @update:dialog="taskData.dialog = $event"
                                                    :Role="Role">
                                                </TaskDialogCompleted>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </div>
                                <div v-else>
                                    <div v-if="!isLoading"
                                        style="display: flex; justify-content: center; align-items: center; padding:26px">
                                        <strong class="text-h5">Подзадачи не назначены</strong>
                                    </div>
                                    <div style="display: flex; justify-content: center; align-items: center; padding:26px">
                                        <v-progress-circular v-if="isLoading" indeterminate
                                            color="#65b2f0"></v-progress-circular>
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
import axios from 'axios';
import TaskDialogCompleted from '@/components/UI/helps/TaskDialogCompleted.vue';

export default {
    components: {
        TaskDialogCompleted,
    },
    props: {
        dialog: Boolean,
        isLoading: Boolean,
        item: Object,
    },
    data() {
        return {
            show: true,
            isLoadingPost: false,
            dataLoaded: false,
            taskPosts: null
        }
    },
    methods: {
        formatTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
        },
        closeModal() {
            this.dataLoaded = false;
            this.$emit('update:dialog', false);
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
        getToolbarColor(item) {
            const toolbarColor = {};
            if (item.urgency == 1) {
                toolbarColor['red-accent-1'] = true;
            } else if (item.urgency == 2) {
                toolbarColor['orange-accent-1'] = true;
            } else if (item.urgency == 3) {
                toolbarColor['yellow-accent-1'] = true;
            } else if (item.urgency == 4) {
                toolbarColor['blue-grey-lighten-5'] = true;
            } else if (item.urgency == undefined) {
                toolbarColor['light-green-accent-1'] = true;
            }
            return Object.keys(toolbarColor).join(" ");
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
        async openDialogTask(taskData) {
            taskData.dialog = true;
            this.selectedProjectData = taskData;
            this.isLoadingPost = true;
            let id = taskData.id
            if (id == undefined) {
                id = taskData.task.id
            }
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
.d-flex {
    display: flex;
    flex-direction: row;
}

.row-width {
    width: 120%;
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
    font-family: 'Times New Roman', serif;
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

.light-green-accent-1 {
    color: light-green-accent-1;
}

.green-card {
    border: 2px solid limegreen;
}
</style>