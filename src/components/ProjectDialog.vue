<template>
    <div>
        <v-row justify="center">
            <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" width="1024"
                @click:outside="closeModal" no-transition>
                <v-card>
                    <div class="p-5 pl-3 pr-3 ml-2 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                        <div class="d-flex flex-column">
                            <div class="d-flex justify-space-between align-center">
                                <v-card-title class="text-truncate">{{ projectData.project.name }}</v-card-title>
                                <v-card-actions class="pa-2">
                                    <v-spacer></v-spacer>
                                    <div v-if="Role === 1">
                                        <VerticalThreeDots :projectData="projectData" @editDialog="showEditDialog"
                                            @deleteProject="deleteProject(projectData)" />
                                    </div>
                                </v-card-actions>
                            </div>
                            <div class="p-5 pl-3 mt-4 mb-4 ml-2">
                                Участники:
                                <div class="d-flex flex-wrap mb-2">
                                    <v-chip v-for="(member, index) in projectData.project.members" :key="index"
                                        color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                        {{ member }}
                                    </v-chip>
                                </div>
                            </div>
                            <div class="d-flex justify-space-between align-center mb-2 ml-2">
                                <div class="p-5 pl-3">
                                    <strong>Создано:</strong> {{ formatTimestamp(projectData.project.created_at) }}
                                </div>
                                <div class="pr-14">
                                    <strong>Дедлайн:</strong> {{ formatTimestamp(projectData.project.deadline) }}
                                </div>
                            </div>
                            <v-card-actions v-if="!dataLoaded" class="ml-2">
                                <div>
                                    <v-btn @click="tasksForProject" v-if="!isLoading && !dataLoaded">Вывести список
                                        задач</v-btn>
                                </div>
                            </v-card-actions>
                            <div v-else-if="dataLoaded && !isLoading">
                                <div class="d-flex ml-4">
                                    <!-- Левая половина (Завершенные задания) -->
                                    <div class="w-half pl-2">
                                        <div>
                                            <div>
                                                Завершенные задания:
                                            </div>
                                            <v-row>
                                                <v-col v-for="taskData in this.$store.state.completedTasks" :key="taskData.id" cols="4">
                                                    <v-card @click="openDialogTask(taskData)" color="green-accent-3"
                                                        block rounded-lg>
                                                        <template v-slot:title class="text-h6">{{ taskData.name
                                                        }}</template>
                                                        <template v-slot:subtitle>{{ taskData.description }}</template>
                                                    </v-card>
                                                    <TaskDialogCompleted :taskData="taskData" :dialog="taskData.dialog"
                                                        @update:dialog="taskData.dialog = $event" :Role="Role"></TaskDialogCompleted>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </div>
                                    <TaskEdit :tasksForProject="tasksForProject"></TaskEdit>
                                    <!-- Правая половина (Список текущих задач) -->
                                    <div class="w-half pr-2">
                                        <div>
                                            <div>
                                                Список текущих задач:
                                            </div>
                                            <v-row>
                                                <v-col v-for="taskData in this.$store.state.currentTasks" :key="taskData.task.id" cols="4">
                                                    <v-card @click="openDialogTask(taskData)" :class="CardClass(taskData)"
                                                        block rounded-lg>
                                                        <template v-slot:title class="text-h6">{{ taskData.task.name
                                                        }}</template>
                                                        <template v-slot:subtitle>{{ taskData.task.description }}</template>
                                                    </v-card>
                                                    <TaskDialog :taskData="taskData" :dialog="taskData.dialog"
                                                        @update:dialog="taskData.dialog = $event" :Role="Role"></TaskDialog>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: center; align-items: center;">
                                <v-progress-circular v-if="isLoading" indeterminate color="#65b2f0"></v-progress-circular>
                            </div>
                            <v-card-text class="pr-13 mt-5">
                                {{ projectData.project.description }}
                            </v-card-text>
                        </div>
                        <v-card-actions class="pa-2 justify-end">
                            <div v-if="Role === 1">
                                <v-btn color="green-accent-3" @click="completeProject(projectData)">Завершить</v-btn>
                            </div>
                        </v-card-actions>
                    </div>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios';
