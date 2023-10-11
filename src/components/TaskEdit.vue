<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="this.$store.state.showEditTask" persistent width="1024">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Изменить задачу</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field :model-value="$store.state.taskEdit.task.name"
                                        @update:model-value="$store.commit('SET_TASK_EDIT_NAME', $event)" label="Имя Задачи" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea :model-value="$store.state.taskEdit.task.description"
                                        @update:model-value="$store.commit('SET_TASK_EDIT_DESCRIPTION', $event)" label="Описания" required></v-textarea>
                                </v-col>
                                <v-col cols="12" sm="3">
                                    <v-text-field :model-value="deadlineToISO($store.state.taskEdit.task.deadline)"
                                        @update:model-value="updateDeadline($event)" label="Дедлайн" type="date" required
                                        :rules="[rules.date]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="3">
                                    <v-select :model-value="$store.state.taskEdit.task.project" 
                                        @update:model-value="$store.commit('SET_TASK_EDIT_PROJECT', $event)" browserAutocomplete="off"
                                        :items="$store.state.projectname" label="Выбрать проект" :single-item="true"
                                        ></v-select>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select :model-value="$store.state.taskEdit.task.members"
                                        @update:model-value="$store.commit('SET_TASK_EDIT_MEMBERS', $event)" :items="username" chips label="Выбрать пользователей"
                                        multiple></v-select>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="closeEditTask">
                            Закрыть
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="createProject">
                            Сохранить
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios';
import timestamp from "@/utils/timestamp";

export default {
    props: {
        projectShow: Function
    },
    data() {
        return {
            rules: {
                date: value => typeof value === 'string' && value?.split("-")[0]?.length >= 4 || 'error'
            },
            username: [],
            project: {
                name: '',
                description: '',
                members: [],
                deadline: null,
            },
        }
    },
    watch: {
        '$store.state.showEditProject': function (newValue) {
            if (newValue === true) {
                this.editProject();
            }
        },
    },
    methods: {
        deadlineToISO(timestamp) {
            if (timestamp) {
                const date = new Date(timestamp * 1000);
                const isoDate = date.toISOString().split('T')[0];
                return isoDate;
            }
            return '';
        },
        updateDeadline(newDate) {
            const timestamp = Date.parse(newDate);
            this.$store.commit('SET_PROJECT_EDIT_DEADLINE', timestamp / 1000);
        },
        closeEditTask() {
            // this.$store.commit("SET_PROJECT_EDIT", []);
            this.$store.commit("SET_SHOW_EDIT_TASK", false);
        },
        updateMembers(selectedMembers) {
            this.project.members = selectedMembers;
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
        async getUserName() {
            const response = await axios.get('https://gosutasks-api.vercel.app/admin/get_users_list/', this.getToken())
            const username = response.data.map(obj => obj.username)
            this.username = username
            this.project.members = this.username;
        },
        async saveProject() {
            if (this.$store.state.projectEdit) {
                let project = {
                    name: this.$store.state.projectEdit.project.name,
                    description: this.$store.state.projectEdit.project.description,
                    deadline: this.$store.state.projectEdit.project.deadline,
                    members: this.$store.state.projectEdit.project.members,
                }
                let id = this.$store.state.projectEdit.project.id
                this.$store.commit("SET_SHOW_EDIT_PROJECT", false);
                const response = await axios.put(`https://gosutasks-api.vercel.app/admin/change_project/${id}`, project, this.getToken())
                if (response.status === 200) {
                    this.projectShow();
                } else if (response.status !== 200) {
                    alert('Ошибка')
                }
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
    async mounted() {
        await this.getUserName();
    }
}
</script>

<style lang="scss" scoped></style> 