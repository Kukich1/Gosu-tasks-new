<template>
    <div>
        <v-card class="company_container" flat>
            <v-tabs align-tabs="end" color="65B2F0" @update:model-value="this.$emit('update:tab', $event)"
                :model-value="tab">
                <v-tab value="current">Проекты</v-tab>
                <v-tab value="completed">Архив</v-tab>
            </v-tabs>

            <v-window :model-value="tab" v-on:update:model-value="this.$emit('update:tab', $event)"
                style="padding: 20px; max-height: 83vh; overflow-y: auto;">
                <v-window-item value="current">
                    <v-row>
                        <transition-group name="project_current">
                            <v-col v-for="projectData in this.$store.state.projects" :key="projectData.project.id" cols="4"
                                style="padding:20px" class="scrollable-container">
                                <v-card v-if="projectData.project" @click="openDialogProject(projectData)"
                                    :class="getCardClass(projectData)" class="ma-2 pa-2" block rounded-lg
                                    style="min-height: 375px; border-radius: 20px;">
                                    <!-- <div class="card-image"
                                        style="background-image: src='../IMG/resource.png'; 
                                        background-position: top; background-size: cover;"> -->
                                    <v-card-title>{{ projectData.project.name }}</v-card-title>
                                    <v-card-subtitle>{{ projectData.project.description }}</v-card-subtitle>
                                    <br />
                                    <br />
                                    <v-divider></v-divider>
                                    <br />
                                    <br />
                                    <v-progress-linear :model-value="calculateProgress(projectData)" color="light-blue"
                                        height="10" striped style="border-radius: 20px;"></v-progress-linear>
                                    <br />
                                    <br />
                                    <v-card-text>
                                        <div class="deadline-info">
                                            <strong>{{ projectData.timeUntilDeadline > 0 ? 'Дедлайн через' : 'Дедлайн был'
                                            }}</strong>
                                            <div>
                                                {{ this.$store.state.dates[projectData.id] }}
                                                <div class="deadline-values">
                                                    <p>Дней:</p>{{ this.$store.state.dates[projectData.project.id]?.days
                                                    }}
                                                </div>
                                                <div class="deadline-values">
                                                    <p>Часов:</p>{{
                                                        this.$store.state.dates[projectData.project.id]?.hours
                                                    }}
                                                </div>
                                                <div class="deadline-values">
                                                    <p>Минут:</p>{{
                                                        this.$store.state.dates[projectData.project.id]?.minutes
                                                    }}
                                                </div>
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-card>
                                <ProjectDialog :Role="Role" :isLoading="isLoading"
                                    @update:dialog="projectData.dialog = $event" :dialog="projectData.dialog"
                                    :projectData="projectData" ref="projectDialog">
                                </ProjectDialog>
                            </v-col>
                        </transition-group>
                        <ProjectEdit></ProjectEdit>
                    </v-row>
                </v-window-item>
                <v-window-item value="completed" style="height: 83vh">
                    <v-row>
                        <v-col cols="6" style="padding:20px">
                            <Datepicker :model-value="this.dateRange"
                                @update:model-value="this.$emit('update:dateRange', $event)" range :max-date="new Date()"
                                :enable-time-picker="false" locale="ru" select-text="Выбрать" cancel-text="Отменить"
                                :start-time="[{ hours: 0, minutes: 0, seconds: 1 }, { hours: 23, minutes: 59, seconds: 59 }]"
                                :clearable="false" class="custom-datepicker" style="width: 100%;" />
                        </v-col>
                        <v-col cols="6" style="padding:20px;">
                            <v-text-field v-model="searchProjectName" label="Поиск проектов"
                                style="height: 33px;"></v-text-field>
                        </v-col>
                        <transition-group name="project_current">
                            <v-col block v-if="archive_filter.length > 0" v-for="item in archive_filter" :key="item.id"
                                cols="4" style="padding:20px" class="scrollable-container">
                                <v-card block @click="openDialogArchive(item)" class="ma-2 pa-2"
                                    style="min-height: 375px; border-radius: 20px; border: 2px solid limegreen;">
                                    <v-card-title>{{ item.name }}</v-card-title>
                                    <v-card-subtitle>{{ item.description }}</v-card-subtitle>
                                    <br />
                                    <br />
                                    <v-divider></v-divider>
                                    <br />
                                    <br />
                                    <v-progress-linear model-value="100" color="light-blue" height="10" striped
                                        style="border-radius: 20px;"></v-progress-linear>
                                    <br />
                                    <br />
                                    <v-card-text>
                                        <div class="deadline-info">
                                            <strong>Дата завершения:</strong>
                                            {{ formattedDate(item.time_completed) }}
                                        </div>
                                    </v-card-text>
                                </v-card>
                                <ArchiveDialog :dialog="item.dialog" @update:dialog="item.dialog = $event" :item="item"
                                    :isLoading="isLoading">
                                </ArchiveDialog>
                            </v-col>
                            <v-col cols="12" v-else justify="center" align="center" class="text-h3 center">
                                Пусто
                            </v-col>
                        </transition-group>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-card>
    </div>
