<template>
    <div>
        <v-row justify="center">
            <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" width="824">
                <v-card>
                    <div class="p-5 pl-3 pr-3 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                        <div class="d-flex flex-column">
                            <div class="d-flex justify-space-between align-center">
                                <v-card-title class="text-truncate">{{ taskData.task.name }}</v-card-title>
                                <v-card-actions class="pa-2">
                                    <v-spacer></v-spacer>
                                    <div v-if="Role === 1">
                                        <TaskVerticalThreeDots :taskData="taskData" @editDialog="showDialog"
                                            @deleteTask="deleteTask(taskData)" />
                                    </div>
                                </v-card-actions>
                            </div>
                            <div class="p-5 pl-3 mt-4 mb-4">
                                Задача для:
                                <div class="d-flex flex-wrap mb-2">
                                    <v-chip v-for="(member, index) in taskData.task.members" :key="index"
                                        color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                        {{ member }}
                                    </v-chip>
                                </div>
                            </div>
                            <div class="d-flex justify-space-between align-center mb-2">
                                <div class="p-5 pl-3">
                                    <strong>Создано:</strong> {{ formatTimestamp(taskData.task.created_at) }}
                                </div>
                                <div class="pr-14">
                                    <strong>Дедлайн:</strong> {{ formatTimestamp(taskData.task.deadline) }}
                                </div>
                            </div>
                            <!-- <div>
                                {{ this.$store.state.tasks }}
                            </div> -->
                            <v-card-actions>
                                <div>
                                    <v-btn @click="tasksForProject" v-if="!isLoading && !dataLoaded">Вывести список
                                        подзадач</v-btn>
                                    <v-progress-circular v-if="isLoading" indeterminate
                                        color="primary"></v-progress-circular>
                                </div>
                            </v-card-actions>
                            <div v-if="dataLoaded">
                                <!-- Отображение данных после загрузки -->
                                <!-- Здесь можно отобразить полученные данные -->
                                <v-row>
                                    <v-col v-for="taskData in this.projectTasks" :key="taskData.id" cols="2">
                                        <v-card class="ma-2 pa-2" block rounded-lg @click="openDialogTask(taskData)">
                                            <template v-slot:title>{{ taskData.name }}</template>
                                            <template v-slot:subtitle>{{ taskData.description }}</template>
                                        </v-card>
                                        <TaskDialog :taskData="taskData" :dialog="taskData.dialog" @update:dialog="taskData.dialog = $event"></TaskDialog>
                                    </v-col>
                                </v-row>
                            </div>
                            <v-card-text class="pr-13">
                                {{ taskData.task.description }}
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
import TaskVerticalThreeDots from '@/components/helps/TaskVerticalThreeDots';
import TaskDialog from '@/components/TaskDialog.vue'

export default {
    components: {
        TaskVerticalThreeDots,
        TaskDialog,
    },
    props: {
        Role: Number,
        dialog: Boolean,
        taskData: Object,
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
        closeDialog() {
            console.log("closeDialog is called");
            this.dataLoaded = false;
            this.$emit('update:dialog', false);
        },
        async deleteTask(taskData) {
            try {
                this.closeDialog();
                const response = await axios.delete(`https://gosu-tasks-api.vercel.app/admin/delet_project/${taskData.task.id}`, this.getToken());
                console.log('Проект успешно удалена:', response.data);
                this.tasksForProject();
            } catch {

            }
        },
        async completeProject(projectData) {
            try {
                this.closeDialog();
                const response = await axios.patch(`https://gosu-tasks-api.vercel.app/admin/complete_project/${projectData.project.id}`, undefined, this.getToken());
                console.log('Проект успешно завершон', response.data);
                this.projectShow();
            } catch {

            }
        },
        async tasksForProject() {
            this.isLoading = true;
            this.dataLoaded = true;
            try {
                const name = this.projectData.project.name
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${name}`, this.getToken());
                this.projectTasks = response.data
            } catch {

            } finally {
                this.isLoading = false;
            }
        },
        showDialog() {
            this.closeDialog();
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
.v-dialog.v-dialog--active::before {
    background-color: rgba(0, 0, 0, 0.01);
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
}
</style>