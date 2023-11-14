<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog v-model="dialog" persistent width="1200">
                    <template v-slot:activator="{ props }">
                        <v-btn color="#65B2F0" v-bind="props" :disabled="this.disabled">
                            <v-icon icon="mdi-plus"></v-icon>Создать Задачу
                        </v-btn>
                    </template>
                    <v-card>
                        <v-container>
                            <v-card-title>
                                <span class="text-h5">Создать новую задачу</span>
                            </v-card-title>
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field v-model="task.name" label="Имя Задачи" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="task.description" @keydown.tab.prevent="insertTab"
                                            label="Описание"></v-textarea>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-text-field v-model="task.deadline" label="Дедлайн" type="date" required
                                            :rules="[rules.date]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-select v-model="task.project" browserAutocomplete="off" label="Выбрать проект"
                                            :items="$store.state.projectNameLst" :single-item="true"
                                            @update:model-value="updateProjectname">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="this.$store.state.usersname"
                                            :items="this.$store.state.username_lst" chips label="Выбрать пользователей"
                                            multiple @update:model-value="updateMembers"></v-select>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-container>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                                Закрыть
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="createTask">
                                Создать
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios'
import timestamp from "@/utils/dates"

export default {
    props: {
        disabled: Boolean,
        projectShow: Function
    },
    data() {
        return {
            dialog: false,
            task: {
                name: '',
                description: '',
                members: [],
                project: '',
                deadline: null,
            },
            rules: { date: value => typeof value === 'string' && value?.split("-")[0]?.length >= 4 || 'error' },
            projectTasks:null,
            taskPosts:null,
        }
    },
    watch: {
        'task.deadline': function (newVal, oldVal) {
            if (typeof newVal === 'number') { return; }
            if (newVal?.split('-')[0]?.length > 4) { this.task.deadline = oldVal; return; }
        }
    },
    methods: {
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
        updateMembers(selectedMembers) {
            this.task.members = selectedMembers;
        },
        updateProjectname(selectedProject) {
            this.task.project = selectedProject
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
        async createTask() {
            this.task.deadline = timestamp(this.task.deadline);
            this.task.members = this.$store.state.usersname
            this.dialog = false;
            console.log(this.task)
            try {
                const response = await axios.post('https://gosu-tasks-api.vercel.app/admin/create_task', this.task, this.getToken());

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

                const response = await axios.post('https://gosu-tasks-api.vercel.app/admin/create_task', this.task, this.getToken());

                const response2 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const currentTasks = response2.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_CHOSE_USER_CURRENT_TASKS", this.taskRemainingTime());
                this.$store.commit("SET_TASKS_LENGTH", this.taskRemainingTime());
                const currentPosts = response2.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_CHOSE_USER_CURRENT_POSTS", this.postRemainingTime());

                const response3 = await axios.get(`https://gosu-tasks-api.vercel.app/admin/show_completed_user_tasks&posts/${this.$store.state.selectedUser}`, this.getToken());
                const completedTask = response.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response3.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
                console.log(e)
            }
            console.log('Задача успешно создана!')
        },
    },
}
</script>

<style lang="scss" scoped></style> 