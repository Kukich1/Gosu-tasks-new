<template>
    <div>
        <v-row justify="center">
            <v-dialog :model-value="this.dialog" v-on:update:model-value="this.$emit('update:dialog', $event)" persistent
                width="1024">
                <v-card>
                    <v-card-title>{{ projectData.project.name }}</v-card-title>
                    <v-card-text>
                        {{ projectData.project.description }}
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue-darken-1" @click="closeDialog">Закрыть</v-btn>
                        <v-btn color="red" @click="deleteProject(projectData)">Удалить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    props:{
        dialog: Boolean,    
        projectData: Object,
        projectShow: Function,
    },
    mounted() {
        console.log("Значение пропса 'dialog':", this.dialog);
        console.log("Значение пропса 'projectData':", this.projectData);
    },
    methods: {
        getToken() {
            const token = localStorage.getItem("token");
            const cleanToken = token.replaceAll("\"", "");
            return {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
            };
        },
        closeDialog() {
            console.log("closeDialog is called");
            this.$emit('update:dialog', false)
        },
        async deleteProject(projectData) {
            try{
                const response = await axios.delete(`https://gosutasks-api.vercel.app/admin/delet_project/${projectData.project.id}`, this.getToken());
                console.log('Карточка успешно удалена:', response.data);
                this.projectShow();
                this.closeDialog();
            }catch{

            }
        },
    },

}
</script>

<style lang="scss" scoped>
.v-dialog.v-dialog--active::before {
    background-color: rgba(0, 0, 0, 0.01);
}
</style>