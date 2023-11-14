<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" fullscreen
                    :scrim="false" transition="dialog-bottom-transition" @click:outside="closeModal" no-transition>
                    <v-card>
                        <div class="max-h-[90vh] overflow-y-[100vh]">
                            <div class="d-flex flex-column">
                                <v-toolbar dark :color="getToolbarColor(projectData)">
                                    <v-btn icon white @click="closeModal" class="font-weight-medium">
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <v-card-title class="text-truncate text-h5 font-weight-medium"
                                        style="color: black; font-family: 'Gilroy';">
                                        {{ projectData.project.name }}
                                    </v-card-title>
                                    <v-spacer></v-spacer>
                                    <div v-if="Role === 1" class="justify-end">
                                        <v-btn color="green-accent-3"
                                            @click="completeProject(projectData)"><v-icon>mdi-check</v-icon></v-btn>
                                    </div>
                                    <v-card-actions class="font-weight-medium">
                                        <div v-if="Role === 1">
                                            <VerticalThreeDots :projectData="projectData" @editDialog="showEditDialog"
                                                @deleteProject="deleteProject(projectData)" />
                                        </div>
                                    </v-card-actions>
                                </v-toolbar>
                                <div class="d-flex">
                                    <!-- Левая часть (Дедлайн, Создано, История дедлайна) -->
                                    <div class="d-flex flex-column" style="padding:26px; font-family: 'Montserrat';">
                                        <div class="section">
                                            <div class="section-header">
                                                <v-icon class="section-icon">mdi-calendar-clock</v-icon>
                                                <strong>Сроки</strong>
                                            </div>
                                            <div class="section-content w-25">
                                                <table>
                                                    <tr v-if="projectData.project.deadline">
                                                        <td><strong>Дедлайн:</strong></td>
                                                        <td>{{ formatTimestamp(projectData.project.deadline) }}</td>
                                                    </tr>
                                                    <tr v-if="projectData.project.created_at">
                                                        <td><strong>Создано:</strong></td>
                                                        <td>{{ formatTimestamp(projectData.project.created_at) }}</td>
                                                    </tr>
                                                    <tr v-if="projectData.project.archive_deadline">
                                                        <td><strong>История дедлайна:</strong></td>
                                                        <td v-for="deadline in projectData.project.archive_deadline">
                                                            {{ formatTimestamp(deadline) }}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>

                                        <div class="participants">
                                            <strong><v-icon color="black">mdi-account-multiple</v-icon> Участники:</strong>
                                            <div class="d-flex flex-wrap">
                                                <v-chip v-for="(member, index) in projectData.project.members" :key="index"
                                                    color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                                    {{ member }}
                                                </v-chip>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Правая часть (Описание) -->
                                    <v-card-text class="flex-column w-75">
                                        <div class="pre-description">
                                            <strong><v-icon color="black">mdi-book</v-icon> Описание:</strong>
                                            <pre class="pre-description-text">{{ projectData.project.description }}</pre>
                                        </div>
                                    </v-card-text>
                                </div>
                                <div
                                    v-if="!isLoading && (this.$store.state.currentTasks.length > 0 || this.$store.state.completedTasks.length > 0)">
                                    <div class="d-flex" style="padding:26px; font-family:'Montserrat';">
                                        <!-- Левая половина (Завершенные задания) -->
                                        <div class="w-50">
                                            <div class="section">
                                                <div class="section-header">
                                                    <v-icon class="section-icon">mdi-check-circle</v-icon>
                                                    <strong>Завершенные задачи</strong>
                                                </div>
                                                <v-row class="row-width">
                                                    <transition-group name="task_completed">
                                                        <v-col v-for="taskData in this.$store.state.completedTasks"
                                                            :key="taskData.id" cols="5">
                                                            <v-card @click="openDialogTaskComleted(taskData)"
                                                                :class="CardClass(taskData)" class="ma-2 pa-2" block
                                                                rounded-lg style="min-height: 175px; border-radius: 20px;">
                                                                <v-card-title class="fs-14">{{ taskData.name
                                                                }}</v-card-title>
                                                                <v-card-subtitle class="pb-2"> {{ taskData.description
                                                                }}</v-card-subtitle>
                                                                <br />
                                                                <v-divider></v-divider>
                                                                <br />
                                                                <v-progress-linear model-value="100" color="light-blue"
                                                                    height="10" striped
                                                                    style="border-radius: 20px;"></v-progress-linear>
                                                                <br />
                                                                <v-card-text>{{ formatTimestamp(taskData.time_completed) }}
                                                                    <v-icon style="left: 10px;"
                                                                        color="green">mdi-check-circle</v-icon>
                                                                </v-card-text>
                                                            </v-card>
                                                            <TaskDialogCompleted :taskData="taskData"
                                                                :dialog="taskData.dialog"
                                                                @update:dialog="taskData.dialog = $event" :Role="Role"
                                                                :isLoadingPost="isLoadingPost">
                                                            </TaskDialogCompleted>
                                                        </v-col>
                                                    </transition-group>
                                                </v-row>
                                            </div>
                                        </div>
                                        <!-- Правая половина (Список текущих задач) -->
                                        <div class="w-50">
                                            <div class="section">
                                                <div class="section-header">
                                                    <v-icon class="section-icon">mdi-format-list-checks</v-icon>
                                                    <strong>Список текущих задач</strong>
                                                </div>
                                                <v-row class="row-width">
                                                    <transition-group name="task_current">
                                                        <v-col v-for="taskData in this.$store.state.currentTasks"
                                                            :key="taskData.task.id" cols="5">
                                                            <v-card @click="openDialogTask(taskData)"
                                                                :class="CardClass(taskData)" class="ma-2 pa-2" block
                                                                rounded-lg style="min-height: 175px; border-radius: 20px;">
                                                                <v-card-title class="fs-14">{{ taskData.task.name
                                                                }}</v-card-title>
                                                                <v-card-subtitle class="pb-2">{{ taskData.task.description
                                                                }}</v-card-subtitle>
                                                                <br />
                                                                <v-divider></v-divider>
                                                                <br />
                                                                <v-progress-linear
                                                                    :model-value="calculateProgress(taskData)"
                                                                    color="light-blue" height="10" striped
                                                                    style="border-radius: 20px;"></v-progress-linear>
                                                                <br />
                                                                <v-card-text>{{ formatTimestamp(taskData.task.deadline) }}
                                                                    <v-icon style="left: 10px;" color="red"
                                                                        v-if="taskData.timeUntilDeadline < 0">mdi-alert-circle</v-icon>
                                                                    <v-icon style="left: 10px;"
                                                                        v-else-if="taskData.timeUntilDeadline > 0">mdi-clock-fast</v-icon>
                                                                </v-card-text>
                                                            </v-card>
                                                            <TaskDialog :taskData="taskData" :dialog="taskData.dialog"
                                                                @update:dialog="taskData.dialog = $event" :Role="Role"
                                                                :isLoadingPost="isLoadingPost">
                                                            </TaskDialog>
                                                        </v-col>
                                                    </transition-group>
                                                    <TaskEdit></TaskEdit>
                                                </v-row>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div v-if="!isLoading"
                                        style="display: flex; justify-content: center; align-items: center; padding:26px">
                                        <strong class="text-h5">Задачи не назначены</strong>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: center; align-items: center; padding:26px">
                                    <v-progress-circular v-if="isLoading" indeterminate
                                        color="#65b2f0"></v-progress-circular>
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
import VerticalThreeDots from '@/components/UI/helps/VerticalThreeDots.vue';
import TaskDialog from '@/components/UI/helps/TaskDialog.vue';
import TaskEdit from '@/components/UI/helps/TaskEdit.vue';
import TaskDialogCompleted from '@/components/UI/helps/TaskDialogCompleted.vue';
import axios from 'axios';

