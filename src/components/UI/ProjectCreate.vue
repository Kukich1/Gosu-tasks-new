<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog v-model="dialog" persistent width="1200">
                    <template v-slot:activator="{ props }">
                        <v-btn color="#65B2F0" v-bind="props" :disabled="this.disabled">
                            <v-icon icon="mdi-plus"></v-icon>Создать Проект
                        </v-btn>
                    </template>
                    <v-card>
                        <v-container>
                            <v-card-title>
                                <span class="text-h5">Добавить новый проект</span>
                            </v-card-title>

                            <v-card-text>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field v-model="project_name" label="Имя Проекта" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="project_description" @keydown.tab.prevent="insertTab"
                                            label="Описания"></v-textarea>
                                    </v-col>
                                    <v-col style="min-width: 350px;" cols="12" sm="6">
                                        <v-text-field v-model="project.deadline" label="Дедлайн" type="date" required
                                            :rules="[rules.date]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="username" :items="this.$store.state.username_lst" chips
                                            label="Выбрать пользователей" multiple
                                            @update:model-value="updateMembers"></v-select>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-container>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="closeCreateProject">
                                Закрыть
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="createProject">
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
            dataFromServer: null,
            username: this.$store.state.usersname,
            project_name: '',
            project_description: '',
            project: {
                name: '',
                description: '',
                members: [],
                deadline: null,
            },
            rules: { date: value => typeof value === 'string' && value?.split("-")[0]?.length >= 4 || 'error' },
        }
    },
    watch: {
        'project.deadline': function (newVal, oldVal) {
            if (typeof newVal === 'number') { return; }
            if (newVal?.split('-')[0]?.length > 4) { this.project.deadline = oldVal; return; }
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
        closeCreateProject() {
            this.dialog = false;
        },
        updateMembers(selectedMembers) {
            this.project.members = selectedMembers;
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
        async createProject() {
            this.project.deadline = timestamp(this.project.deadline);
            this.project.members = this.username;
            this.project.name = this.project_name;
            this.project.description = this.project_description;
            this.dialog = false;
            console.log(this.project)
            try {
                const response = await axios.post('https://gosu-tasks-api.vercel.app/admin/create_project', this.project, this.getToken());
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.post('https://gosu-tasks-api.vercel.app/admin/create_project', this.project, this.getToken());
                console.log(e)
            } finally {
                this.project.name = '';
                this.project.description = '';
                const response = await axios.get('https://gosu-tasks-api.vercel.app/company/projects/', this.getToken());
                this.dataFromServer = response.data;
                console.log(response.data)
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
            }
        }
    }
}
</script>

<style lang="scss" scoped></style> 