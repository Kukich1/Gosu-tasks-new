<template>
    <div>
        <v-menu v-model="menu" offset-y>
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
            </template>

            <v-list>
                <v-list-item @click="emitOpenDialog">Edit</v-list-item>
                <v-list-item class="red-text" @click="emitDeleteProject">Delete</v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>
  
<script>
export default {
    props: {
        projectData: Object,
    },
    data: () => ({
        menu: false,
    }),
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
        async deleteProject(projectData) {
            try {
                this.closeDialog();
                const response = await axios.delete(`https://gosutasks-api.vercel.app/admin/delet_project/${projectData.project.id}`, this.getToken());
                console.log('Карточка успешно удалена:', response.data);
                this.projectShow();
            } catch {

            }
        },
        emitOpenDialog() {
            this.$emit("openDialog");
        },
        emitDeleteProject() {
            this.$emit("deleteProject", this.projectData); 
        },
    },
};
</script>

<style lang="scss" scoped>
.red-text {
    color: red !important;
}
</style>