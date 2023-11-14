<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog v-model="this.$store.state.showEditProject" persistent width="1200">
                    <v-card>
                        <v-card-title>
                            <span class="text-h5 pl-8">Изменить проект</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field :model-value="$store.state.projectEdit.project.name"
                                            @update:model-value="$store.commit('SET_PROJECT_EDIT_NAME', $event)"
                                            label="Имя Проекта" required></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea :model-value="$store.state.projectEdit.project.description"
                                            @update:model-value="$store.commit('SET_PROJECT_EDIT_DESCRIPTION', $event)"
                                            @keydown.tab.prevent="insertTab" label="Описания" required></v-textarea>
                                    </v-col>
                                    <v-col style="min-width: 350px;" cols="12" sm="6">
                                        <v-text-field
                                            :model-value="deadlineToISO($store.state.projectEdit.project.deadline)"
                                            @update:model-value="updateDeadline($event)" label="Дедлайн" type="date"
                                            required :rules="[rules.date]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-select :model-value="$store.state.projectEdit.project.members"
                                            @update:model-value="$store.commit('SET_PROJECT_EDIT_MEMBERS', $event)"
                                            :items="this.$store.state.username_lst" chips label="Выбрать пользователей"
                                            multiple></v-select>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="closeEditProject">
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
            dataFromServer: null,
            username: [],
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
            this.$store.commit('SET_PROJECT_EDIT_DEADLINE', timestamp / 1000);
        },
        closeEditProject() {
            this.$store.commit("SET_SHOW_EDIT_PROJECT", false);
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
        async saveProject() {
            let project = {
                name: this.$store.state.projectEdit.project.name,
                description: this.$store.state.projectEdit.project.description,
                deadline: this.$store.state.projectEdit.project.deadline,
                members: this.$store.state.projectEdit.project.members,
            }
            let id = this.$store.state.projectEdit.project.id
            this.$store.commit("SET_SHOW_EDIT_PROJECT", false);
            try {
                const response = await axios.put(`https://gosu-tasks-api.vercel.app/admin/change_project/${id}`, project, this.getToken());
            } catch (e) {
                console.log(e);
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token");
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.put(`https://gosu-tasks-api.vercel.app/admin/change_project/${id}`, project, this.getToken());
            } finally {
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
            }
        },
    },
}
</script>

<style lang="scss" scoped></style> 