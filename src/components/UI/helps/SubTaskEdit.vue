<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog v-model="this.$store.state.showEditPosts" persistent width="600">
                    <v-card>
                        <v-card-title>
                            <span class="text-h5 pl-8">Изменить подзадачу</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field :model-value="$store.state.postEdit.post.name"
                                            @update:model-value="$store.commit('SET_POST_EDIT_NAME', $event)"
                                            label="Имя Проекта" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea :model-value="$store.state.postEdit.post.description"
                                            @update:model-value="$store.commit('SET_POST_EDIT_DESCRIPTION', $event)"
                                            @keydown.tab.prevent="insertTab" label="Описания" required></v-textarea>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field :model-value="$store.state.postEdit.post.task" 
                                        @update:modal-value="$store.commit('SET_POST_EDIT_TASK', $event)" label="Выбрать задачу" required>
                                        </v-text-field>
                                    </v-col>
                                    <v-col style="min-width: 350px;" cols="12" sm="3">
                                        <v-text-field :model-value="deadlineToISO($store.state.postEdit.post.deadline)"
                                            @update:model-value="updateDeadline($event)" label="Дедлайн" type="date"
                                            required :rules="[rules.date]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-select v-model="this.$store.state.current_user" chips
                                            label="Выбрать пользователя"></v-select>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="closeEditProject">
                                Закрыть
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="savePost">
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
            dataFromServer: null,
            username: [],
            post: {
                name: '',
                description: '',
                member: [],
                deadline: null,
                task: '',
            },
            rules: { date: value => typeof value === 'string' && value?.split("-")[0]?.length >= 4 || 'error' },
        }
    },
    watch: {
        'project.deadline': function (newVal, oldVal) {
            console.log("newVal", newVal);
            console.log("oldVal", oldVal);
            if (typeof newVal === 'number') { return; }
            if (newVal?.split('-')[0]?.length > 4) { this.project.deadline = oldVal; return; }
        },
    },
    methods: {
        updateMembers(selectedMembers) {
            this.project.members = selectedMembers;
        },
        updateDeadline(newDate) {
            const timestamp = Date.parse(newDate);
            this.$store.commit('SET_POST_EDIT_DEADLINE', timestamp / 1000);
        },
        closeEditProject() {
            this.$store.commit("SET_SHOW_EDIT_POST", false);
        },
        deadlineToISO(timestamp) {
            if (timestamp) {
                const date = new Date(timestamp * 1000);
                const isoDate = date.toISOString().split('T')[0];
                return isoDate;
            }
            return '';
        },
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
        async savePost() {
            const post = {
                name: this.$store.state.postEdit.post.name,
                description: this.$store.state.postEdit.post.description,
                deadline: this.$store.state.postEdit.post.deadline,
                member: this.$store.state.current_user,
                task: this.$store.state.postEdit.post.task,
            }
            console.log("post", post);
            let id_post = this.$store.state.postEdit.post.id;
            let id_task = this.$store.state.currentTask;
            this.$store.commit("SET_SHOW_EDIT_POST", false);
            try {
                const response = await axios.put(`https://gosu-tasks-api.vercel.app/user/change_post/${id_post}`, post, this.getToken());
            } catch (e) {
                console.log(e);
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token");
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.put(`https://gosu-tasks-api.vercel.app/user/change_post/${id_post}`, post, this.getToken());
            } finally {
            }
            const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/task_posts/${id_task}`);
            this.taskPosts = response.data;
            const completedPosts = this.taskPosts.filter(item => item.status === 'completed');
            const currentPosts = this.taskPosts.filter(item => item.status === 'current');
            this.taskPosts = currentPosts;
            this.$store.commit("SET_POSTS_CURRENT", this.postRemainingTime());
            this.$store.commit("SET_POSTS_COMPLETED", completedPosts);
        },
    },
}
</script>

<style lang="scss" scoped></style> 