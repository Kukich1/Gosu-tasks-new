<template>
    <div>
        <v-row justify="center">
            <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" width="1024">
                <v-card>
                    <div class="p-5 pl-3 pr-3 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                        <div class="d-flex flex-column">
                            <div class="d-flex justify-space-between align-center">
                                <v-card-title class="text-truncate">{{ projectData.project.name }}</v-card-title>
                                <v-card-actions class="pa-2">
                                    <v-spacer></v-spacer>
                                    <div v-if="Role === 1">
                                        <VerticalThreeDots @openDialog="openDialog" @deleteProject="deleteProject(projectData)" />
                                    </div>
                                </v-card-actions>
                            </div>
                            <div class="p-5 pl-3">
                                Участники
                                <div class="d-flex flex-wrap mb-2 ">
                                    <v-chip
                                        v-for="(member, index) in projectData.project.members"
                                        :key="index"
                                        color="blue-darken-1"
                                        text-color="white"
                                        class="mr-2 mt-2"
                                    >
                                        {{ member }}
                                    </v-chip>
                                </div>
                            </div>
                            <v-card-text class="pr-13">
                                {{ projectData.project.description }}
                            </v-card-text>
                        </div>
                        <v-card-actions class="pa-2 justify-end">
                            <div v-if="Role === 1">
                                <v-btn color="green-accent-3" @click="completeProject(projectData)">Завершить</v-btn>
                            </div>
                        </v-card-actions>
                    </div>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios';
import VerticalThreeDots from '@/components/helps/VerticalThreeDots'
export default {
    components: {
        VerticalThreeDots
    },
    props: {
        Role: Number,
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
            try {
                this.closeDialog();
                const response = await axios.delete(`https://gosutasks-api.vercel.app/admin/delet_project/${projectData.project.id}`, this.getToken());
                console.log('Проект успешно удалена:', response.data);
                this.projectShow();
            } catch {

            }
        },
        async completeProject(projectData) {
            try{
                this.closeDialog();
                const response = await axios.patch(`https://gosutasks-api.vercel.app/admin/complete_project/${projectData.project.id}`, undefined ,this.getToken());
                console.log('Проект успешно завершон', response.data);
                this.projectShow();
            } catch {

            }
        },
    },

}
</script>

<style lang="scss" scoped>
.v-dialog.v-dialog--active::before {
    background-color: rgba(0, 0, 0, 0.01);
}
.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
  }
</style>