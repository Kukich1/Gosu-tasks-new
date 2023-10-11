<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent width="1024">
                <template v-slot:activator="{ props }">
                    <v-btn color="#65B2F0" v-bind="props" :disabled="this.disabled">
                        <v-icon icon="mdi-plus"></v-icon>Add New Project
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5 pl-8">Добавить новый проект</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="project.name" label="Имя Проекта" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea v-model="project.description" label="Описания"></v-textarea>
                                </v-col>
                                <v-col style="min-width: 350px;" cols="12" sm="6">
                                    <v-text-field v-model="project.deadline" label="Дедлайн" type="date" required
                                        :rules="[rules.date]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select v-model="project.members" :items="username" chips
                                        label="Выбрать пользователей" multiple
                                        @update:model-value="updateMembers"></v-select>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="closeCreateAndEditProject">
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
            project: {
                name: '',
                description: '',
                members: [],
                deadline: null,
            },
        }
    },
    methods: {
        closeCreateAndEditProject() {
            this.dialog = false;
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
        async createProject() {
            this.project.deadline = timestamp(this.project.deadline);
            this.dialog = false;
            const response = await axios.post('https://gosutasks-api.vercel.app/admin/create_project', this.project, this.getToken())
            if (response.status === 200) {
                this.projectShow();
                this.project.name = '';
                this.project.description = '';
            } else if (response.status !== 200) {
                alert('Ошибка')
            }

        },
    },
    watch: {
        'project.deadline': function (newVal, oldVal) {
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