export default {
    components: {
        VerticalThreeDots,
        TaskDialog,
        TaskEdit,
        TaskDialogCompleted,
    },
    props: {
        Role: Number,
        dialog: Boolean,
        projectData: Object,
        projectShow: Function,
        isLoading: Boolean,
    },
    data() {
        return {
            isLoadingPost: false,
            dataFromServer: null,
            taskPosts: [],
        }
    },
    methods: {
        showEditDialog() {
            this.closeModal();
        },
        formatTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
        },
        closeModal() {
            console.log('CLOSE PROJECT')
            this.dataLoaded = false;
            this.$emit('update:dialog', false);
        },
        calculateProgress(taskData) {
            if (taskData.task.post_count === 0) {
                return 0; // Если нет задач, прогресс 0%
            }
            const progress = (taskData.task.post_completed_count / taskData.task.post_count) * 100;
            return progress;
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
        getToolbarColor(projectData) {
            const toolbarColor = {};
            if (projectData.urgency == 1) {
                toolbarColor['red-accent-1'] = true;
            } else if (projectData.urgency == 2) {
                toolbarColor['orange-accent-1'] = true;
            } else if (projectData.urgency == 3) {
                toolbarColor['yellow-accent-1'] = true;
            } else if (projectData.urgency == 4) {
                toolbarColor['blue-grey-lighten-5'] = true;
            } else if (projectData.urgency == undefined) {
                toolbarColor['light-green-accent-1'] = true;
            }
            return Object.keys(toolbarColor).join(" ");
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
        async deleteProject(projectData) {
            try {
                this.closeModal();
                const response = await axios.delete(`https://gosu-tasks-api.vercel.app/admin/delete_project/${projectData.project.id}`, this.getToken());
                console.log('Проект успешно удален:', response.data);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.delete(`https://gosu-tasks-api.vercel.app/admin/delete_project/${projectData.project.id}`, this.getToken());
                console.log('Проект успешно удален:', response.data);
                console.log(e);
            } finally {
                const response = await axios.get('https://gosu-tasks-api.vercel.app/company/projects/', this.getToken());
                this.dataFromServer = response.data;
                this.$store.commit("SET_PROJECTS", this.projectRemainingTime());
                const projectsName = response.data.map(obj => obj?.name);
                this.$store.commit("SET_PROJECT_NAME_LIST", projectsName);
                function getDates(remainingTime) {
                    const dates = [{}, ...remainingTime].reduce((acc, project) => {
                        acc[project.project.id] = {
                            days: project?.remainingDays,
                            hours: project?.remainingHours,
                            minutes: project?.remainingMinutes
                        };
                        return acc;
                    })
                    return dates;
                }

                const dates = getDates(this.projectRemainingTime());
                this.$store.commit("SET_DATES", dates);
            }
        },
        async completeProject(projectData) {
            this.closeModal();
            try {
                const response = await axios.patch(`https://gosu-tasks-api.vercel.app/admin/complete_project/${projectData.project.id}`, undefined, this.getToken());
                if (response.status == 200) {
                    this.$store.commit("SET_SHOW_ALERT_SUCCESS", true)
                }
                console.log('Проект успешно завершен', response.data);
            } catch (e) {
                if (e.response && e.response.status === 404) {
                    this.$store.commit('SET_SHOW_ALERT', true);
                } else if (e.response && e.response.status === 403) {
                    const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                    localStorage.removeItem("token");
                    localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                    try {
                        const response = await axios.patch(`https://gosu-tasks-api.vercel.app/admin/complete_project/${projectData.project.id}`, undefined, this.getToken());
                        if (response.status == 200) {
                            this.$store.commit("SET_SHOW_ALERT_SUCCESS", true)
                        }
                        console.log('Проект успешно завершен', response.data);
                    } catch (e) {
                        if (e.response && e.response.status === 404) {
                            this.$store.commit('SET_SHOW_ALERT', true);
                        }
                    }
                } else {
                    console.log(e);
                }
            }

            const response = await axios.get('https://gosu-tasks-api.vercel.app/company/projects/', this.getToken());
            this.dataFromServer = response.data;
            this.$store.commit("SET_PROJECTS", this.projectRemainingTime());
            const projectsName = response.data.map(obj => obj?.name);
            this.$store.commit("SET_PROJECT_NAME_LIST", projectsName);
            function getDates(remainingTime) {
                const dates = [{}, ...remainingTime()].reduce((acc, project) => {
                    acc[project.project.id] = {
                        days: project?.remainingDays,
                        hours: project?.remainingHours,
                        minutes: project?.remainingMinutes
                    };
                    return acc;
                })
                return dates;
            }

            const dates = getDates(this.projectRemainingTime);
            this.$store.commit("SET_DATES", dates);
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
        async openDialogTaskComleted(taskData) {
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

.task_completed-item {
    display: inline-block;
    margin-right: 10px;
}

.task_completed-enter-active,
.task_completed-leave-active {
    transition: all 1s ease;
}

.task_completed-enter-from,
.task_completed-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.task_completed-list-move {
    transition: transform 0.8s ease;
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

.participants {
    margin-top: 20px;
    /* Отступ сверху для раздела "Участники" */
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
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

.d-flex {
    display: flex;
    flex-direction: row;
}

.mr-2 {
    margin-right: 2rem;
}

.mt-2 {
    margin-top: 2rem;
}

.fs-14 {
    font-size: 14px;
}

.row-width {
    width: 120%;
}
</style>