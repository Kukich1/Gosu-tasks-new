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
                        <span class="text-h5">Add New Project</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="project.name" label="Name Project" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea v-model="project.description" label="Description"></v-textarea>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="project.deadline" label="Deadline" type="date" required></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select v-model="value" :items="username" chips label="Choose user"
                                        multiple></v-select>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                            Close
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="createProject">
                            Save
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios'
import { ru } from 'date-fns/locale';

export default {
    props: ['disabled', 'getConfig','projectShow'],
    data() {
        return {
            dialog: false,
            username: [],
            value: [],
            project: {
                name: '',
                description: '',
                members: [],
                deadline: null,
                type: '',
                status: '',
            },
        }
    },
    methods: {
        async getUserName() {
            const token = localStorage.getItem("token");
            const cleanToken = token.replaceAll("\"", "");
            let config = {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
            };
            const response = await axios.get('https://gosutasks-api.vercel.app/admin/get_users_list', config)
            const username = response.data.map(obj => obj.username)
            this.username = username
            this.value = this.username
        },
        convertToTimestamp(date) {
            const timestamp = date ? new Date(date).getTime() : null;
            return timestamp.toString().length === 13 ? timestamp / 1000 : timestamp;
        },
        async createProject() {
            this.project.deadline = this.convertToTimestamp(this.project.deadline);
            const response = await axios.post('https://gosutasks-api.vercel.app/admin/create_project', this.project, this.getConfig())
            if (response.status === 200) {
                this.dialog = false;
                await this.projectShow();
            }
        },
    },
    async mounted() {
        await this.getUserName();
    }
}
</script>

<style lang="scss" scoped></style>