</template>

<script>
import ProjectDialog from '@/components/UI/ProjectDialog.vue';
import ProjectEdit from '@/components/UI/ProjectEdit.vue';
import ArchiveDialog from '@/components/UI/ArchiveDialog.vue';
import axios from 'axios';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
    props: {
        Role: Number,
        archive: Array,
        dateRange: Array,
        tab: String,
    },
    components: {
        Datepicker,
        ProjectDialog,
        ProjectEdit,
        ArchiveDialog,
    },
    data() {
        return {
            archive_filter: this.archive,
            originalArchiveData: this.archive,
            isLoading: false,
            projectTasks: [],
            searchProjectName: "",
        };
    },

    watch: {
        searchProjectName(newVal) {
            const search = newVal.toLowerCase();
            if (search === "") {
                this.archive_filter = this.originalArchiveData;
            } else {
                this.archive_filter = this.originalArchiveData.filter(item => item.name.toLowerCase().includes(search));
            }
        }
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
        calculateProgress(projectData) {
            if (projectData.project.task_count === 0) {
                return 0; // Если нет задач, прогресс 0%
            }
            const progress = (projectData.project.task_completed_count / projectData.project.task_count) * 100;
            return progress;
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
        getCardClass(projectData) {
            const cardClass = {
                'ma-2': true,
                'pa-2': true,
            };

            if (projectData.urgency == 1) {
                cardClass['red-card'] = true;
            } else if (projectData.urgency == 2) {
                cardClass['orange-card'] = true;
            } else if (projectData.urgency == 3) {
                cardClass['yellow-card'] = true;
            }
            return cardClass;
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
        async openDialogProject(projectData) {
            projectData.dialog = true;
            const projectInfo = {
                id: projectData.project.id,
                name: projectData.project.name
            };
            this.$store.commit("SET_PROJECT_NAME_CURRENT", projectInfo)
            let id = projectData.project.id
            this.$store.commit("SET_PROJECT_ID_CURRENR", projectData.project.id)
            this.isLoading = true;
            try {
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${id}`);
                this.projectTasks = response.data;
                const completedTasks = this.projectTasks.filter(item => item.status === 'completed');
                const currentTasks = this.projectTasks.filter(item => item.status === 'current');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_COMPLETED_TASKS", completedTasks);
            } catch (error) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${id}`);
                this.projectTasks = response.data;
                const completedTasks = this.projectTasks.filter(item => item.status === 'completed');
                const currentTasks = this.projectTasks.filter(item => item.status === 'current');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_COMPLETED_TASKS", completedTasks);
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },
        async openDialogArchive(item) {
            item.dialog = true;
            this.$store.commit("SET_COMPLETED_TASKS", []);
            this.isLoading = true;
            try {
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${item.id}`);
                this.projectTasks = response.data;
                this.$store.commit("SET_COMPLETED_TASKS", this.projectTasks);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${item.id}`);
                this.projectTasks = response.data;
                this.$store.commit("SET_COMPLETED_TASKS", this.projectTasks);
                console.log(e)
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.company_container{
    background-color: #f4f7fd;
}
/* Стили для контейнера с скроллбаром */
.v-window {
    max-height: 88vh;
    overflow-y: auto;
}

/* Стили для вертикального скроллбара */
.v-window::-webkit-scrollbar {
    width: 8px;
}

.v-window::-webkit-scrollbar-track {
    background: #f5f5f5;
    /* Цвет фона трека */
}

.v-window::-webkit-scrollbar-thumb {
    background: #888;
    /* Цвет ползунка скроллбара */
    border-radius: 4px;
}

/* Стили для горизонтального скроллбара (если применимо) */
.v-window::-webkit-scrollbar-thumb:horizontal {
    width: 8px;
}

.v-window::-webkit-scrollbar-thumb:horizontal:hover {
    background: #555;
    /* Цвет ползунка при наведении */
}


.center {
    position: absolute;
    top: 40%;
    left: 2%;
}

.project_current-item {
    display: inline-block;
    margin-right: 10px;
}

.project_current-enter-active,
.project_current-leave-active {
    transition: all 1s ease;
}

.project_current-enter-from,
.project_current-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.project_current-list-move {
    transition: transform 0.8s ease;
}

.deadline-info {
    align-items: flex-end;
    height: 100%;
    columns: 1;
}

.deadline-values {
    display: flex;
    justify-content: space-between;
}

.progress {
    height: 100%;
    background-color: #65B2F0;
}

.scrollable-container {
    overflow-y: auto;
    max-height: 100%;
    border-radius: 10px;
    overflow: hidden;
}

.red-card {
    border: 2px solid red;
}

.orange-card {
    border: 2px solid orange
}

.yellow-card {
    border: 2px solid yellow;
}

.custom-datepicker {
    width: 50vh;
}

.v_card_text {
    height: calc(100vh - 176px);
    overflow: auto;
}
</style>