import VerticalThreeDots from '@/components/helps/VerticalThreeDots';
import TaskDialog from '@/components/TaskDialog.vue'
import TaskEdit from '@/components/TaskEdit.vue'
import TaskDialogCompleted from '@/components/TaskDialogCompleted.vue'

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
    },
    data() {
        return {
            projectTasks: [],
            show: true,
            isLoading: false,
            dataLoaded: false,
        }
    },
    methods: {
        currentTasks() {
            console.log(1)
            return this.$store.state.tasks.filter(task => task.status === 'current');
        },
        completedTasks() {
            console.log(2)
            return this.$store.state.tasks.filter(task => task.status === 'completed');
        },
        taskRemainingTime() {
            if (!this.projectTasks || this.projectTasks.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.projectTasks.map(task => {
                const timeUntilDeadline = task.deadline - currentTime;
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
                    task,
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
            console.log(taskData)
            const cardClass = {
                'ma-4': true,
                'pa-2': true,
            };
            console.log(taskData.urgency);
            if (taskData.urgency == 1) {
                cardClass['red-card'] = true;
            } else if (taskData.urgency == 2) {
                cardClass['orange-card'] = true;
            } else if (taskData.urgency == 3) {
                cardClass['yellow-card'] = true;
            }

            return Object.keys(cardClass).join(" ");
        },
        formatTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
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
        closeModal() {
            this.dataLoaded = false;
            this.$emit('update:dialog', false);
        },
        async deleteProject(projectData) {
            try {
                this.closeDialog();
                const response = await axios.delete(`https://gosutasks-api.vercel.app/admin/delet_project/${projectData.project.id}`, this.getToken());
                console.log('Проект успешно удалена:', response.data);
                this.projectShow();
            } catch {

            }
        },
        async completeProject(projectData) {
            try {
                this.closeDialog();
                const response = await axios.patch(`https://gosutasks-api.vercel.app/admin/complete_project/${projectData.project.id}`, undefined, this.getToken());
                console.log('Проект успешно завершон', response.data);
                this.projectShow();
            } catch {

            }
        },
        async tasksForProject() {
            this.$store.commit("SET_TASKS", [])
            this.isLoading = true;
            this.dataLoaded = true;
            try {
                const name = this.projectData.project.name
                const response = await axios.get(`https://gosutasks-api.vercel.app/company/projects_tasks/${name}`, this.getToken());
                this.projectTasks = response.data;
                const completedTasks = this.projectTasks.filter(item => item.status === 'complete');
                this.projectTasks = this.projectTasks.filter(item => item.status === 'current');
                this.$store.commit("SET_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_COMPLETED_TASKS", completedTasks)
            } catch {

            } finally {
                this.isLoading = false;
            }
        },
        showEditDialog() {
            this.closeModal();
        },
        emitProjectData() {
            this.$emit("projectDataChanged", this.projectData);
        },
        openDialogTask(taskData) {
            taskData.dialog = true;
            this.selectedProjectData = taskData;
        },
    },

}
</script>

<style lang="scss" scoped>
body.modal-open {
    overflow: hidden;
}

.no-animation .v-dialog__content {
    transition: none !important;
}

.v-dialog.v-dialog--active::before {
    background-color: rgba(0, 0, 0, 0.01);
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
}

.red-card {
    background-color: red;
}

.orange-card {
    background-color: orange;
}

.yellow-card {
    background-color: yellow;
}

.d-flex {
    display: flex;
    flex-direction: row;
}

.w-half {
    width: 50%;
    box-sizing: border-box;
}

.pr-2 {
    padding-right: 2rem;
}

.pl-2 {
    padding-left: 2rem;
}
</style>