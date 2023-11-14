<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog v-model="this.$store.state.showEditTask" persistent width="1200">
                    <v-card>
                        <v-card-title>
                            <span class="text-h5">Изменить задачу</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field :model-value="$store.state.taskEdit.task.name"
                                            @update:model-value="$store.commit('SET_TASK_EDIT_NAME', $event)"
                                            label="Имя Задачи" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea :model-value="$store.state.taskEdit.task.description"
                                            @update:model-value="$store.commit('SET_TASK_EDIT_DESCRIPTION', $event)"
                                            label="Описания" required></v-textarea>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-text-field :model-value="deadlineToISO($store.state.taskEdit.task.deadline)"
                                            @update:model-value="updateDeadline($event)" label="Дедлайн" type="date"
                                            required :rules="[rules.date]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-select v-model="$store.state.project_current_name.name"
                                            :items="$store.state.projectNameLst" label="Выбрать проект"
                                            :single-item="true"></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-select :model-value="$store.state.taskEdit.task.members"
                                            @update:model-value="$store.commit('SET_TASK_EDIT_MEMBERS', $event)"
                                            :items="this.$store.state.username_lst" chips label="Выбрать пользователей"
                                            multiple></v-select>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="closeEditTask">
                                Закрыть
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="saveProject">
                                Сохранить
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios';
import timestamp from "@/utils/dates";

export default {
    props: {
        projectShow: Function
    },
    data() {
        return {
            rules: { date: value => typeof value === 'string' && value?.split("-")[0]?.length >= 4 || 'error' },
            username: [],
            project: {
                name: '',
                description: '',
                members: [],
                deadline: null,
            },
            projectTasks: null,
        }
    },
    watch: {
        '$store.state.showEditProject': function (newValue) {
            if (newValue === true) {
                this.editProject();
            }
        },
    },
    watch: {
        'project.deadline': function (newVal, oldVal) {
            console.log("newVal", newVal);
            console.log("oldVal", oldVal);
            if (typeof newVal === 'number') { return; }
            if (newVal?.split('-')[0]?.length > 4) { this.project.deadline = oldVal; return; }
        }
    },
    methods: {
        updateMembers(selectedMembers) {
            this.project.members = selectedMembers;
        },
        closeEditTask() {
            this.$store.commit("SET_SHOW_EDIT_TASK", false);
        },
        updateDeadline(newDate) {
            const timestamp = Date.parse(newDate);
            this.$store.commit('SET_TASK_EDIT_DEADLINE', timestamp / 1000);
        },
        deadlineToISO(timestamp) {
            if (timestamp) {
                const date = new Date(timestamp * 1000);
                const isoDate = date.toISOString().split('T')[0];
                return isoDate;
            }
            return '';
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
        getToken() {
            const token = localStorage.getItem("token");
            const cleanToken = token.replaceAll("\"", "");
            return {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
            };
        },
        async saveProject() {
            let task = {
                name: this.$store.state.taskEdit.task.name,
                description: this.$store.state.taskEdit.task.description,
                deadline: this.$store.state.taskEdit.task.deadline,
                project: this.$store.state.project_current_name.name,
                members: this.$store.state.taskEdit.task.members,
            }
            let id = this.$store.state.taskEdit.task.id
            let project_id = this.$store.state.project_current_name.id
            this.$store.commit("SET_SHOW_EDIT_TASK", false);
            try {
                const response = await axios.put(`https://gosu-tasks-api.vercel.app/admin/change_task/${id}`, task, this.getToken())
                console.log('Задача успешно изменена!')
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.put(`https://gosu-tasks-api.vercel.app/admin/change_task/${id}`, task, this.getToken())
                console.log(e)
            }
            const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/projects_tasks/${project_id}`);
            this.projectTasks = response.data;
            const completedTasks = this.projectTasks.filter(item => item.status === 'completed');
            const currentTasks = this.projectTasks.filter(item => item.status === 'current');
            this.projectTasks = currentTasks;
            this.$store.commit("SET_CURRENT_TASKS", this.taskRemainingTime());
            this.$store.commit("SET_COMPLETED_TASKS", completedTasks);

        },
    },
}
</script>

<style lang="scss" scoped></style> 