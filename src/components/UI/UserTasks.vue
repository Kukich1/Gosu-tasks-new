<template>
    <div class="modal-container" :class="{ 'modal-open': isOpen }">
        <div class="modal">
            <div v-if="this.$store.state.loding" class="center_loding">
                <v-progress-circular indeterminate color="#65b2f0"></v-progress-circular>
            </div>
            <div v-else>
                <v-btn @click="OpenDate" style="margin-bottom:0.5rem" variant="outlined">
                    <v-icon>mdi-file-export</v-icon>
                    <b>Excel {{this.selectedUser}}</b>
                </v-btn>
                
                <div class="d-flex">
                    <div style="width:200px">
                        <v-text-field v-model="SearchQuery" label="Название проекта"></v-text-field>
                    </div>
                    <div style="display: flex; flex-direction: column; padding-left:10px">
                        <div style="padding:5px">
                            <v-btn @click="closeModal" size="x-small" variant="tonal">
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
                    <p>Все задачи - {{ this.$store.state.tasks_length.length }}</p>
                </div>
                <div class="tasks-table" v-if="this.$store.state.chose_user_current_tasks.length > 0">
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
                        <div class="table-row" v-for="task in this.$store.state.chose_user_current_tasks" :key="task.task.id"
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
            </div>
        </div>
    </div>
</template>

<script>
import { stringifyQuery } from 'vue-router';


export default {

    props: {
        isOpen: Boolean,
        selectedUser: String,
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
        this.originalData = this.$store.state.chose_user_current_tasks;
        this.TasksLength = this.$store.state.tasks_length.length;
    },
    watch: {
        SearchQuery(newVal) {
            const search = newVal.toLowerCase();
            if (search === '') {
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.originalData)
            } else {
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.originalData.filter(task => task.task.project_name.toLowerCase().includes(search)));
            }
        },
    },
    methods: {
        CloseDate() {
            this.showDate = false;
        },
        closeModal() {
            this.$emit('closeModal');
        },
        OpenDate() {
            this.$emit('OpenDate', true);
        },
        toggleSort() {
            this.sortAscending = !this.sortAscending;
            this.sortTasks();
        },
        sortTasks() {
            this.$store.state.chose_user_current_tasks.sort((a, b) => {
                const dateA = a.task.deadline;
                const dateB = b.task.deadline;
                return this.sortAscending ? dateA - dateB : dateB - dateA;
            });
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
            this.$emit('setActiveTask', task)
        },
    },
}

</script>

<style lang="scss" scoped>
.modal-container {
    position: fixed;
    top: 64px;
    left: -150px;
    width: 300px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-start;
    transition: left 0.5s ease;
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
    left: 180px;
}

.center_loding {
    position: absolute;
    top: 50%;
    left: 50%;
}

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