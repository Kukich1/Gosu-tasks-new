<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent width="1024">
                <template v-slot:activator="{ props }">
                    <v-btn color="#65B2F0" v-bind="props" :disabled="this.disabled">
                        <v-icon icon="mdi-plus"></v-icon>Add New Task
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Создать новую задачу</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="task.name" label="Имя Задачи" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea v-model="task.description" label="Описания"></v-textarea>
                                </v-col>
                                <v-col cols="12" sm="3">
                                    <v-text-field v-model="task.deadline" label="Дедлайн" type="date" required
                                        :rules="[rules.date]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="3">
                                    <v-select v-model="task.project" browserAutocomplete="off"
                                        :items="$store.state.projectname" label="Выбрать проект" :single-item="true"
                                        @update:model-value="updateProjectname"></v-select>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select v-model="task.members" :items="username" chips label="Выбрать пользователей"
                                        multiple @update:model-value="updateMembers"></v-select>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                            Закрыть
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="createProject">
                            Создать
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios'
import timestamp from "@/utils/timestamp"

export default {
    props: {
        disabled: Boolean,
        projectShow: Function
    },
    data() {
        return {
            rules: {
                date: value => typeof value === 'string' && value?.split("-")[0]?.length >= 4 || 'error'
            },
            dialog: false,
            username: [],
            task: {
                name: '',
                description: '',
                members: [],
                project: '',
                deadline: null,
            },
        }
    },
    methods: {
        updateMembers(selectedMembers) {
            this.task.members = selectedMembers;
        },
        updateProjectname(selectedProject) {
            this.task.project = selectedProject
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
        async getUsernameAndProjectname() {
            this.task.project = this.projectname;
            try {
                const response = await axios.get('https://gosutasks-api.vercel.app/admin/get_users_list/', this.getToken());
                const username = response.data.map(obj => obj.username);
                this.username = username;
                this.task.members = this.username;
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }

        },
        async createProject() {
            this.task.deadline = timestamp(this.task.deadline);
            this.dialog = false;
            const response = await axios.post('https://gosutasks-api.vercel.app/admin/create_task', this.task, this.getToken())
            if (response.status === 200) {
                this.projectShow();
                this.task.name = '';
                this.task.description = '';
            } else if (response.status !== 200) {
                alert('Ошибка')
            }
        },
    },
    watch: {
        'task.deadline': function (newVal, oldVal) {
            if (typeof newVal === 'number') { return; }
            if (newVal?.split('-')[0]?.length > 4) { this.task.deadline = oldVal; return; }
        }
    },
    async mounted() {
        await this.getUsernameAndProjectname();
    }
}
</script>

<style lang="scss" scoped></style> 