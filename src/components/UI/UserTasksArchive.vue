<template>
    <div class="modal-container" :class="{ 'modal-open': isOpen }">
        <div class="modal">
            <v-container @click.stop>
                <div class="padding_top">
                    <div style="display:flex; justify-content: space-between;">
                        <v-btn icon white @click="closeModal" class="font-weight-medium">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <div>Задачи</div>
                    </div>
                    <Datepicker :model-value="this.dataToModal"
                        @update:model-value="this.$emit('update:dataToModal', $event)" range :max-date="new Date()"
                        :enable-time-picker="false" locale="ru" select-text="Выбрать" cancel-text="Отменить"
                        :start-time="[{ hours: 0, minutes: 0, seconds: 1 }, { hours: 23, minutes: 59, seconds: 59 }]"
                        :clearable="false" class="custom-datepicker" style="width: 100%;" />
                    <div class="scrollable-content" style="max-height: 80vh; overflow-y: auto;">
                        <v-col block v-if="$store.state.user_completed_tasks.length > 0"
                            v-for="taskData in this.$store.state.user_completed_tasks" :key="taskData.id" class="">
                            <div v-if="!this.$store.state.lodingArchive">
                                <v-card block @click="openDialogArchive(taskData)" class="ma-2 pa-2"
                                    style="min-height: 100px; border-radius: 20px; border: 2px solid limegreen;">
                                    <v-card-title>{{ taskData.name }}</v-card-title>
                                    <v-card-subtitle>{{ taskData.description }}</v-card-subtitle>
                                    <br />
                                    <v-divider></v-divider>
                                    <br />
                                    <v-progress-linear model-value="100" color="light-blue" height="10" striped
                                        style="border-radius: 20px;"></v-progress-linear>
                                    <v-card-text>
                                        <div class="project-name">
                                            <strong>Проект:</strong>
                                            {{ taskData.project_name }}
                                        </div>
                                    </v-card-text>
                                    <v-card-text>
                                        <div class="deadline-info">
                                            <strong>Дата завершения:</strong>
                                            {{ formattedDate(taskData.time_completed) }}
                                        </div>
                                    </v-card-text>
                                </v-card>
                                <TaskDialogCompleted :taskData="taskData" :dialog="taskData.dialog"
                                    @update:dialog="taskData.dialog = $event" :isLoadingPost="isLoadingPost">
                                </TaskDialogCompleted>
                            </div>
                        </v-col>
                        <v-col cols="12" v-else justify="center" align="center" class="text-h3 center"
                            style="margin-top: 50%">
                            <div v-if="!this.$store.state.lodingArchive">
                                Пусто
                            </div>
                        </v-col>
                        <div v-if="this.$store.state.lodingArchive" class="center_loding">
                            <v-progress-circular indeterminate color="#65b2f0"></v-progress-circular>
                        </div>
                    </div>
                </div>
            </v-container>
        </div>
    </div>
</template>
  
<script>
import TaskDialogCompleted from '@/components/UI/helps/TaskDialogCompleted.vue'
import axios from 'axios';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { getTimestampEnd, getTimestampStart } from "@/utils/dates";
import { Store } from 'vuex';
export default {
    components: {
        Datepicker,
        TaskDialogCompleted,
    },
    props: {
        dataToModal: Boolean,
    },
    data() {
        return {
            dialog: false,
            isOpen: false,
            taskPosts: null,
            isLoadingPost: false,
        };
    },
    methods: {
        formattedDate(time_completed) {
            if (time_completed) {
                const timestampInMilliseconds = time_completed * 1000;
                const date = new Date(timestampInMilliseconds);
                return date.toLocaleString();
            }
            return '';
        },
        openModal() {
            this.isOpen = true;
        },
        closeModal() {
            this.isOpen = false;
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
        async openDialogArchive(taskData) {
            taskData.dialog = true;
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
    },
};
</script>
  
<style scoped>


.modal-container {
    position: fixed;
    top: 64px;
    right: -25%;
    width: 25%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    transition: right 0.5s ease;
    z-index: 1000;
}

.modal {
    width: 100%;
    height: 100%;
    background-color: white;
    padding: 0.5rem;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
}

.modal-open {
    right: 0;
}

.center_loding {
    position: absolute;
    top: 50%;
    left: 50%;
}
</style>